import { ColorPalette, SiteThemeSettings, FaviconSettings } from '../types';

export const DEFAULT_COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'classic-olive',
    nameEn: 'Classic Olive & Warm Cream (Signature)',
    nameBn: 'ক্লাসিক অলিভ ও ওয়ার্ম ক্রিম (সিগনেচার)',
    backgroundColor: '#FDFCF8',
    textColor: '#2C3327',
    headingColor: '#1E231B',
    buttonBgColor: '#4A5D3B',
    buttonTextColor: '#FFFFFF',
    buttonHoverBgColor: '#3A4533',
    accentColor: '#E2725B',
    linkColor: '#4A5D3B',
    borderColor: '#D9DED1',
    cardBgColor: '#FFFFFF',
    sectionBgColor: '#F4F6F0',
    headerBgColor: '#FDFCF8',
    headerTextColor: '#2C3327',
    footerBgColor: '#1E231B',
    footerTextColor: '#D9DED1',
    badgeBgColor: '#E8EAE2',
    badgeTextColor: '#4A5D3B'
  },
  {
    id: 'warm-terracotta',
    nameEn: 'Warm Terracotta & Sand (High-Converting DTC)',
    nameBn: 'ওয়ার্ম টেরাকোটা ও স্যান্ড (হাই-কনভার্টিং DTC)',
    backgroundColor: '#FAF8F5',
    textColor: '#2B2520',
    headingColor: '#1A1410',
    buttonBgColor: '#C85A32',
    buttonTextColor: '#FFFFFF',
    buttonHoverBgColor: '#A94824',
    accentColor: '#2D6A4F',
    linkColor: '#C85A32',
    borderColor: '#E8DFD5',
    cardBgColor: '#FFFFFF',
    sectionBgColor: '#F3ECE3',
    headerBgColor: '#FAF8F5',
    headerTextColor: '#2B2520',
    footerBgColor: '#1F1915',
    footerTextColor: '#E8DFD5',
    badgeBgColor: '#F7EBE5',
    badgeTextColor: '#C85A32'
  },
  {
    id: 'emerald-luxury',
    nameEn: 'Emerald Luxury & Slate (Premium Agency)',
    nameBn: 'এমেরাল্ড লাক্সারি ও স্লেট (প্রিমিয়াম এজেন্সি)',
    backgroundColor: '#F8FAFC',
    textColor: '#1E293B',
    headingColor: '#0F172A',
    buttonBgColor: '#059669',
    buttonTextColor: '#FFFFFF',
    buttonHoverBgColor: '#047857',
    accentColor: '#F59E0B',
    linkColor: '#059669',
    borderColor: '#E2E8F0',
    cardBgColor: '#FFFFFF',
    sectionBgColor: '#F1F5F9',
    headerBgColor: '#F8FAFC',
    headerTextColor: '#0F172A',
    footerBgColor: '#0F172A',
    footerTextColor: '#CBD5E1',
    badgeBgColor: '#D1FAE5',
    badgeTextColor: '#065F46'
  },
  {
    id: 'midnight-navy',
    nameEn: 'Midnight Navy & Electric Blue (Modern Dark Tech)',
    nameBn: 'মিডনাইট নেভি ও ব্লু (মডার্ন ডার্ক টেক)',
    backgroundColor: '#0F172A',
    textColor: '#E2E8F0',
    headingColor: '#F8FAFC',
    buttonBgColor: '#0284C7',
    buttonTextColor: '#FFFFFF',
    buttonHoverBgColor: '#0369A1',
    accentColor: '#38BDF8',
    linkColor: '#38BDF8',
    borderColor: '#1E293B',
    cardBgColor: '#1E293B',
    sectionBgColor: '#0B1120',
    headerBgColor: '#0F172A',
    headerTextColor: '#F8FAFC',
    footerBgColor: '#020617',
    footerTextColor: '#94A3B8',
    badgeBgColor: '#0369A1',
    badgeTextColor: '#E0F2FE'
  },
  {
    id: 'slate-corporate',
    nameEn: 'Slate Minimalist (Corporate & Clean)',
    nameBn: 'স্লেট মিনিমালিস্ট (ক্লিন ও কর্পোরেট)',
    backgroundColor: '#F9FAFB',
    textColor: '#1F2937',
    headingColor: '#111827',
    buttonBgColor: '#1F2937',
    buttonTextColor: '#FFFFFF',
    buttonHoverBgColor: '#111827',
    accentColor: '#4F46E5',
    linkColor: '#4F46E5',
    borderColor: '#E5E7EB',
    cardBgColor: '#FFFFFF',
    sectionBgColor: '#F3F4F6',
    headerBgColor: '#F9FAFB',
    headerTextColor: '#111827',
    footerBgColor: '#111827',
    footerTextColor: '#9CA3AF',
    badgeBgColor: '#EEF2FF',
    badgeTextColor: '#4338CA'
  }
];

export const DEFAULT_THEME_SETTINGS: SiteThemeSettings = {
  activePaletteId: 'classic-olive',
  ...DEFAULT_COLOR_PALETTES[0],
  customCss: ''
};

