export interface EvaluateFlagInput {
  key: string;
  context?: Record<string, unknown>;
}

export interface EvaluateFlagOutput {
  isEnabled: boolean;
  key: string;
}
