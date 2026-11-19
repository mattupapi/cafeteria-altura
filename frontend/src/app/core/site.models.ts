export interface MediaAsset { id: number; code: string; type: 'image' | 'video'; url: string; altText: string; creditName: string; creditUrl: string; }
export interface NavigationItem { id: number; label: string; target: string; sortOrder: number; }
export interface SectionContent { id: number; code: string; eyebrow: string; title: string; body: string; ctaLabel: string | null; ctaTarget: string | null; media: MediaAsset | null; }
export interface ServiceItem { id: number; name: string; description: string; media: MediaAsset; }
export interface MenuItem { id: number; name: string; description: string; price: number; featured: boolean; media: MediaAsset | null; }
export interface MenuCategory { id: number; name: string; sortOrder: number; items: MenuItem[]; }
export interface BusinessHour { id: number; dayLabel: string; timeLabel: string; sortOrder: number; }
export interface SiteData {
  settings: Record<string, string>;
  ui: Record<string, string>;
  navigation: NavigationItem[];
  sections: Record<string, SectionContent>;
  services: ServiceItem[];
  menu: MenuCategory[];
  featured: MenuItem[];
  gallery: MediaAsset[];
  hours: BusinessHour[];
}
export interface ChatMessage { id: number; sender: 'user' | 'assistant'; text: string; error?: boolean; }

