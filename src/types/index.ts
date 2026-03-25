export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  user_id: string;
  name: string;
  email: string;
  content: string;
  created_at: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface ApiError {
  error: string;
}

export interface ApiSuccess<T> {
  data: T;
}
