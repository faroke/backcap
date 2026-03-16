export interface ToggleFlagInput {
  key: string;
  enabled: boolean;
}

export interface ToggleFlagOutput {
  key: string;
  isEnabled: boolean;
  updatedAt: Date;
}
