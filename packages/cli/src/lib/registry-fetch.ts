import { ofetch, FetchError } from "ofetch";
import { registrySchema } from "@backcap/shared/schemas/registry";
import { RegistryError } from "../errors/registry.error.js";
import { log } from "../utils/logger.js";

const FALLBACK_URL =
  "https://faroke.github.io/backcap/registry.json";

export async function fetchRegistry(
  primaryUrl: string,
): Promise<Record<string, unknown>> {
  let data: unknown;

  try {
    data = await ofetch(primaryUrl, { timeout: 1000 });
  } catch (e) {
    if (e instanceof FetchError) {
      log.warn("Primary registry unavailable. Using fallback.");
      try {
        data = await ofetch(FALLBACK_URL, { timeout: 3000 });
      } catch {
        throw new RegistryError(
          `Unable to reach registry. Check your internet connection or try again later.\n  Primary: ${primaryUrl}\n  Fallback: ${FALLBACK_URL}`,
        );
      }
    } else {
      throw e;
    }
  }

  const result = registrySchema.safeParse(data);
  if (!result.success) {
    throw new RegistryError(
      "Registry response is invalid. This may indicate a version mismatch. Try updating: npx @backcap/cli@latest list",
    );
  }

  return result.data as Record<string, unknown>;
}
