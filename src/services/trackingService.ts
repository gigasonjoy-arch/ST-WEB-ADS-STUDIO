import { GtmSettings } from '../types';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: any;
    _fbq?: any;
    ttq?: any;
    _st_applied_pixels?: Record<string, string>;
    __st_loaded_tiktok_pixels?: Set<string>;
    __st_tiktok_warn_filter_applied?: boolean;
  }
}

/**
 * Safely serialize any dataLayer item into JSON string without circular reference or DOM Element crashes.
 */
export function safeSerializeEvent(obj: any, indent: number = 2): string {
  if (obj === null || obj === undefined) return String(obj);
  if (typeof obj !== 'object') {
    if (typeof obj === 'function') return `[Function: ${obj.name || 'anonymous'}]`;
    return String(obj);
  }

  const seen = new WeakSet();

  try {
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Handle DOM Elements and Nodes
          if (
            typeof window !== 'undefined' &&
            (value instanceof Element ||
              value instanceof Node ||
              (value.nodeType !== undefined && value.nodeName !== undefined))
          ) {
            const tagName = (value.tagName || value.nodeName || 'element').toLowerCase();
            const id = value.id ? `#${value.id}` : '';
            const className =
              typeof value.className === 'string' && value.className
                ? `.${value.className.split(' ').filter(Boolean).slice(0, 2).join('.')}`
                : '';
            return `<${tagName}${id}${className}>`;
          }

          // Handle Window or Document
          if (typeof window !== 'undefined' && (value === window || value === document)) {
            return value === window ? '[Window]' : '[Document]';
          }

          // Guard against circular references
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }

        // Filter out React Fiber properties & internal state nodes
        if (
          typeof key === 'string' &&
          (key.startsWith('__reactFiber') ||
            key.startsWith('__reactProps') ||
            key.startsWith('__reactEvents') ||
            key === 'stateNode' ||
            key === 'child' ||
            key === 'return' ||
            key === 'sibling')
        ) {
          return undefined;
        }

        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }

        return value;
      },
      indent
    );
  } catch (err) {
    return `[Unserializable Event: ${String(err)}]`;
  }
}

/**
 * Filter harmless duplicate pixel warnings from TikTok SDK if fired by GTM or multiple tags
 */
function setupConsoleWarningFilter() {
  if (typeof window === 'undefined' || window.__st_tiktok_warn_filter_applied) return;
  window.__st_tiktok_warn_filter_applied = true;

  const originalWarn = console.warn;
  console.warn = function (...args: any[]) {
    if (args.length > 0) {
      const firstArg = typeof args[0] === 'string' ? args[0] : '';
      if (
        firstArg.includes('[TikTok Pixel]') &&
        firstArg.includes('Duplicate Pixel ID')
      ) {
        // Suppress duplicate pixel ID noise cleanly
        return;
      }
    }
    return originalWarn.apply(console, args);
  };
}

class TrackingService {
  private appliedGtmId: string | null = null;
  private appliedGaId: string | null = null;
  private appliedMetaPixelId: string | null = null;
  private appliedTikTokPixelId: string | null = null;
  private appliedHeadScript: string | null = null;
  private appliedBodyScript: string | null = null;

  private gtmScriptElement: HTMLScriptElement | null = null;
  private gtmNoscriptElement: HTMLElement | null = null;
  private gaScriptElement: HTMLScriptElement | null = null;
  private metaPixelScriptElement: HTMLScriptElement | null = null;
  private tiktokPixelScriptElement: HTMLScriptElement | null = null;
  private customHeadElement: HTMLElement | null = null;
  private customBodyElement: HTMLElement | null = null;

  constructor() {
    setupConsoleWarningFilter();
  }

  public initialize(settings: GtmSettings): void {
    setupConsoleWarningFilter();

    // Ensure dataLayer array exists on window
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.__st_loaded_tiktok_pixels = window.__st_loaded_tiktok_pixels || new Set<string>();
    }

    if (!settings || !settings.enabled) {
      this.cleanup();
      return;
    }

