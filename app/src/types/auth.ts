export type Business = {
  id: number;
  name: string | null;
  gstNumber: string | null;
  address: string | null;
};

export type User = {
  id: number;
  name: string | null;
  mobile: string | null;
  email: string | null;
  provider: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  business?: Business | null;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSession = {
  user: User;
  tokens: Tokens;
  needsOnboarding: boolean;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  businessName: string;
  username: string;
  email?: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type OnboardingPayload = {
  businessName: string;
  phone: string;
  username: string;
};
