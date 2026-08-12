import { SchemaMarkupSettings, SiteSettings, FAQItem } from '../types';
import { initialSchemaMarkupSettings } from '../data/initialData';

export class SchemaService {
  /**
   * Generates the primary structured JSON-LD object for the website.
   */
  public generateMainSchema(settings: SchemaMarkupSettings, siteSettings?: SiteSettings): Record<string, any> {
    const brandName = settings.name || siteSettings?.brandName || 'ST Web & Ads Studio';
    const siteUrl = (settings.url || siteSettings?.seo?.canonicalUrl || 'https://stwebads.com').replace(/\/$/, '');
    const logoUrl = settings.logoUrl || `${siteUrl}/logo.png`;
    const imageUrl = settings.imageUrl || siteSettings?.seo?.ogImage || `${siteUrl}/banner.jpg`;
    const phone = settings.telephone || siteSettings?.phone || siteSettings?.whatsappNumber || '+8801815124970';
    const email = settings.email || siteSettings?.email || 'sonjoy.ads.studio@gmail.com';
    
    // Social profiles list
    const sameAsList: string[] = [];
    if (Array.isArray(settings.sameAs)) {
      settings.sameAs.forEach(s => {
        if (s && s.trim()) sameAsList.push(s.trim());
      });
    }
    if (siteSettings?.socialLinks) {
      const sl = siteSettings.socialLinks;
      [sl.facebook, sl.tiktok, sl.youtube, sl.linkedin, sl.instagram, sl.xTwitter].forEach(link => {
        if (link && link.trim() && !sameAsList.includes(link.trim())) {
          sameAsList.push(link.trim());
        }
      });
    }

    const type = settings.schemaType || 'ProfessionalService';

    if (type === 'Person') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        'name': settings.founderName || siteSettings?.personalName || 'Sonjoy Sarkar',
        'jobTitle': settings.founderJobTitle || siteSettings?.sonjoyRole || 'Performance Marketer & TikTok Ads Specialist',
        'description': settings.description || siteSettings?.sonjoyBio || 'TikTok and Facebook advertising specialist in Bangladesh.',
        'url': siteUrl,
        'image': imageUrl,
        'telephone': phone,
        'email': email,
        'sameAs': sameAsList,
        'worksFor': {
          '@type': 'Organization',
          'name': brandName,
          'url': siteUrl
        }
      };
    }

    const baseSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': type,
      '@id': `${siteUrl}/#${type.toLowerCase()}`,
      'name': brandName,
      'alternateName': settings.alternateName || siteSettings?.brandName,
      'description': settings.description || siteSettings?.seo?.siteDescription || 'TikTok and Facebook ads management in Bangladesh.',
      'url': siteUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': logoUrl
      },
      'image': imageUrl,
      'telephone': phone,
      'email': email,
      'priceRange': settings.priceRange || '$$ - $$$',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': settings.address?.streetAddress || 'Dhanmondi, Sector 27',
        'addressLocality': settings.address?.addressLocality || 'Dhaka',
        'addressRegion': settings.address?.addressRegion || 'Dhaka',
        'postalCode': settings.address?.postalCode || '1209',
        'addressCountry': settings.address?.addressCountry || 'BD'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': settings.geo?.latitude || '23.7465',
        'longitude': settings.geo?.longitude || '90.3760'
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ],
          'opens': '09:00',
          'closes': '22:00'
        }
      ],
      'sameAs': sameAsList,
      'founder': {
        '@type': 'Person',
        'name': settings.founderName || siteSettings?.personalName || 'Sonjoy Sarkar',
        'jobTitle': settings.founderJobTitle || siteSettings?.sonjoyRole || 'Performance Marketer & TikTok Ads Specialist'
      }
    };

    if (settings.serviceOffered && settings.serviceOffered.length > 0) {
      baseSchema.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        'name': 'Advertising & Performance Growth Services',
        'itemListElement': settings.serviceOffered.map(service => ({
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': service
          }
        }))
      };
    }

    return baseSchema;
  }

  /**
   * Generates FAQPage JSON-LD schema from published FAQs.
   */
  public generateFaqSchema(faqs: FAQItem[]): Record<string, any> | null {
    if (!faqs || faqs.length === 0) return null;

    const items = faqs.slice(0, 15).map(faq => ({
      '@type': 'Question',
      'name': faq.questionEn || faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answerEn || faq.answer
      }
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': items
    };
  }

  /**
   * Generates WebSite search & sitelinks schema.
   */
  public generateWebSiteSchema(siteUrl: string, brandName: string): Record<string, any> {
    const cleanUrl = siteUrl.replace(/\/$/, '');
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${cleanUrl}/#website`,
      'url': cleanUrl,
      'name': brandName,
      'inLanguage': ['en-US', 'bn-BD'],
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${cleanUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Validates a custom or generated JSON-LD string.
   */
  public validateJsonLd(jsonString: string): { isValid: boolean; error?: string; parsed?: any } {
    if (!jsonString || !jsonString.trim()) {
      return { isValid: false, error: 'JSON-LD content is empty.' };
    }

    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null) {
        return { isValid: false, error: 'JSON-LD must be a valid JSON object or array.' };
      }
      if (!parsed['@context'] && !Array.isArray(parsed)) {
        return { isValid: true, error: 'Warning: Missing "@context": "https://schema.org"', parsed };
      }
      return { isValid: true, parsed };
    } catch (err: any) {
      return { isValid: false, error: `JSON Syntax Error: ${err.message}` };
    }
  }

  /**
   * Injects the active schema markup JSON-LD script tags dynamically into document.head.
   */
  public injectSchemaToHead(
    settings?: SchemaMarkupSettings,
    siteSettings?: SiteSettings,
    faqs?: FAQItem[]
  ): void {
    if (typeof document === 'undefined') return;

    const schemaConfig = settings || siteSettings?.schemaMarkup || initialSchemaMarkupSettings;

    // Remove existing injected schema script tags
    const existingMain = document.getElementById('st-schema-main');
    if (existingMain) existingMain.remove();

    const existingFaq = document.getElementById('st-schema-faq');
    if (existingFaq) existingFaq.remove();

    const existingCustom = document.getElementById('st-schema-custom');
    if (existingCustom) existingCustom.remove();

    if (!schemaConfig.enabled) {
      return;
    }

    try {
      // 1. Inject Main Entity (ProfessionalService / LocalBusiness / Person / Organization)
      const mainSchema = this.generateMainSchema(schemaConfig, siteSettings);
      const scriptMain = document.createElement('script');
      scriptMain.id = 'st-schema-main';
      scriptMain.type = 'application/ld+json';
      scriptMain.text = JSON.stringify(mainSchema, null, 2);
      document.head.appendChild(scriptMain);

      // 2. Inject FAQ schema if enabled
      if (schemaConfig.includeFaqSchema && faqs && faqs.length > 0) {
        const faqSchema = this.generateFaqSchema(faqs);
        if (faqSchema) {
          const scriptFaq = document.createElement('script');
          scriptFaq.id = 'st-schema-faq';
          scriptFaq.type = 'application/ld+json';
          scriptFaq.text = JSON.stringify(faqSchema, null, 2);
          document.head.appendChild(scriptFaq);
        }
      }

      // 3. Inject Custom JSON-LD if provided
      if (schemaConfig.customJsonLd && schemaConfig.customJsonLd.trim()) {
        const check = this.validateJsonLd(schemaConfig.customJsonLd);
        if (check.isValid && check.parsed) {
          const scriptCustom = document.createElement('script');
          scriptCustom.id = 'st-schema-custom';
          scriptCustom.type = 'application/ld+json';
          scriptCustom.text = JSON.stringify(check.parsed, null, 2);
          document.head.appendChild(scriptCustom);
        }
      }
    } catch (e) {
      console.warn('Schema JSON-LD injection notice:', e);
    }
  }

  /**
   * Helper to format Google Rich Results test link.
   */
  public getGoogleRichResultsTestUrl(siteUrl: string): string {
    const encoded = encodeURIComponent(siteUrl);
    return `https://search.google.com/test/rich-results?url=${encoded}`;
  }
}

export const schemaService = new SchemaService();
