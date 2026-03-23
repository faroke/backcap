export class MissingDependencyError extends Error {
  readonly missingDomains: string[];
  readonly suggestion: string;

  constructor(missingDomains: string[]) {
    super(`Required domains not installed: ${missingDomains.join(", ")}`);
    this.name = "MissingDependencyError";
    this.missingDomains = missingDomains;
    this.suggestion = `Run: ${missingDomains.map((c) => `backcap add ${c}`).join(" && ")}`;
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
