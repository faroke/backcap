export interface CreateFlagInput {
  key: string;
  isEnabled?: boolean;
  conditions?: Record<string, unknown>;
}

export interface CreateFlagOutput {
  flagId: string;
  createdAt: Date;
}
