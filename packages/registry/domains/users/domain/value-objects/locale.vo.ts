import { Result } from "../../shared/result.js";
import { InvalidLocale } from "../errors/invalid-locale.error.js";

export class Locale {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<Locale, InvalidLocale> {
    try {
      const canonical = Intl.getCanonicalLocales(value);
      const first = canonical[0];
      if (first === undefined) {
        return Result.fail(InvalidLocale.create(value));
      }
      return Result.ok(new Locale(first));
    } catch {
      return Result.fail(InvalidLocale.create(value));
    }
  }
}
