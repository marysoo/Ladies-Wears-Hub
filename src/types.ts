export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrls: string[]; // Changed from imageUrl to support slideshows
  affiliateLink: string;
  price?: string;
}

export interface Coupon {
  id: string;
  title: string;
  code: string;
  link: string;
  description: string;
}

export interface SiteSettings {
  aboutText: string;
  contactWhatsApp: string;
  privacyText: string;
}
