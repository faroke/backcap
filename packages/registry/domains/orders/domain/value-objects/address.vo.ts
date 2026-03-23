import { Result } from "../../shared/result.js";

export class Address {
  readonly street: string;
  readonly city: string;
  readonly country: string;
  readonly postalCode: string;

  private constructor(street: string, city: string, country: string, postalCode: string) {
    this.street = street;
    this.city = city;
    this.country = country;
    this.postalCode = postalCode;
  }

  static create(params: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  }): Result<Address, Error> {
    if (!params.street || params.street.trim().length === 0) {
      return Result.fail(new Error("Street is required"));
    }
    if (!params.city || params.city.trim().length === 0) {
      return Result.fail(new Error("City is required"));
    }
    if (!params.country || params.country.trim().length === 0) {
      return Result.fail(new Error("Country is required"));
    }
    if (!params.postalCode || params.postalCode.trim().length === 0) {
      return Result.fail(new Error("Postal code is required"));
    }

    return Result.ok(
      new Address(
        params.street.trim(),
        params.city.trim(),
        params.country.trim(),
        params.postalCode.trim(),
      ),
    );
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.country === other.country &&
      this.postalCode === other.postalCode
    );
  }
}
