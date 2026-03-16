import * as clack from "@clack/prompts";

interface AdapterOption {
  name: string;
  category: string;
}

export async function promptAdapterSelection(
  available: AdapterOption[],
  detected: string[],
): Promise<string[]> {
  const value = await clack.multiselect({
    message: "Which adapters do you want to install? (detected from package.json)",
    options: available.map((a) => ({
      value: a.name,
      label: `${a.name} (${a.category})`,
    })),
    initialValues: detected,
  });

  if (clack.isCancel(value)) {
    clack.cancel("Installation cancelled.");
    process.exit(0);
  }

  return value as string[];
}

export async function promptInstallConfirm(
  capabilityName: string,
): Promise<boolean> {
  const value = await clack.confirm({
    message: `Install ${capabilityName} with the above configuration?`,
  });

  if (clack.isCancel(value)) {
    clack.cancel("Installation cancelled.");
    process.exit(0);
  }

  return value;
}

export async function promptOverwriteDir(
  dirPath: string,
): Promise<boolean> {
  const value = await clack.confirm({
    message: `Directory ${dirPath} already exists. Overwrite?`,
  });

  if (clack.isCancel(value)) {
    clack.cancel("Installation cancelled.");
    process.exit(0);
  }

  return value;
}

export type ConflictAction = "compare_and_continue" | "selective" | "different_path" | "abort";

export async function promptConflictResolution(): Promise<ConflictAction> {
  const value = await clack.select({
    message: "Conflicts detected. How would you like to proceed?",
    options: [
      { value: "compare_and_continue" as const, label: "Compare and continue (overwrite all)" },
      { value: "selective" as const, label: "Select files individually" },
      { value: "different_path" as const, label: "Choose a different path" },
      { value: "abort" as const, label: "Abort installation" },
    ],
  });

  if (clack.isCancel(value)) {
    clack.cancel("Installation cancelled.");
    process.exit(0);
  }

  return value as ConflictAction;
}

export async function promptNewPath(): Promise<string> {
  const value = await clack.text({
    message: "Enter a new target path for the capability:",
    validate: (input) => {
      if (!input || input.trim().length === 0) {
        return "Path cannot be empty";
      }
    },
  });

  if (clack.isCancel(value)) {
    clack.cancel("Installation cancelled.");
    process.exit(0);
  }

  return value;
}
