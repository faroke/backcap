import type { ZodError } from "zod";

export class ConfigError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, code: string, cause?: unknown) {
    super(message);
    this.name = "ConfigError";
    this.code = code;
    this.cause = cause;
  }
}

export class ValidationError extends ConfigError {
  constructor(zodError: ZodError) {
    const formatted = zodError.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    super(
      `Config validation failed:\n${formatted}`,
      "VALIDATION_ERROR",
      zodError,
    );
    this.name = "ValidationError";
  }
}

export class DetectionError extends Error {
  readonly field: "framework" | "packageManager";

  constructor(field: "framework" | "packageManager") {
    super(`Could not auto-detect ${field}`);
    this.name = "DetectionError";
    this.field = field;
  }
}
