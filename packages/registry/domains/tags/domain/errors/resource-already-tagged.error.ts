export class ResourceAlreadyTagged extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResourceAlreadyTagged";
  }

  static create(slug: string, resourceId: string, resourceType: string): ResourceAlreadyTagged {
    return new ResourceAlreadyTagged(
      `Resource already tagged: tag "${slug}" is already associated with ${resourceType} "${resourceId}"`,
    );
  }
}
