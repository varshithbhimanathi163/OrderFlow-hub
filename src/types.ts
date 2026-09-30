export interface OrderSubmission {
  id: string; // e.g. ORD-20260929-000001
  name: string;
  mobile: string;
  address: string;
  createdAt: string; // ISO 8601 string
  createdAtFormatted: string; // Readable local date/time
  status: 'new' | 'contacted' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  ip?: string;
  sourceUrl?: string;
  userAgent?: string;
}

export interface FormConfig {
  title: string;
  subtitle: string;
  accentColor: string;
  buttonText: string;
  successTitle: string;
  successMessage: string;
  redirectUrl?: string;
  themeStyle: 'modern' | 'minimal' | 'card' | 'slate';
  showBorders: boolean;
  roundedCorners: 'sm' | 'md' | 'lg' | 'full';
  apiUrl?: string;
}

export interface DashboardStats {
  total: number;
  todayCount: number;
  lastOrderId: string | null;
  statusBreakdown: {
    new: number;
    contacted: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
}

export interface GetSubmissionsResponse {
  success: boolean;
  submissions: OrderSubmission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string;
  keyPrefix: string;
  role: 'read' | 'read_write' | 'admin';
  createdAt: string;
  createdAtFormatted: string;
  lastUsedAt?: string | null;
  status: 'active' | 'revoked';
}

export interface SyncOrdersResponse {
  success: boolean;
  submissions: OrderSubmission[];
  count: number;
  totalAvailable: number;
  lastSyncTimestamp: string;
  hasMore: boolean;
}
