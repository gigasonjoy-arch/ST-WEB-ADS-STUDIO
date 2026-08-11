import { GtmSettings } from '../types';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: any;
    _fbq?: any;
    ttq?: any;
  }
}

class TrackingService {
  private currentSettings: GtmSettings | null = null;
  private gtmScriptElement: HTMLScriptElement | null = null;
  private gtmNoscriptElement: HTMLElement | null = null;
  private gaScriptElement: HTMLScriptElement | null = null;
  private metaPixelScriptElement: HTMLScriptElement | null = null;
  private tiktokPixelScriptElement: HTMLScriptElement | null = null;
  private customHeadElement: HTMLElement | null = null;
  private customBodyElement: HTMLElement | null = null;

  public initialize(settings: GtmSettings): void {
    this.currentSettings = settings;

    // Ensure dataLayer array exists on window
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
    }

    if (!settings.enabled) {
      this.cleanup();
      return;
    }

    this.applyGtm(settings.containerId);
    this.applyGoogleAnalytics(settings.googleAnalyticsId);
    this.applyMetaPixel(settings.metaPixelId);
    this.applyTikTokPixel(settings.tiktokPixelId);
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
      if (eventName === 'generate_lead' || eventName === 'lead_submission') {
        window.fbq('track', 'Lead', params);
      } else if (eventName === 'page_view') {
        window.fbq('track', 'PageView');
      } else {
        window.fbq('trackCustom', eventName, params);
      }
    }

    // If TikTok Pixel exists, trigger standard or custom event
    if (window.ttq && typeof window.ttq.track === 'function') {
      if (eventName === 'generate_lead' || eventName === 'lead_submission') {
        window.ttq.track('SubmitForm', params);
      } else if (eventName === 'page_view') {
        window.ttq.track('PageView');
      } else {
        window.ttq.track(eventName, params);
      }
    }

    // If Google Analytics exists, push gtag event
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  }

  public getRecentDataLayerEvents(): any[] {
    if (typeof window === 'undefined' || !window.dataLayer) return [];
    return window.dataLayer.slice(-20);
  }

  private applyGtm(containerId?: string): void {
    if (!containerId || containerId === 'GTM-XXXXXXX' || !containerId.startsWith('GTM-')) {
      return;
    }

    // Remove old script if exists
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
})(window,document,'script','dataLayer','${containerId}');`;
      document.head.appendChild(script);
      this.gtmScriptElement = script;

      // 2. Google Tag Manager Noscript Body Frame
      const noscript = document.createElement('noscript');
      noscript.id = 'st-gtm-body';
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
      this.gtmNoscriptElement = noscript;
    } catch (e) {
      console.warn('GTM injection notice:', e);
    }
  }

  private applyGoogleAnalytics(gaId?: string): void {
    if (!gaId || !gaId.trim().startsWith('G-')) {
      if (this.gaScriptElement) {
        this.gaScriptElement.remove();
        this.gaScriptElement = null;
      }
      return;
    }

    if (this.gaScriptElement) {
      this.gaScriptElement.remove();
    }

    try {
      const scriptTag = document.createElement('script');
      scriptTag.id = 'st-ga4-script';
      scriptTag.async = true;
      scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${gaId.trim()}`;
      document.head.appendChild(scriptTag);

      const initTag = document.createElement('script');
      initTag.id = 'st-ga4-init';
      initTag.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId.trim()}');
      `;
      document.head.appendChild(initTag);
      this.gaScriptElement = scriptTag;
    } catch (e) {
      console.warn('GA4 injection notice:', e);
    }
  }

  private applyMetaPixel(pixelId?: string): void {
    if (!pixelId || !pixelId.trim() || !/^\d+$/.test(pixelId.trim())) {
      if (this.metaPixelScriptElement) {
        this.metaPixelScriptElement.remove();
        this.metaPixelScriptElement = null;
      }
      return;
    }

    if (this.metaPixelScriptElement) {
      this.metaPixelScriptElement.remove();
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
        fbq('init', '${pixelId.trim()}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
      this.metaPixelScriptElement = script;
    } catch (e) {
      console.warn('Meta Pixel injection notice:', e);
    }
  }

  private applyTikTokPixel(pixelId?: string): void {
    if (!pixelId || !pixelId.trim()) {
      if (this.tiktokPixelScriptElement) {
        this.tiktokPixelScriptElement.remove();
        this.tiktokPixelScriptElement = null;
      }
      return;
    }

    if (this.tiktokPixelScriptElement) {
      this.tiktokPixelScriptElement.remove();
    }

    try {
      const script = document.createElement('script');
      script.id = 'st-tiktok-pixel';
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${pixelId.trim()}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
      this.tiktokPixelScriptElement = script;
    } catch (e) {
      console.warn('TikTok Pixel injection notice:', e);
    }
  }

  private applyCustomScripts(headScript?: string, bodyScript?: string): void {
    if (this.customHeadElement) {
      this.customHeadElement.remove();
      this.customHeadElement = null;
    }
    if (this.customBodyElement) {
      this.customBodyElement.remove();
      this.customBodyElement = null;
    }

    if (headScript && headScript.trim()) {
      try {
        const container = document.createElement('div');
        container.id = 'st-custom-head-container';
        container.innerHTML = headScript;
        document.head.appendChild(container);
        this.customHeadElement = container;
      } catch (e) {
        console.warn('Custom Head Script notice:', e);
      }
    }

    if (bodyScript && bodyScript.trim()) {
      try {
        const container = document.createElement('div');
        container.id = 'st-custom-body-container';
        container.innerHTML = bodyScript;
        document.body.appendChild(container);
        this.customBodyElement = container;
      } catch (e) {
        console.warn('Custom Body Script notice:', e);
      }
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
  }
}

export const trackingService = new TrackingService();
