export interface DomainJson {
  files?: Array<{ path: string; content?: string }>;
  skills?: string[];
}

export function resolveSkillFiles(domainJson: DomainJson): Set<string> {
  const skillFiles = new Set<string>();

  // Files explicitly listed in skills array
  if (domainJson.skills) {
    for (const skillPath of domainJson.skills) {
      skillFiles.add(skillPath);
    }
  }

  // Any file matching SKILL.md (case-insensitive)
  if (domainJson.files) {
    for (const file of domainJson.files) {
      const filename = file.path.split("/").pop() ?? "";
      if (filename.toLowerCase() === "skill.md") {
        skillFiles.add(file.path);
      }
    }
  }

  return skillFiles;
}
