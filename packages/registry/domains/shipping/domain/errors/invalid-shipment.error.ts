export class InvalidShipment extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidShipment";
  }
  static missingId(): InvalidShipment {
    return new InvalidShipment("Shipment ID is required");
  }
  static missingOrderId(): InvalidShipment {
    return new InvalidShipment("Order ID is required");
  }
  static missingCarrierId(): InvalidShipment {
    return new InvalidShipment("Carrier ID is required");
  }
  static invalidWeight(): InvalidShipment {
    return new InvalidShipment("Weight must be a positive integer (grams)");
  }
  static invalidRateCents(): InvalidShipment {
    return new InvalidShipment("Rate cents must be a non-negative integer");
  }
  static invalidRateCurrency(currency: string): InvalidShipment {
    return new InvalidShipment(`Invalid rate currency: "${currency}"`);
  }
  static estimatedDeliveryNotFuture(): InvalidShipment {
    return new InvalidShipment("Estimated delivery date must be in the future");
  }
}
