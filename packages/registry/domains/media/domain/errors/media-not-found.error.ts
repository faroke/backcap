export class MediaNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaNotFound";
  }

  static create(mediaId: string): MediaNotFound {
    return new MediaNotFound(`Media not found with id: "${mediaId}"`);
  }
}
