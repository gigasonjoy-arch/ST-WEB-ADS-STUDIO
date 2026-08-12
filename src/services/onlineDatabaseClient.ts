export interface OnlineDbHealth {
  status: string;
  connected: boolean;
  engine: string;
  storagePath: string;
  totalCollections: number;
  totalRecords: number;
  collections: Record<string, number>;
  lastUpdated: string;
  endpointUrl?: string;
  mode?: 'DIRECT_SAME_ORIGIN' | 'REMOTE_CLOUD_BRIDGE' | 'CUSTOM_ENDPOINT';
  latencyMs?: number;
}

export interface CrudTestStep {
  step: string;
  status: 'SUCCESS' | 'FAILED';
  detail: string;
  latencyMs: number;
}

export interface CrudTestReport {
  success: boolean;
  timestamp: string;
  durationMs: number;
  steps: CrudTestStep[];
  endpointUsed?: string;
}

export interface EndpointConfig {
  activeUrl: string;
  customUrl: string | null;
  mode: 'DIRECT_SAME_ORIGIN' | 'REMOTE_CLOUD_BRIDGE' | 'CUSTOM_ENDPOINT';
  defaultCloudUrl: string;
  isCustom: boolean;
}

const DEFAULT_CLOUD_ENDPOINT = 'https://ais-pre-gddtnvmgg7qyt6klszb5gb-516905733162.asia-southeast1.run.app';
const CUSTOM_ENDPOINT_KEY = 'st_online_db_custom_url';

class OnlineDatabaseClient {
  private isOnline = false;
  private lastSyncTime: string | null = null;
  private lastSyncError: string | null = null;
  private isSyncing = false;
  private syncListeners: Set<(data: any) => void> = new Set();
  private pollInterval: any = null;

  // Queue and debounce buffer
  private pendingQueue: Record<string, any> = {};
  private debounceTimer: any = null;
  private isFlushInFlight = false;
  private backoffUntil = 0;

  constructor() {
    this.startAutoSync();
    this.setupWindowListeners();
  }

