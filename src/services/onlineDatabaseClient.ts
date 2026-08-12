export interface OnlineDbHealth {
  status: string;
  connected: boolean;
  engine: string;
  storagePath: string;
  totalCollections: number;
  totalRecords: number;
  collections: Record<string, number>;
  lastUpdated: string;
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
}

class OnlineDatabaseClient {
  private isOnline = false;
  private lastSyncTime: string | null = null;
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

  private setupWindowListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.fetchAll(true);
        this.flushPendingSync();
      });
      window.addEventListener('focus', () => {
        // Silent sync on focus if not synced recently
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

  public startAutoSync(intervalMs = 30000) {
    if (this.pollInterval) clearInterval(this.pollInterval);
    
    // Initial fetch after slight delay
    setTimeout(() => {
      this.fetchAll(true);
    }, 500);

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
    }, 600);
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

    // Rate-limit / Backoff guard
    if (Date.now() < this.backoffUntil) {
      // Re-schedule flush after backoff
      setTimeout(() => this.flushPendingSync(), this.backoffUntil - Date.now() + 100);
      return false;
    }

    if (this.isFlushInFlight) {
      // Re-schedule when current finish
      setTimeout(() => this.flushPendingSync(), 500);
      return false;
    }

    this.isFlushInFlight = true;
    const payloadToSend = { ...this.pendingQueue };
    // Clear pending keys that we are sending
    this.pendingQueue = {};

    try {
      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payloadToSend)
      });

      if (res.status === 429) {
        // Rate limited - backoff for 3 seconds and re-queue payload
        this.backoffUntil = Date.now() + 3000;
        this.pendingQueue = { ...payloadToSend, ...this.pendingQueue };
        setTimeout(() => this.flushPendingSync(), 3100);
        return false;
      }

      if (!res.ok) {
        // On 500 or other errors, backoff for 2 seconds and re-queue
        this.backoffUntil = Date.now() + 2000;
        this.pendingQueue = { ...payloadToSend, ...this.pendingQueue };
        return false;
      }

      const json = await res.json();
      if (json.success) {
        this.isOnline = true;
        this.lastSyncTime = new Date().toISOString();
        return true;
      }

      return false;
    } catch (err) {
      // Network failure: re-queue and wait
      this.backoffUntil = Date.now() + 2000;
      this.pendingQueue = { ...payloadToSend, ...this.pendingQueue };
      return false;
    } finally {
      this.isFlushInFlight = false;
    }
  }

  // Health check
  public async getHealth(): Promise<OnlineDbHealth> {
    try {
      const res = await fetch('/api/db/health', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.isOnline = data.connected === true;
      return data;
    } catch {
      this.isOnline = false;
      return {
        status: 'disconnected',
        connected: false,
        engine: 'Cloud Server (Connecting...)',
        storagePath: '/data/online_db.json',
        totalCollections: 0,
        totalRecords: 0,
        collections: {},
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Fetch complete database state
  public async fetchAll(silent = false): Promise<any | null> {
    if (this.isSyncing) return null;
    this.isSyncing = true;
    try {
      const res = await fetch('/api/db/all', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        this.isOnline = true;
        this.lastSyncTime = new Date().toISOString();
        this.notifyListeners(json.data);
        return json.data;
      }
      return null;
    } catch {
      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync entire batch state directly (used for manual restore or bulk sync)
  public async syncBatch(payload: any): Promise<boolean> {
    try {
      const res = await fetch('/api/db/sync', {
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
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Upsert Item in a collection
  public async upsertItem(collection: string, item: any): Promise<any | null> {
    try {
      const res = await fetch(`/api/db/collection/${collection}`, {
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
      const res = await fetch(`/api/db/collection/${collection}/${encodeURIComponent(id)}`, {
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
    try {
      const res = await fetch('/api/db/test-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        durationMs: 0,
        steps: [
          {
            step: 'Connection Diagnostic',
            status: 'FAILED',
            detail: err.message || 'Unable to communicate with online server database endpoint.',
            latencyMs: 0
          }
        ]
      };
    }
  }

  // Reset database to initial defaults
  public async resetToDefaults(): Promise<boolean> {
    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
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
      const res = await fetch('/api/db/backup');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stweb_cloud_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup download error:', err);
    }
  }

  // Restore database from JSON
  public async restoreFromData(data: any): Promise<boolean> {
    try {
      const res = await fetch('/api/db/restore', {
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
}

export const onlineDbClient = new OnlineDatabaseClient();
