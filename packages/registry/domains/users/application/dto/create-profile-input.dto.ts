export interface CreateProfileInput {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  locale?: string;
  timezone?: string;
}
