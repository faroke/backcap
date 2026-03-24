export interface UpdateProfileInput {
  userId: string;
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string;
}
