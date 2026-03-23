export class PermissionDenied extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionDenied";
  }

  static create(userId: string, action: string, resource: string): PermissionDenied {
    return new PermissionDenied(
      `User "${userId}" does not have permission to "${action}" on "${resource}"`,
    );
  }
}