  /**
   * Smart resolver for the API base URL
   */
  public getApiBaseUrl(): string {
    if (typeof window === 'undefined') return '';

    // 1. Explicit user-customized URL
    const custom = localStorage.getItem(CUSTOM_ENDPOINT_KEY);
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, '');
    }

    const host = window.location.hostname;
    // 2. Direct same-origin on Node server / Cloud Run / localhost
    if (host === 'localhost' || host === '127.0.0.1' || host.includes('run.app')) {
      return '';
    }

    // 3. Static external deployments (Netlify, Vercel, GitHub Pages, etc.)
    return DEFAULT_CLOUD_ENDPOINT;
  }

  public getEndpointConfig(): EndpointConfig {
    const custom = typeof window !== 'undefined' ? localStorage.getItem(CUSTOM_ENDPOINT_KEY) : null;
    const base = this.getApiBaseUrl();
    let mode: 'DIRECT_SAME_ORIGIN' | 'REMOTE_CLOUD_BRIDGE' | 'CUSTOM_ENDPOINT' = 'DIRECT_SAME_ORIGIN';

    if (custom && custom.trim()) {
      mode = 'CUSTOM_ENDPOINT';
    } else if (base.length > 0) {
      mode = 'REMOTE_CLOUD_BRIDGE';
    }

    return {
      activeUrl: base || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
      customUrl: custom,
      mode,
      defaultCloudUrl: DEFAULT_CLOUD_ENDPOINT,
      isCustom: !!(custom && custom.trim())
    };
  }

  public setCustomEndpoint(url: string | null): void {
    if (typeof window === 'undefined') return;
    if (url && url.trim().length > 0) {
      localStorage.setItem(CUSTOM_ENDPOINT_KEY, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(CUSTOM_ENDPOINT_KEY);
    }
    // Trigger immediate health test and poll
    this.fetchAll(true);
  }

  public getFullUrl(path: string): string {
    const base = this.getApiBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return base ? `${base}${cleanPath}` : cleanPath;
  }

  private setupWindowListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.fetchAll(true);
        this.flushPendingSync();
      });
      window.addEventListener('focus', () => {
        const last = this.lastSyncTime ? new Date(this.lastSyncTime).getTime() : 0;
        if (Date.now() - last > 20000) {
          this.fetchAll(true);
        }
      });
    }
  }

  public subscribe(listener: (data: any) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private notifyListeners(data: any) {
    this.syncListeners.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error('OnlineDb listener error:', err);
      }
    });
  }

  public startAutoSync(intervalMs = 25000) {
    if (this.pollInterval) clearInterval(this.pollInterval);
    
    // Initial fetch after slight delay
    setTimeout(() => {
      this.fetchAll(true);
    }, 400);

    this.pollInterval = setInterval(() => {
      this.fetchAll(true); // background silent poll
    }, intervalMs);
  }

  public stopAutoSync() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Enqueue a collection update to be sent in a debounced batch
   */
  public queueCollectionSync(collectionName: string, data: any) {
    this.pendingQueue[collectionName] = data;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushPendingSync();
    }, 400);
  }

  /**
   * Flushes all pending queued collections to the online database
   */
  public async flushPendingSync(): Promise<boolean> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (Object.keys(this.pendingQueue).length === 0) {
      return true;
    }

    if (Date.now() < this.backoffUntil) {
      setTimeout(() => this.flushPendingSync(), this.backoffUntil - Date.now() + 100);
      return false;
    }

    if (this.isFlushInFlight) {
      setTimeout(() => this.flushPendingSync(), 400);
      return false;
    }

    this.isFlushInFlight = true;
    const payloadToSend = { ...this.pendingQueue };
    this.pendingQueue = {};

    try {
      const url = this.getFullUrl('/api/db/sync');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payloadToSend)
      });

      if (res.status === 429) {
        this.backoffUntil = Date.now() + 3000;
        this.pendingQueue = { ...payloadToSend, ...this.pendingQueue };
        setTimeout(() => this.flushPendingSync(), 3100);
        return false;
      }

      if (!res.ok) {
        this.backoffUntil = Date.now() + 2000;
        this.pendingQueue = { ...payloadToSend, ...this.pendingQueue };
        this.lastSyncError = `HTTP ${res.status}: ${res.statusText}`;
        return false;
      }

      const json = await res.json();
      if (json.success) {
        this.isOnline = true;
        this.lastSyncTime = new Date().toISOString();
        this.lastSyncError = null;
        return true;
      }

      return false;
    } catch (err: any) {
      this.backoffUntil = Date.now() + 2000;
      this.pendingQueue = { ...payloadToSend, ...this.pendingQueue };
      this.lastSyncError = err?.message || 'Network connection failed';
      return false;
    } finally {
      this.isFlushInFlight = false;
    }
  }

  // Health check
  public async getHealth(): Promise<OnlineDbHealth> {
    const startTime = Date.now();
    const config = this.getEndpointConfig();
    try {
      const url = this.getFullUrl('/api/db/health');
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const latencyMs = Date.now() - startTime;
      this.isOnline = data.connected === true;
      return {
        ...data,
        endpointUrl: config.activeUrl,
        mode: config.mode,
        latencyMs
      };
    } catch (err: any) {
      this.isOnline = false;
      return {
        status: 'disconnected',
        connected: false,
        engine: 'Cloud Server (Connecting...)',
        storagePath: '/data/online_db.json',
        totalCollections: 0,
        totalRecords: 0,
        collections: {},
        lastUpdated: new Date().toISOString(),
        endpointUrl: config.activeUrl,
        mode: config.mode,
        latencyMs: 0
      };
    }
  }

  // Fetch complete database state
  public async fetchAll(_silent = false): Promise<any | null> {
    if (this.isSyncing) return null;
    this.isSyncing = true;
    try {
      const url = this.getFullUrl('/api/db/all');
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        this.isOnline = true;
        this.lastSyncTime = new Date().toISOString();
        this.lastSyncError = null;
        this.notifyListeners(json.data);
        return json.data;
      }
      return null;
    } catch (err: any) {
      this.lastSyncError = err?.message || 'Fetch failed';
      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync entire batch state directly (used for manual restore or bulk sync)
  public async syncBatch(payload: any): Promise<boolean> {
    try {
      const url = this.getFullUrl('/api/db/sync');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return false;
      const json = await res.json();
      if (json.success) {
        this.isOnline = true;
        this.lastSyncTime = new Date().toISOString();
        this.lastSyncError = null;
        return true;
      }
      return false;
    } catch (err: any) {
      this.lastSyncError = err?.message || 'Sync failed';
      return false;
    }
  }

  // Upsert Item in a collection
  public async upsertItem(collection: string, item: any): Promise<any | null> {
    try {
      const url = this.getFullUrl(`/api/db/collection/${collection}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  // Delete item from a collection
  public async deleteItem(collection: string, id: string): Promise<boolean> {
    try {
      const url = this.getFullUrl(`/api/db/collection/${collection}/${encodeURIComponent(id)}`);
      const res = await fetch(url, {
        method: 'DELETE'
      });
      if (!res.ok) return false;
      const json = await res.json();
      return json.success === true;
    } catch {
      return false;
    }
  }

  // Run live CRUD test on online server
  public async runLiveCrudTest(): Promise<CrudTestReport> {
    const config = this.getEndpointConfig();
    try {
      const url = this.getFullUrl('/api/db/test-crud');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const report: CrudTestReport = await res.json();
      report.endpointUsed = config.activeUrl;
      return report;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        durationMs: 0,
        endpointUsed: config.activeUrl,
        steps: [
          {
            step: '1. Online Endpoint Handshake',
            status: 'FAILED',
            detail: `Unable to connect to ${config.activeUrl} (${err.message || 'Network error'}). Ensure backend is online.`,
            latencyMs: 0
          }
        ]
      };
    }
  }

  // Reset database to initial defaults
  public async resetToDefaults(): Promise<boolean> {
    try {
      const url = this.getFullUrl('/api/db/reset');
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) return false;
      const json = await res.json();
      if (json.success) {
        await this.fetchAll();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Download full JSON backup
  public async downloadBackup() {
    try {
      const url = this.getFullUrl('/api/db/backup');
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `stweb_cloud_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Backup download error:', err);
    }
  }

  // Restore database from JSON
  public async restoreFromData(data: any): Promise<boolean> {
    try {
      const url = this.getFullUrl('/api/db/restore');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return false;
      const json = await res.json();
      if (json.success) {
        await this.fetchAll();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public getLastSyncTime(): string | null {
    return this.lastSyncTime;
  }

  public getLastSyncError(): string | null {
    return this.lastSyncError;
  }
}

export const onlineDbClient = new OnlineDatabaseClient();
