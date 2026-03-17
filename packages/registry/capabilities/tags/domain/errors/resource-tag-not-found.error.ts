export class ResourceTagNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResourceTagNotFound";
  }

  static create(tagSlug: string, resourceId: string, resourceType: string): ResourceTagNotFound {
    return new ResourceTagNotFound(
      `Resource tag not found: tag "${tagSlug}" is not associated with ${resourceType} "${resourceId}"`,
    );
  }
}
