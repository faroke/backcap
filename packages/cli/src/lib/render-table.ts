interface RegistryItem {
  name: string;
  description: string;
  type: string;
}

function pad(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 3) + "..." : str;
}

export function renderCapabilityTable(
  items: RegistryItem[],
  installed: Set<string>,
): string {
  const capabilities = items.filter((i) => i.type === "capability");

  const COL = { name: 20, description: 60, installed: 12 };

  const header =
    pad("Name", COL.name) + pad("Description", COL.description) + pad("Installed", COL.installed);
  const separator = "-".repeat(COL.name + COL.description + COL.installed);

  const rows = capabilities.map((cap) => {
    const installedMark = installed.has(cap.name) ? "✓" : "—";
    return (
      pad(cap.name, COL.name) +
      pad(truncate(cap.description, COL.description - 2), COL.description) +
      installedMark
    );
  });

  const footer = `\n${capabilities.length} capabilities available`;

  return [header, separator, ...rows, footer].join("\n") + "\n";
}
