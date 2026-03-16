export interface CapabilityJson {
  files?: Array<{ path: string; content?: string }>;
  skills?: string[];
}

export function resolveSkillFiles(capabilityJson: CapabilityJson): Set<string> {
  const skillFiles = new Set<string>();

  // Files explicitly listed in skills array
  if (capabilityJson.skills) {
    for (const skillPath of capabilityJson.skills) {
      skillFiles.add(skillPath);
    }
  }

  // Any file matching SKILL.md (case-insensitive)
  if (capabilityJson.files) {
    for (const file of capabilityJson.files) {
      const filename = file.path.split("/").pop() ?? "";
      if (filename.toLowerCase() === "skill.md") {
        skillFiles.add(file.path);
      }
    }
  }

  return skillFiles;
}