export const DEFAULT_FAVICON_SETTINGS: FaviconSettings = {
  faviconUrl: '',
  faviconType: 'SVG_TEXT',
  badgeText: 'ST',
  faviconEmoji: '📈'
};

export class ThemeService {
  private static instance: ThemeService;

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Inject or update CSS variables and stylesheet dynamically into document head
   */
  public applyTheme(theme?: SiteThemeSettings): void {
    if (typeof document === 'undefined') return;

    const currentTheme = theme || DEFAULT_THEME_SETTINGS;
    const styleId = 'dynamic-site-theme';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const cssVariables = `
      :root {
        --st-bg: ${currentTheme.backgroundColor || '#FDFCF8'};
        --st-text: ${currentTheme.textColor || '#2C3327'};
        --st-heading: ${currentTheme.headingColor || '#1E231B'};
        --st-btn-bg: ${currentTheme.buttonBgColor || '#4A5D3B'};
        --st-btn-text: ${currentTheme.buttonTextColor || '#FFFFFF'};
        --st-btn-hover: ${currentTheme.buttonHoverBgColor || '#3A4533'};
        --st-accent: ${currentTheme.accentColor || '#E2725B'};
        --st-link: ${currentTheme.linkColor || '#4A5D3B'};
        --st-border: ${currentTheme.borderColor || '#D9DED1'};
        --st-card-bg: ${currentTheme.cardBgColor || '#FFFFFF'};
        --st-section-bg: ${currentTheme.sectionBgColor || '#F4F6F0'};
        --st-header-bg: ${currentTheme.headerBgColor || '#FDFCF8'};
        --st-header-text: ${currentTheme.headerTextColor || '#2C3327'};
        --st-footer-bg: ${currentTheme.footerBgColor || '#1E231B'};
        --st-footer-text: ${currentTheme.footerTextColor || '#D9DED1'};
        --st-badge-bg: ${currentTheme.badgeBgColor || '#E8EAE2'};
        --st-badge-text: ${currentTheme.badgeTextColor || '#4A5D3B'};
      }

      /* Global theme utility classes for dynamic styling */
      body {
        background-color: var(--st-bg) !important;
        color: var(--st-text) !important;
      }

      .theme-bg-canvas { background-color: var(--st-bg) !important; }
      .theme-text-body { color: var(--st-text) !important; }
      .theme-text-heading { color: var(--st-heading) !important; }
      .theme-btn-primary {
        background-color: var(--st-btn-bg) !important;
        color: var(--st-btn-text) !important;
        transition: background-color 0.2s ease;
      }
      .theme-btn-primary:hover {
        background-color: var(--st-btn-hover) !important;
      }
      .theme-card {
        background-color: var(--st-card-bg) !important;
        border-color: var(--st-border) !important;
      }
      .theme-section {
        background-color: var(--st-section-bg) !important;
      }
      .theme-header {
        background-color: var(--st-header-bg) !important;
        color: var(--st-header-text) !important;
      }
      .theme-footer {
        background-color: var(--st-footer-bg) !important;
        color: var(--st-footer-text) !important;
      }
      .theme-badge {
        background-color: var(--st-badge-bg) !important;
        color: var(--st-badge-text) !important;
      }
      .theme-border {
        border-color: var(--st-border) !important;
      }
      .theme-link {
        color: var(--st-link) !important;
      }

      ${currentTheme.customCss || ''}
    `;

    styleEl.textContent = cssVariables;
  }

  /**
   * Dynamically update the browser tab's Favicon
   */
  public updateFavicon(favicon?: FaviconSettings, theme?: SiteThemeSettings): void {
    if (typeof document === 'undefined') return;

    const currentFavicon = favicon || DEFAULT_FAVICON_SETTINGS;
    let iconUrl = '';

    if (currentFavicon.faviconType === 'URL' && currentFavicon.faviconUrl) {
      iconUrl = currentFavicon.faviconUrl;
    } else if (currentFavicon.faviconType === 'EMOJI' && currentFavicon.faviconEmoji) {
      iconUrl = this.generateEmojiFavicon(currentFavicon.faviconEmoji);
    } else {
      // SVG Badge with text (e.g. 'ST')
      const text = currentFavicon.badgeText || 'ST';
      const bgColor = theme?.buttonBgColor || '#4A5D3B';
      const textColor = theme?.buttonTextColor || '#FFFFFF';
      iconUrl = this.generateTextSvgFavicon(text, bgColor, textColor);
    }

    if (iconUrl) {
      this.setLinkTag('icon', iconUrl);
      this.setLinkTag('shortcut icon', iconUrl);
      this.setLinkTag('apple-touch-icon', currentFavicon.appleTouchIconUrl || iconUrl);
    }
  }

  private setLinkTag(rel: string, href: string): void {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  }

  private generateEmojiFavicon(emoji: string): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text y=".9em" font-size="90">${emoji}</text>
      </svg>
    `.trim();
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  private generateTextSvgFavicon(text: string, bgColor: string, textColor: string): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
        <rect width="64" height="64" rx="16" fill="${bgColor}"/>
        <text x="32" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" text-anchor="middle" fill="${textColor}" letter-spacing="1">
          ${text.substring(0, 3).toUpperCase()}
        </text>
      </svg>
    `.trim();
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}

export const themeService = ThemeService.getInstance();
