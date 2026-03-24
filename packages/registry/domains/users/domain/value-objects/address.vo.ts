import { Result } from "../../shared/result.js";
import { InvalidAddress } from "../errors/invalid-address.error.js";

export class Address {
  readonly label: string;
  readonly street: string;
  readonly city: string;
  readonly postalCode: string;
  readonly country: string;
  readonly state?: string;

  private constructor(params: {
    label: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  }) {
    this.label = params.label;
    this.street = params.street;
    this.city = params.city;
    this.postalCode = params.postalCode;
    this.country = params.country;
    this.state = params.state;
  }

  static create(params: {
    label: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  }): Result<Address, InvalidAddress> {
    if (!params.label.trim()) {
      return Result.fail(InvalidAddress.create("label must not be empty"));
    }
    if (!params.street.trim()) {
      return Result.fail(InvalidAddress.create("street must not be empty"));
    }
    if (!params.city.trim()) {
      return Result.fail(InvalidAddress.create("city must not be empty"));
    }
    if (!params.postalCode.trim()) {
      return Result.fail(InvalidAddress.create("postalCode must not be empty"));
    }
    if (!params.country.trim()) {
      return Result.fail(InvalidAddress.create("country must not be empty"));
    }
    return Result.ok(new Address(params));
  }

  equals(other: Address): boolean {
    return (
      this.label === other.label &&
      this.street === other.street &&
      this.city === other.city &&
      this.postalCode === other.postalCode &&
      this.country === other.country &&
      this.state === other.state
    );
  }
}
