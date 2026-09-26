export type IdentityType =
  | 'Local'
  | 'Newcomer'
  | 'Tourist'
  | 'Student'
  | 'Freelancer'
  | 'Entrepreneur'
  | 'Specialist'
  | 'Creative';

export type ActivityType =
  | 'IT & Tech'
  | 'Design & Creative'
  | 'Music & Audio'
  | 'Sports & Fitness'
  | 'Education & Science'
  | 'Business & Finance'
  | 'Hospitality & Food'
  | 'Crafts & Trades';

export type VisibilityLevel = 'exact' | 'zone' | 'district' | 'invisible';

export interface UserMood {
  id: string;
  text: string;
  emoji: string;
  expiresAt: number; // timestamp ms
  durationHours: number;
  note?: string;
}

export interface UserStatus {
  id: string;
  label: string;
  description: string;
  color: string;
  discoveryWeight: 'high' | 'normal' | 'low';
}

export interface UserProfile {
  name: string;
  handle: string;
  avatarUrl: string;
  identity: IdentityType;
  activity: ActivityType;
  interests: string[];
  lookingFor: string[];
  offering: string[];
  status: string; // Character / Status
  mood?: UserMood;
  visibility: VisibilityLevel;
  district: string;
  auraScore: number;
  dailySignalsUsed: number;
  dailySignalsLimit: number;
  isOnboarded: boolean;
}

export interface DublinPlace {
  id: string;
  name: string;
  category: 'cafe' | 'pub' | 'coworking' | 'culture' | 'park';
  district: string;
  address: string;
  liveContext: string;
  isQuietHour?: boolean;
  hasLiveEvent?: boolean;
  eventTime?: string;
  lat: number;
  lng: number;
  auraScore: number;
  tags: string[];
  imageUrl?: string;
  createdByMe?: boolean;
  createdAt?: number; // timestamp ms
}

export interface DublinOpportunity {
  id: string;
  type: 'housing' | 'job' | 'activity';
  title: string;
  organizer: string;
  categoryTag: string;
  rateOrPrice: string;
  district: string;
  lat: number;
  lng: number;
  description: string;
  expiresInDays: number;
  relevantFields: string[];
  verifiedByAura: boolean;
  createdByMe?: boolean;
  createdAt?: number; // timestamp ms
}

export interface NearbyDublinUser {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  identity: IdentityType;
  activity: ActivityType;
  interests: string[];
  lookingFor: string[];
  offering: string[];
  status: string;
  mood?: {
    text: string;
    emoji: string;
    expiresMinutes: number;
    note?: string;
  };
  visibility: VisibilityLevel;
  district: string;
  lat: number;
  lng: number;
  auraScore: number;
  mutualScore: number; // 0-100 match based on tags & status
  mutualTags: string[];
}

export interface SignalInteraction {
  id: string;
  targetUserId: string;
  targetUserName: string;
  targetUserHandle: string;
  targetUserAvatar: string;
  commonTags: string[];
  timestamp: number;
  state: 'pending' | 'accepted' | 'declined';
}

export interface ChatThreadItem {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatar: string;
  peerStatus: string;
  stage: 'delivered' | 'hidden_notification' | 'read' | 'replied' | 'politely_declined' | 'ghosted_penalty';
  deliveredTime: string;
  previewSecretText: string;
  fullMessage: string;
  timerSecondsRemaining: number;
  history: {
    sender: 'peer' | 'me';
    text: string;
    time: string;
  }[];
}

export interface AuraLog {
  id: string;
  action: string;
  delta: number;
  timestamp: string;
  type: 'gain' | 'penalty';
}
