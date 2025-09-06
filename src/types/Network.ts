export interface Connection {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED' | 'WITHDRAWN';
  type: 'COLLABORATOR' | 'MENTOR' | 'MENTEE' | 'FRIEND' | 'COLLEAGUE' | 'PROFESSIONAL';
  message?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    username: string;
    displayName?: string;
    profilePictureUrl?: string;
    headline?: string;
  };
  receiver?: {
    id: string;
    username: string;
    displayName?: string;
    profilePictureUrl?: string;
    headline?: string;
  };
}

export interface NetworkStats {
  total: number;
  accepted: number;
  pending: number;
  blocked: number;
  byType: Record<string, number>;
}