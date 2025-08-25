export interface PaginatedRequest {
  page: number;
  size: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  pages: number;
  total: number;
}
