export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface DataEntry {
  id: string;
  title: string;
  content: string;
  type: string;
  metadata: Record<string, any>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDataRequest {
  title: string;
  content: string;
  type: string;
  metadata?: Record<string, any>;
}

export interface UpdateDataRequest {
  title?: string;
  content?: string;
  type?: string;
  metadata?: Record<string, any>;
}