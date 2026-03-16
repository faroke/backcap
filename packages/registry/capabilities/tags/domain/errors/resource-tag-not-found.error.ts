export class ResourceTagNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResourceTagNotFound";
  }

  static create(resourceId: string, tagSlug: string): ResourceTagNotFound {
    return new ResourceTagNotFound(
      `Resource "${resourceId}" does not have tag "${tagSlug}"`,
    );
  }
}
