import { ROOT_FILE } from "./constants.js";
import { FsDeps } from "./fs-deps.js";
import { getSkillMd, parseFrontmatter } from "./parser.js";

export async function toPrompt(
  deps: FsDeps,
  skillDirs: string[],
): Promise<string> {
  const lines = ["<available_skills>"];

  if (skillDirs.length === 0) {
    lines.push("\tNo skills available.");
  }

  for (const skillDir of skillDirs) {
    const fileContent = await getSkillMd(deps, skillDir);
    const properties = parseFrontmatter(fileContent);

    lines.push(`\t<skill>`);

    lines.push(`\t\t<name>${properties.name}</name>`);

    lines.push(`\t\t<description>${properties.description}</description>`);

    lines.push(`\t\t<location>${deps.join(skillDir, ROOT_FILE)}</location>`);

    lines.push("\t</skill>");
  }

  lines.push("</available_skills>");

  return lines.join("\n");
}
