interface RegistryItem {
  name: string;
  description: string;
  type: string;
  version?: string;
}

function pad(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 3) + "..." : str;
}

export function renderDomainTable(
  items: RegistryItem[],
  installed: Set<string>,
): string {
  const domains = items.filter((i) => i.type === "domain");

  const COL = { name: 20, version: 10, description: 50, installed: 12 };

  const header =
    pad("Name", COL.name) + pad("Version", COL.version) + pad("Description", COL.description) + pad("Installed", COL.installed);
  const separator = "-".repeat(COL.name + COL.version + COL.description + COL.installed);

  const rows = domains.map((cap) => {
    const installedMark = installed.has(cap.name) ? "✓" : "—";
    const version = cap.version ?? "—";
    return (
      pad(cap.name, COL.name) +
      pad(version, COL.version) +
      pad(truncate(cap.description, COL.description - 2), COL.description) +
      installedMark
    );
  });

  const footer = `\n${domains.length} domains available`;

  return [header, separator, ...rows, footer].join("\n") + "\n";
}
