export class MissingDependencyError extends Error {
  readonly missingCapabilities: string[];
  readonly suggestion: string;

  constructor(missingCapabilities: string[]) {
    super(`Required capabilities not installed: ${missingCapabilities.join(", ")}`);
    this.name = "MissingDependencyError";
    this.missingCapabilities = missingCapabilities;
    this.suggestion = `Run: ${missingCapabilities.map((c) => `backcap add ${c}`).join(" && ")}`;
  }
}

export class BridgeNotFoundError extends Error {
  readonly bridgeName: string;
  readonly suggestion: string;

  constructor(bridgeName: string) {
    super(`Bridge "${bridgeName}" not found in registry.`);
    this.name = "BridgeNotFoundError";
    this.bridgeName = bridgeName;
    this.suggestion = "Run: backcap bridges  to see available bridges";
  }
}
