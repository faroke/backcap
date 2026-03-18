import { Result } from "../../shared/result.js";

export class Customer {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly externalId: string | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    id: string;
    email: string;
    name: string;
    externalId?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.email = params.email;
    this.name = params.name;
    this.externalId = params.externalId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static create(params: {
    id: string;
    email: string;
    name: string;
    externalId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Customer, Error> {
    if (!params.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
      return Result.fail(new Error(`Invalid customer email: "${params.email}"`));
    }
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(new Error("Customer name is required"));
    }
    const now = new Date();
    return Result.ok(
      new Customer({
        id: params.id,
        email: params.email,
        name: params.name.trim(),
        externalId: params.externalId,
        createdAt: params.createdAt ?? now,
        updatedAt: params.updatedAt ?? now,
      }),
    );
  }

  withExternalId(externalId: string): Customer {
    return new Customer({
      id: this.id,
      email: this.email,
      name: this.name,
      externalId,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
