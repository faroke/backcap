export class FlagAlreadyInState extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FlagAlreadyInState";
  }

  static create(key: string, state: boolean): FlagAlreadyInState {
    const stateLabel = state ? "enabled" : "disabled";
    return new FlagAlreadyInState(
      `Feature flag "${key}" is already ${stateLabel}`,
    );
  }
}
