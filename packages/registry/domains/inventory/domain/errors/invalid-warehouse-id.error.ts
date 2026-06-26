export class InvalidWarehouseId extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidWarehouseId";
  }

  static create(reason: string): InvalidWarehouseId {
    return new InvalidWarehouseId(reason);
  }
}
