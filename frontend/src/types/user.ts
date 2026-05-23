export interface AppUser {
  name: string;
  email: string;
  role: string;
  subscriptionType?: string;
  urlPhoto?: string;
  createdAt?: string;
}

export interface UserFromTokenDecoded {
  name: string;
  email: string;
  role: string;
  subscription_type?: string;
  avatar_url?: string;
  urlPhoto?: string;
}

export interface UserFromApi {
  name: string;
  email: string;
  role: string;
  subscription_type?: string;
  avatar_url?: string;
}
