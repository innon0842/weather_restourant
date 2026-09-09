export interface Restaurant {
  id: number;
  apiPlaceId: string;
  name: string;
  category: string;
  weatherTags: string[];
  phone: string;
  address: string;
  lat: number;
  lon: number;
  imageUrl: string;
  distance: number;
  matchScore: number;
  matchReason: string;
  businessHours?: string;
  menus?: Array<{ name: string; price: string; imageUrl?: string }>;
  photoUrls?: string[];
  isDetailCached?: boolean;
}
