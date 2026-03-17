export interface ProcessJobInput {
  jobId: string;
}

export interface ProcessJobOutput {
  status: "completed" | "failed";
  completedAt: Date | null;
}
