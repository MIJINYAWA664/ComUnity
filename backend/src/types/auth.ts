export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accessibilitySettings?: Record<string, any>;
  preferredLanguage?: string;
  signLanguagePreference?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    accessibilitySettings: Record<string, any>;
    emergencyContacts: Array<Record<string, any>>;
    preferredLanguage: string;
    signLanguagePreference: string;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}