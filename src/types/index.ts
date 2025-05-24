// Type definitions for the application

// Location type for dog-friendly places
export interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'indoor' | 'outdoor' | 'both';
  yelpLink?: string;
  notes?: string;
  rating: 1 | 2 | 3 | 4; // 1-4 paw rating system
  address?: string;
  category?: string;
}

// Plan type for Dog Day Planner feature
export interface Plan {
  id: string;
  name: string;
  locations: string[]; // Array of location IDs
  createdAt: string;
  notes?: string;
  shareCode?: string;
}

// Filter type
export interface Filter {
  type: 'all' | 'indoor' | 'outdoor';
  minRating?: number;
}

// Report type for flagging issues
export interface Report {
  locationId: string;
  issue: string;
  contactEmail?: string;
}

// Private notes type
export interface PrivateNote {
  locationId: string;
  content: string;
  lastUpdated: string;
}

// Toast notification type
export interface Toast {
  message: string;
  action?: () => void;
}

// Verified brewery data from JSON
export interface VerifiedBrewery {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  tags: string[];
  pawRating: number;
  yelp: string;
}