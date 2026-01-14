import * as yaml from "js-yaml";
import { ROOT_FILE } from "./constants.js";
import { FsDeps } from "./fs-deps.js";

export async function getSkillMd(
  deps: FsDeps,
  skillDir: string,
): Promise<string> {
  const skillMd = deps.join(skillDir, ROOT_FILE);

  if (!(await deps.exists(skillMd))) {
    throw new Error(`Skill file ${ROOT_FILE} does not exist in ${skillDir}`);
  }

  const fileContent = await deps.readFile(skillMd, "utf-8");

  return fileContent;
}

export function parseFrontmatter(content: string): Record<string, unknown> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error("No frontmatter found");
  }

  const frontmatterContent = frontmatterMatch[1];

  const data = yaml.load(frontmatterContent);

  return data as Record<string, unknown>;
}
