// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================
// User
// ============================================================

export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isPremium: boolean;
  createdAt: string;
}

export interface SportProfile {
  id: string;
  sport: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  position?: string;
  yearsExperience: number;
}

// ============================================================
// Community
// ============================================================

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  sportType: string;
  locationCity?: string;
  memberCount: number;
  isPublic: boolean;
}

export interface Membership {
  id: string;
  communityId: string;
  userId: string;
  role: 'owner' | 'admin' | 'captain' | 'coach' | 'member';
  status: 'active' | 'inactive' | 'banned';
  joinedAt: string;
}

// ============================================================
// Events
// ============================================================

export interface SportEvent {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  eventType: 'match' | 'training' | 'tournament' | 'social';
  locationName?: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// ============================================================
// Gamification
// ============================================================

export interface Badge {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

export interface UserBadge {
  badgeId: string;
  badge: Badge;
  earnedAt: string;
}

export interface XpRecord {
  id: string;
  amount: number;
  source: string;
  earnedAt: string;
}

// ============================================================
// Leaderboards
// ============================================================

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  rank: number;
  score: number;
  change: 'up' | 'down' | 'same';
}

export interface SportCoinWallet {
  balance: number;
  lifetimeEarned: number;
}

// ============================================================
// Notifications
// ============================================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  communityId: string;
  createdAt: string;
}
