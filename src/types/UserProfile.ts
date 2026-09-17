/**
 * User and Profile Types
 * Represents the user authentication object and nested profile data structure
 * as used throughout the application
 */

export type TransportMode = 
  | 'WALK'
  | 'BICYCLE'
  | 'CAR'
  | 'BUS'
  | 'RAIL'
  | 'SUBWAY'
  | 'TRAM'
  | 'FERRY'
  | 'CABLE_CAR'
  | 'GONDOLA'
  | 'FUNICULAR'
  | 'TRANSIT'  // Generic transit
  | 'COMMUNITY_SHUTTLE'
  | 'UB_SHUTTLE'
  | 'PARATRANSIT'
  | 'RIDESHARE'
  | 'TAXI';

export type Language = 'en' | 'es';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  text: string; // The full address text
  title?: string; // Title/name of the address
  description?: string;
  distance?: string;
  point: Coordinates;
  alias?: string; // Alias like "HOME", "WORK"
}

// Saved locations as stored in favorites
export interface SavedLocation {
  id: string; // String ID like "1757197688148"
  title: string;
  description?: string;
  distance?: string;
  point: Coordinates;
  text: string;
  alias?: string; // "HOME", "WORK", etc.
  name?: string; // Also can be "HOME", "WORK"
  childKey?: string;
  search?: string; // Search index string
}

// Location used in trips
export interface TripLocation {
  point: Coordinates;
  childKey?: string;
  title: string;
  address?: string;
  description?: string;
  source?: string; // e.g., "openstreetmap"
  layer?: string; // e.g., "venue"
  sourceId?: string;
  category?: string | null;
  neighbourhood?: string;
  locality?: string;
  postalcode?: string;
  name?: string;
  text: string;
}

// Saved trip in favorites
export interface SavedTrip {
  id: number;
  origin: TripLocation;
  destination: TripLocation;
  whenAction: 'asap' | 'arrive' | 'depart';
  whenTime: string; // ISO date string
  requirements: string[];
  modes: string[]; // e.g., ["bus", "hail", "ubshuttle", "walk"]
  bannedAgencies: string[];
  bannedProviders: string[];
  sortBy: 'fastest' | 'cheapest' | 'least_walking' | 'least_transfers';
  alias?: string; // e.g., "Walk to hospital"
}

// Transport modes from API
export type ApiTransportMode = 'bus' | 'hail' | 'ubshuttle' | 'walk' | 'rail' | 'subway' | 'ferry';

// Notification types from API
export type NotificationType = 
  | 'dependentTripStart'
  | 'dependentArrive' 
  | 'dependentDepart'
  | 'dependentShuttleArrive'
  | 'dependentShuttleDepart'
  | 'dependentModeChange';

// Device types
export type DeviceType = 'apn' | 'fcm' | 'web';

// Preferences as stored in user.profile.preferences
export interface Preferences {
  language: Language;
  wheelchair: boolean;
  serviceAnimal: boolean;
  maxCost: number;
  maxTransfers: number;
  minimizeWalking: boolean;
  modes: ApiTransportMode[]; // e.g., ["bus", "hail", "ubshuttle"]
  notifications: ('sms' | 'email')[]; 
  notificationTypes: NotificationType[];
  shareWithConcierge: boolean;
  navigationDirections: 'voiceOn' | 'voiceOff';
  pin?: string; // PIN for verification (local only, not from API)
}

// Profile object nested within the User object (user.profile)
export interface Profile {
  firstName: string;
  lastName: string;
  address?: Address; // Home address
  preferences?: Preferences;
  favorites?: {
    locations: SavedLocation[];
    trips: SavedTrip[];
  };
  onboarded?: boolean;
  mfa?: boolean; // Multi-factor authentication enabled
  consent?: boolean; // Privacy/consent accepted
  caretakers?: any[]; // Caretakers/caregivers array
  
  // Device and notification settings
  deviceToken?: string;
  deviceType?: DeviceType;
  deviceId?: string;
  identity?: string; // UUID
  sid?: string; // Twilio SID
  notify?: boolean;
  
  // UI settings
  displayMode?: 'light' | 'dark';
  volume?: number; // 0-1
  
  // Metadata
  searchRebuildTriggeredAt?: string; // ISO date string
}

// Organization object
export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  address: string;
  latitude: number;
  longitude: number;
  timezone: string; // e.g., "America/New_York"
  center: [number, number];
  zoom: number;
  databox: [number, number, number, number];
  viewbox: [number, number, number, number];
  profile?: string; // JSON string with additional settings
  createdAt: string;
  updatedAt: string;
}

// Main User object from authentication response
export interface User {
  // Core user fields
  id?: string;
  email: string;
  phone: string;
  role?: string; // 'rider'
  
  // Timestamps
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  lastActive?: number; // Unix timestamp or 0
  
  // Account status
  locked?: boolean;
  isSocial?: boolean; // OAuth/social login
  
  // Organizations (array in response, but we typically use the first one)
  organizations?: Organization[];
  memberships?: any[];
  
  // Search fields (for backend indexing)
  search?: string;
  searchMemberships?: string;
  
  // Tokens (managed by authentication store, not from API)
  accessToken?: string; // Note: Usually not stored in user object
  refreshToken?: string;
  
  // Nested profile data
  profile?: Profile;
}


/**
 * Type guards
 */
export const isValidTransportMode = (mode: string): mode is TransportMode => {
  const validModes: TransportMode[] = [
    'WALK', 'BICYCLE', 'CAR', 'BUS', 'RAIL', 'SUBWAY', 'TRAM', 'FERRY',
    'CABLE_CAR', 'GONDOLA', 'FUNICULAR', 'TRANSIT', 'COMMUNITY_SHUTTLE',
    'UB_SHUTTLE', 'PARATRANSIT', 'RIDESHARE', 'TAXI'
  ];
  return validModes.includes(mode as TransportMode);
};

export const hasAccessibilityNeeds = (prefs: Preferences): boolean => {
  return prefs.wheelchair || prefs.serviceAnimal || prefs.minimizeWalking;
};

// Type guard for checking if user has a profile
export const hasProfile = (user: User): user is User & { profile: Profile } => {
  return !!user.profile;
};