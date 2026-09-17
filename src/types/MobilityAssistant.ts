/**
 * Mobility Assistant API Types
 * Types for communication with the mobility-assistant service
 */

import type { ApiTransportMode, Coordinates, Preferences, User, Profile, Address } from './UserProfile';

/**
 * Origin/Destination location format
 */
export interface Location {
  lat: number;
  lng: number;
  address: string;
  name?: string; // Optional friendly name like "Home" or "Work"
}

/**
 * Chat conversation state maintained across messages
 */
export interface ChatState {
  // Core trip planning state
  origin?: {
    text: string;
    point: Coordinates;
  };
  destination?: {
    text: string;
    point: Coordinates;
  };
  destinationText?: string; // User's raw input for destination
  destinationIndex?: number; // Selected destination from suggestions
  destinations?: Array<{
    title: string;
    description?: string;
    lat: number;
    lng: number;
  }>;
  
  // Timing
  when?: number; // Unix timestamp in milliseconds
  relativeDateTime?: string; // e.g., "tomorrow at 3pm", "in 30 minutes"
  leaveOrArriveBy?: 'leave' | 'arrive';
  
  // Route planning
  plans?: any[]; // Route plans from OTP
  planIndex?: number; // Selected plan from suggestions
  routesSuggestionsSummary?: string;
  
  // Conversation flow
  assistantAnswer?: string;
  history?: string; // Conversation history
  hasUserConfirmed?: boolean;
  
  // Metadata
  threadId?: string;
  sessionId?: string;
}

/**
 * User context sent with each chat request
 * This is the profile data that affects trip planning
 */
export interface UserContext {
  // Transport preferences
  transportModes: ApiTransportMode[];
  
  // Accessibility needs
  wheelchair?: boolean;
  serviceAnimal?: boolean;
  minimizeWalking?: boolean;
  
  // Trip preferences
  maxCost?: number;
  maxTransfers?: number;
  sortBy?: 'fastest' | 'cheapest' | 'least_walking' | 'least_transfers';
  
  // User settings
  language?: 'en' | 'es';
  
  // Optional saved locations for quick access
  savedLocations?: Array<{
    id: string;
    title: string;
    text: string;
    point: Coordinates;
    alias?: string; // "HOME", "WORK", etc.
  }>;
  
  // Home address for default origin
  homeAddress?: Address;
}

/**
 * Main chat request payload sent to mobility-assistant
 */
export interface MobilityAssistantRequest {
  // User's message
  message: string;
  
  // Current origin (from geolocation or user selection)
  origin: Location;
  
  // Center point for geocoding searches
  center: Coordinates;
  
  // User's profile context
  userContext: UserContext;
  
  // Conversation state
  state: ChatState;
  
  // Reset conversation flag (for new trips)
  shouldReset?: boolean;
  
  // User's timezone (e.g., 'America/New_York')
  timezone?: string;
  
  // Optional metadata
  sessionId?: string;
  requestId?: string;
  timestamp?: string;
}

/**
 * Response from mobility-assistant
 */
export interface MobilityAssistantResponse {
  // Indicates if this completes the trip planning
  isFinalResponse: boolean;
  
  // Response data
  response: {
    // The request that was processed
    request?: {
      organization: string;
      origin: {
        text: string;
        point: Coordinates;
      };
      destination?: {
        text: string;
        point: Coordinates;
      };
      when?: number;
    };
    
    // Updated conversation state
    state: ChatState;
    
    // If final, includes the trip plan
    plan?: {
      duration: number;
      startTime: number;
      endTime: number;
      legs: Array<{
        mode: string;
        from: any;
        to: any;
        startTime: number;
        endTime: number;
        duration: number;
        distance: number;
        route?: any;
      }>;
    };
  };
  
  // Error information if request failed
  error?: {
    code: number;
    message: string;
    details?: any;
  };
}

/**
 * Validation helpers
 */
export const validateMobilityRequest = (req: Partial<MobilityAssistantRequest>): string[] => {
  const errors: string[] = [];
  
  if (!req.message) {
    errors.push('Message is required');
  }
  
  if (!req.origin || !req.origin.lat || !req.origin.lng) {
    errors.push('Valid origin with lat/lng is required');
  }
  
  if (!req.center || !req.center.lat || !req.center.lng) {
    errors.push('Valid center point is required');
  }
  
  if (!req.userContext) {
    errors.push('User context is required');
  } else {
    if (!req.userContext.transportModes || req.userContext.transportModes.length === 0) {
      errors.push('At least one transport mode is required');
    }
  }
  
  return errors;
};

/**
 * Helper to build user context from user object
 */
export const buildUserContext = (user: User): UserContext => {
  // Log to debug what we're receiving
  console.log('[buildUserContext] User object:', JSON.stringify(user, null, 2));
  
  const profile = user?.profile;
  const prefs = profile?.preferences;
  
  // Log the extracted values
  console.log('[buildUserContext] Profile:', profile);
  console.log('[buildUserContext] Preferences:', prefs);
  console.log('[buildUserContext] Transport modes from prefs:', prefs?.modes);
  
  const context = {
    // Transport modes (required) - ensure we always have at least bus/walk
    transportModes: (prefs?.modes && prefs.modes.length > 0) ? prefs.modes : ['bus', 'walk'],
    
    // Accessibility settings
    wheelchair: prefs?.wheelchair,
    serviceAnimal: prefs?.serviceAnimal,
    minimizeWalking: prefs?.minimizeWalking,
    
    // Trip preferences
    maxCost: prefs?.maxCost,
    maxTransfers: prefs?.maxTransfers,
    sortBy: prefs?.minimizeWalking ? 'least_walking' : 'fastest',
    
    // User settings
    language: prefs?.language,
    
    // Saved locations from favorites
    savedLocations: profile?.favorites?.locations?.map(loc => ({
      id: loc.id,
      title: loc.title,
      text: loc.text,
      point: loc.point,
      alias: loc.alias
    })),
    
    // Home address
    homeAddress: profile?.address
  };
  
  console.log('[buildUserContext] Final context:', JSON.stringify(context, null, 2));
  return context;
};

/**
 * Helper to build request payload
 */
export const buildMobilityRequest = (
  message: string,
  origin: Location,
  center: Coordinates,
  user: User,
  state: ChatState = {},
  shouldReset: boolean = false
): MobilityAssistantRequest => {
  // Extract timezone from user's first organization if available
  const timezone = user?.organizations?.[0]?.timezone || 'America/New_York';
  
  return {
    message,
    origin,
    center,
    userContext: buildUserContext(user),
    state,
    shouldReset,
    timezone,
    timestamp: new Date().toISOString()
  };
};