    this.applyGtm(settings.containerId);
    this.applyGoogleAnalytics(settings.googleAnalyticsId);
    this.applyMetaPixel(settings.metaPixelId);
    this.applyTikTokPixel(settings.tiktokPixelId, !!settings.containerId);
    this.applyCustomScripts(settings.customHeadScript, settings.customBodyScript);
  }

  public pushEvent(eventName: string, params: Record<string, any> = {}): void {
    if (typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];
    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...params
    };

    window.dataLayer.push(payload);

    // If Meta Pixel exists, trigger standard or custom event
    if (typeof window.fbq === 'function') {
      try {
        if (eventName === 'generate_lead' || eventName === 'lead_submission') {
          window.fbq('track', 'Lead', params);
        } else if (eventName === 'page_view') {
          window.fbq('track', 'PageView');
        } else {
          window.fbq('trackCustom', eventName, params);
        }
      } catch (e) {
        console.debug('Meta Pixel track notice:', e);
      }
    }

    // If TikTok Pixel exists, trigger standard or custom event
    if (window.ttq && typeof window.ttq.track === 'function') {
      try {
        if (eventName === 'generate_lead' || eventName === 'lead_submission') {
          window.ttq.track('SubmitForm', params);
        } else if (eventName === 'page_view') {
          window.ttq.track('PageView');
        } else {
          window.ttq.track(eventName, params);
        }
      } catch (e) {
        console.debug('TikTok Pixel track notice:', e);
      }
    }

    // If Google Analytics exists, push gtag event
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, params);
      } catch (e) {
        console.debug('GA4 event notice:', e);
      }
    }
  }

  public getRecentDataLayerEvents(): any[] {
    if (typeof window === 'undefined' || !window.dataLayer || !Array.isArray(window.dataLayer)) return [];
    try {
      return window.dataLayer.slice(-25).map(item => this.sanitizeDataLayerItem(item));
    } catch {
      return [];
    }
  }

  private sanitizeDataLayerItem(item: any, depth: number = 0, seen: WeakSet<any> = new WeakSet()): any {
    if (depth > 5) return '[Deep Object]';
    if (item === null || item === undefined) return item;
    if (typeof item === 'function') return `[Function: ${item.name || 'anonymous'}]`;
    if (typeof item !== 'object') return item;

    // Check for DOM Element / Node
    if (
      typeof window !== 'undefined' &&
      (item instanceof Element ||
        item instanceof Node ||
        (item.nodeType !== undefined && item.nodeName !== undefined))
    ) {
      const tag = (item.tagName || item.nodeName || 'element').toLowerCase();
      const id = item.id ? `#${item.id}` : '';
      const cls =
        typeof item.className === 'string' && item.className
          ? `.${item.className.split(' ').filter(Boolean).slice(0, 2).join('.')}`
          : '';
      return `<${tag}${id}${cls}>`;
    }

    // Check for Window / Document
    if (typeof window !== 'undefined' && (item === window || item === document)) {
      return item === window ? '[Window]' : '[Document]';
    }

    if (seen.has(item)) return '[Circular]';
    seen.add(item);

    if (Array.isArray(item)) {
      return item.map(sub => this.sanitizeDataLayerItem(sub, depth + 1, seen));
    }

    const cleanObj: Record<string, any> = {};
    for (const key of Object.keys(item)) {
      // Skip React Fiber & internal DOM properties
      if (
        key.startsWith('__reactFiber') ||
        key.startsWith('__reactProps') ||
        key.startsWith('__reactEvents') ||
        key === 'stateNode' ||
        key === 'child' ||
        key === 'return' ||
        key === 'sibling'
      ) {
        continue;
      }
      try {
        cleanObj[key] = this.sanitizeDataLayerItem(item[key], depth + 1, seen);
      } catch {
        cleanObj[key] = '[Unserializable]';
      }
    }
    return cleanObj;
  }

  private applyGtm(containerId?: string): void {
    const cleanId = containerId?.trim();
    if (!cleanId || cleanId === 'GTM-XXXXXXX' || !cleanId.startsWith('GTM-')) {
      if (this.gtmScriptElement) {
        this.gtmScriptElement.remove();
        this.gtmScriptElement = null;
      }
      if (this.gtmNoscriptElement) {
        this.gtmNoscriptElement.remove();
        this.gtmNoscriptElement = null;
      }
      this.appliedGtmId = null;
      return;
    }

    // Check if GTM is already initialized or already exists in DOM (e.g. index.html or previous run)
    const gtmAlreadyInDoc = typeof document !== 'undefined' && (
      document.getElementById('st-gtm-head') !== null ||
      Array.from(document.querySelectorAll('script')).some(s => 
        (s.src && s.src.includes(`googletagmanager.com/gtm.js?id=${cleanId}`)) ||
        (s.innerHTML && s.innerHTML.includes(`'${cleanId}'`))
      )
    );

    if (gtmAlreadyInDoc || this.appliedGtmId === cleanId) {
      this.appliedGtmId = cleanId;
      return;
    }

    // Remove previous script element if registered
    if (this.gtmScriptElement) {
      this.gtmScriptElement.remove();
      this.gtmScriptElement = null;
    }
    if (this.gtmNoscriptElement) {
      this.gtmNoscriptElement.remove();
      this.gtmNoscriptElement = null;
    }

    try {
      // 1. Google Tag Manager Head Script
      const script = document.createElement('script');
      script.id = 'st-gtm-head';
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${cleanId}');`;
      document.head.appendChild(script);
      this.gtmScriptElement = script;

      // 2. Google Tag Manager Noscript Body Frame
      const noscript = document.createElement('noscript');
      noscript.id = 'st-gtm-body';
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${cleanId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
      this.gtmNoscriptElement = noscript;

      this.appliedGtmId = cleanId;
    } catch (e) {
      console.warn('GTM injection notice:', e);
    }
  }

  private applyGoogleAnalytics(gaId?: string): void {
    const cleanId = gaId?.trim();
    if (!cleanId || !cleanId.startsWith('G-')) {
      if (this.gaScriptElement) {
        this.gaScriptElement.remove();
        this.gaScriptElement = null;
      }
      const gaInit = document.getElementById('st-ga4-init');
      if (gaInit) gaInit.remove();
      this.appliedGaId = null;
      return;
    }

    // Deduplication check: if already initialized with this GA ID, skip
    const gaAlreadyInDoc = typeof document !== 'undefined' && (
      document.getElementById('st-ga4-script') !== null ||
      Array.from(document.querySelectorAll('script')).some(s =>
        s.src && s.src.includes(`googletagmanager.com/gtag/js?id=${cleanId}`)
      )
    );

    if (gaAlreadyInDoc || this.appliedGaId === cleanId) {
      this.appliedGaId = cleanId;
      return;
    }

    if (this.gaScriptElement) {
      this.gaScriptElement.remove();
      this.gaScriptElement = null;
    }
    const gaInit = document.getElementById('st-ga4-init');
    if (gaInit) gaInit.remove();

    try {
      const scriptTag = document.createElement('script');
      scriptTag.id = 'st-ga4-script';
      scriptTag.async = true;
      scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
      document.head.appendChild(scriptTag);

      const initTag = document.createElement('script');
      initTag.id = 'st-ga4-init';
      initTag.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${cleanId}');
      `;
      document.head.appendChild(initTag);
      this.gaScriptElement = scriptTag;
      this.appliedGaId = cleanId;
    } catch (e) {
      console.warn('GA4 injection notice:', e);
    }
  }

  private applyMetaPixel(pixelId?: string): void {
    const cleanId = pixelId?.trim();
    if (!cleanId || !/^\d+$/.test(cleanId)) {
      if (this.metaPixelScriptElement) {
        this.metaPixelScriptElement.remove();
        this.metaPixelScriptElement = null;
      }
      this.appliedMetaPixelId = null;
      return;
    }

    // Deduplication check: if already applied with this Meta Pixel ID or in doc, do not re-run fbq init
    const metaAlreadyInDoc = typeof document !== 'undefined' && (
      document.getElementById('st-meta-pixel') !== null ||
      Array.from(document.querySelectorAll('script')).some(s =>
        s.innerHTML && s.innerHTML.includes(`fbq('init', '${cleanId}')`)
      )
    );

    if (metaAlreadyInDoc || (this.appliedMetaPixelId === cleanId && typeof (window as any).fbq === 'function')) {
      this.appliedMetaPixelId = cleanId;
      return;
    }

    if (this.metaPixelScriptElement) {
      this.metaPixelScriptElement.remove();
      this.metaPixelScriptElement = null;
    }

    try {
      const script = document.createElement('script');
      script.id = 'st-meta-pixel';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${cleanId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
      this.metaPixelScriptElement = script;
      this.appliedMetaPixelId = cleanId;
    } catch (e) {
      console.warn('Meta Pixel injection notice:', e);
    }
  }

  private applyTikTokPixel(pixelId?: string, isGtmActive: boolean = false): void {
    const cleanId = pixelId?.trim();
    
    // If pixelId is empty, remove direct script if any and exit
    if (!cleanId) {
      if (this.tiktokPixelScriptElement) {
        this.tiktokPixelScriptElement.remove();
        this.tiktokPixelScriptElement = null;
      }
      this.appliedTikTokPixelId = null;
      return;
    }

    // STRICT DEDUPLICATION AND GTM GUARD:
    // If GTM is already active and handling tags, or if pixel ID has already been registered
    window.__st_loaded_tiktok_pixels = window.__st_loaded_tiktok_pixels || new Set<string>();

    if (window.__st_loaded_tiktok_pixels.has(cleanId)) {
      this.appliedTikTokPixelId = cleanId;
      return;
    }

    const tiktokAlreadyInDoc = typeof document !== 'undefined' && (
      document.getElementById('st-tiktok-pixel') !== null ||
      Array.from(document.querySelectorAll('script')).some(s =>
        (s.src && s.src.includes(`sdkid=${cleanId}`)) ||
        (s.innerHTML && s.innerHTML.includes(`ttq.load('${cleanId}')`))
      )
    );

    const ttqAlreadyLoaded = typeof window !== 'undefined' &&
      Boolean((window as any).ttq && (window as any).ttq._i && (window as any).ttq._i[cleanId]);

    if (isGtmActive || this.appliedTikTokPixelId === cleanId || tiktokAlreadyInDoc || ttqAlreadyLoaded) {
      window.__st_loaded_tiktok_pixels.add(cleanId);
      this.appliedTikTokPixelId = cleanId;
      return;
    }

    if (this.tiktokPixelScriptElement) {
      this.tiktokPixelScriptElement.remove();
      this.tiktokPixelScriptElement = null;
    }

    try {
      window.__st_loaded_tiktok_pixels.add(cleanId);
      const script = document.createElement('script');
      script.id = 'st-tiktok-pixel';
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
          ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
          ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
          for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
          ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
          ttq.load=function(e,n){
            ttq._i=ttq._i||{};
            if(ttq._i[e]){return;}
            var i="https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
            var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
            var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a);
          };
          if (!ttq._i || !ttq._i['${cleanId}']) {
            ttq.load('${cleanId}');
            ttq.page();
          }
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
      this.tiktokPixelScriptElement = script;
      this.appliedTikTokPixelId = cleanId;
    } catch (e) {
      console.warn('TikTok Pixel injection notice:', e);
    }
  }

  private applyCustomScripts(headScript?: string, bodyScript?: string): void {
    const cleanHead = headScript?.trim() || '';
    const cleanBody = bodyScript?.trim() || '';

    // Handle Head Script
    if (this.appliedHeadScript !== cleanHead) {
      if (this.customHeadElement) {
        this.customHeadElement.remove();
        this.customHeadElement = null;
      }
      if (cleanHead) {
        try {
          const container = document.createElement('div');
          container.id = 'st-custom-head-container';
          container.innerHTML = cleanHead;
          document.head.appendChild(container);
          this.customHeadElement = container;
        } catch (e) {
          console.warn('Custom Head Script notice:', e);
        }
      }
      this.appliedHeadScript = cleanHead;
    }

    // Handle Body Script
    if (this.appliedBodyScript !== cleanBody) {
      if (this.customBodyElement) {
        this.customBodyElement.remove();
        this.customBodyElement = null;
      }
      if (cleanBody) {
        try {
          const container = document.createElement('div');
          container.id = 'st-custom-body-container';
          container.innerHTML = cleanBody;
          document.body.appendChild(container);
          this.customBodyElement = container;
        } catch (e) {
          console.warn('Custom Body Script notice:', e);
        }
      }
      this.appliedBodyScript = cleanBody;
    }
  }

  public cleanup(): void {
    if (this.gtmScriptElement) {
      this.gtmScriptElement.remove();
      this.gtmScriptElement = null;
    }
    if (this.gtmNoscriptElement) {
      this.gtmNoscriptElement.remove();
      this.gtmNoscriptElement = null;
    }
    if (this.gaScriptElement) {
      this.gaScriptElement.remove();
      this.gaScriptElement = null;
    }
    const gaInit = document.getElementById('st-ga4-init');
    if (gaInit) gaInit.remove();

    if (this.metaPixelScriptElement) {
      this.metaPixelScriptElement.remove();
      this.metaPixelScriptElement = null;
    }
    if (this.tiktokPixelScriptElement) {
      this.tiktokPixelScriptElement.remove();
      this.tiktokPixelScriptElement = null;
    }
    if (this.customHeadElement) {
      this.customHeadElement.remove();
      this.customHeadElement = null;
    }
    if (this.customBodyElement) {
      this.customBodyElement.remove();
      this.customBodyElement = null;
    }

    this.appliedGtmId = null;
    this.appliedGaId = null;
    this.appliedMetaPixelId = null;
    this.appliedTikTokPixelId = null;
    this.appliedHeadScript = null;
    this.appliedBodyScript = null;
  }
}

export const trackingService = new TrackingService();
