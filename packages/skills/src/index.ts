import { FsDeps } from "./fs-deps.js";
import { getSkillMd, parseFrontmatter } from "./parser.js";
import { toPrompt } from "./prompt.js";
import { validate } from "./validator.js";

export class Skills {
  constructor(private fsDeps: FsDeps) {}

  public async validate(skillDir: string): Promise<Error[]> {
    return validate(this.fsDeps, skillDir);
  }

  public async readProperties(
    skillDir: string,
  ): Promise<Record<string, unknown>> {
    const fileContent = await getSkillMd(this.fsDeps, skillDir);
    return parseFrontmatter(fileContent);
  }

  public async toPrompt(skillDirs: string[]): Promise<string> {
    for (const skillDir of skillDirs) {
      const errors = await this.validate(skillDir);
      if (errors.length > 0) {
        throw new Error(
          `Cannot include invalid skill at ${skillDir} in prompt: ${errors
            .map((e) => e.message)
            .join("; ")}`,
        );
      }
    }

    const prompt = await toPrompt(this.fsDeps, skillDirs);

    console.log("--- Skill Prompt Start ---");
    console.log(prompt);
    console.log("--- Skill Prompt End ---");

    return prompt;
  }
}

export { FsDeps } from "./fs-deps.js";
