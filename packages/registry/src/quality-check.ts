import { readdir, stat } from "node:fs/promises";
import { join, basename } from "pathe";
import type { CapabilityMeta } from "./types.js";

const TYPED_SUFFIX_REGEX = /^[a-z0-9-]+\.(entity|vo|use-case|port|dto|event|error|contract|factory|test|mock|fixture|schema|adapter|middleware|router)\.ts$/;

async function dirExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isFile();
  } catch {
    return false;
  }
}

async function hasFileWithSuffix(dir: string, suffix: string): Promise<boolean> {
  try {
    const entries = await readdir(dir);
    return entries.some((f) => f.endsWith(suffix));
  } catch {
    return false;
  }
}

async function getAllTsFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "__tests__" && entry.name !== "node_modules") {
        results.push(...(await getAllTsFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        results.push(fullPath);
      }
    }
  } catch {
    // directory doesn't exist
  }
  return results;
}

export async function runQualityChecks(capabilities: CapabilityMeta[]): Promise<string[]> {
  const errors: string[] = [];

  for (const cap of capabilities) {
    const base = cap.path;

    if (!(await dirExists(join(base, "domain/entities")))) {
      errors.push(`${cap.name}: missing domain/entities/ directory`);
    } else if (!(await hasFileWithSuffix(join(base, "domain/entities"), ".entity.ts"))) {
      errors.push(`${cap.name}: domain/entities/ must contain at least one .entity.ts file`);
    }

    if (!(await dirExists(join(base, "domain/value-objects")))) {
      errors.push(`${cap.name}: missing domain/value-objects/ directory`);
    } else if (!(await hasFileWithSuffix(join(base, "domain/value-objects"), ".vo.ts"))) {
      errors.push(`${cap.name}: domain/value-objects/ must contain at least one .vo.ts file`);
    }

    if (!(await dirExists(join(base, "domain/events")))) {
      errors.push(`${cap.name}: missing domain/events/ directory`);
    } else if (!(await hasFileWithSuffix(join(base, "domain/events"), ".event.ts"))) {
      errors.push(`${cap.name}: domain/events/ must contain at least one .event.ts file`);
    }

    if (!(await dirExists(join(base, "domain/errors")))) {
      errors.push(`${cap.name}: missing domain/errors/ directory`);
    } else if (!(await hasFileWithSuffix(join(base, "domain/errors"), ".error.ts"))) {
      errors.push(`${cap.name}: domain/errors/ must contain at least one .error.ts file`);
    }

    if (!(await dirExists(join(base, "application/use-cases")))) {
      errors.push(`${cap.name}: missing application/use-cases/ directory`);
    } else if (!(await hasFileWithSuffix(join(base, "application/use-cases"), ".use-case.ts"))) {
      errors.push(`${cap.name}: application/use-cases/ must contain at least one .use-case.ts file`);
    }

    if (!(await dirExists(join(base, "application/ports")))) {
      errors.push(`${cap.name}: missing application/ports/ directory`);
    } else if (!(await hasFileWithSuffix(join(base, "application/ports"), ".port.ts"))) {
      errors.push(`${cap.name}: application/ports/ must contain at least one .port.ts file`);
    }

    if (!(await fileExists(join(base, "contracts/index.ts")))) {
      errors.push(`${cap.name}: missing contracts/index.ts barrel file`);
    }

    // Check for factory file
    try {
      const contractFiles = await readdir(join(base, "contracts"));
      if (!contractFiles.some((f) => f.endsWith(".factory.ts"))) {
        errors.push(`${cap.name}: contracts/ must contain a .factory.ts file`);
      }
    } catch {
      errors.push(`${cap.name}: missing contracts/ directory`);
    }

    if (!(await dirExists(join(base, "domain/__tests__")))) {
      errors.push(`${cap.name}: missing domain/__tests__/ directory`);
    } else if (!(await hasFileWithSuffix(join(base, "domain/__tests__"), ".test.ts"))) {
      errors.push(`${cap.name}: domain/__tests__/ must contain at least one .test.ts file`);
    }

    if (!(await dirExists(join(base, "application/__tests__")))) {
      errors.push(`${cap.name}: missing application/__tests__/ directory`);
    } else if (!(await hasFileWithSuffix(join(base, "application/__tests__"), ".test.ts"))) {
      errors.push(`${cap.name}: application/__tests__/ must contain at least one .test.ts file`);
    }

    // Validate kebab-case filenames with typed suffixes (only source files, not tests)
    const tsFiles = await getAllTsFiles(base);
    for (const file of tsFiles) {
      const name = basename(file);
      if (name === "index.ts" || name === "result.ts") continue;
      if (!TYPED_SUFFIX_REGEX.test(name)) {
        errors.push(`${cap.name}: invalid filename '${name}' — must be kebab-case with typed suffix`);
      }
    }
  }

  return errors;
}
