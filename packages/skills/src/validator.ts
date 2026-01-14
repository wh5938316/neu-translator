import {
  ALLOWED_FIELDS,
  MAX_COMPATIBILITY_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_SKILL_NAME_LENGTH,
} from "./constants.js";
import { FsDeps } from "./fs-deps.js";
import { getSkillMd, parseFrontmatter } from "./parser.js";

const validateName = (name: string, skillDir: string): Error[] => {
  const errors: Error[] = [];

  if (name.length < 1 || name.length > MAX_SKILL_NAME_LENGTH) {
    errors.push(
      new Error(
        `Skill name must be between 1 and ${MAX_SKILL_NAME_LENGTH} characters. Found length ${name.length}.`,
      ),
    );
  }

  const nameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!nameRegex.test(name)) {
    errors.push(
      new Error(
        `Skill name "${name}" contains invalid characters. It may only contain lowercase alphanumeric characters and hyphens, must not start or end with a hyphen, and must not contain consecutive hyphens.`,
      ),
    );
  }

  const skillDirName = skillDir.split("/").pop();
  if (name !== skillDirName) {
    errors.push(
      new Error(
        `Skill name "${name}" does not match the parent directory name "${skillDirName}".`,
      ),
    );
  }

  return errors;
};

const validateDescription = (description: string): Error[] => {
  const errors: Error[] = [];

  if (description.length < 1 || description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(
      new Error(
        `Skill description must be between 1 and ${MAX_DESCRIPTION_LENGTH} characters. Found length ${description.length}.`,
      ),
    );
  }

  return errors;
};

const validateCompatibility = (compatibility: string): Error[] => {
  const errors: Error[] = [];

  if (compatibility.length > MAX_COMPATIBILITY_LENGTH) {
    errors.push(
      new Error(
        `Skill compatibility must be at most ${MAX_COMPATIBILITY_LENGTH} characters. Found length ${compatibility.length}.`,
      ),
    );
  }

  return errors;
};

const validateFields = (fields: Record<string, unknown>): Error[] => {
  const errors: Error[] = [];

  for (const key of Object.keys(fields)) {
    if (!ALLOWED_FIELDS.includes(key)) {
      errors.push(
        new Error(`Unexpected field "${key}" found in skill properties.`),
      );
    }
  }

  return errors;
};

export const validate = async (
  deps: FsDeps,
  skillDir: string,
): Promise<Error[]> => {
  try {
    const fileContent = await getSkillMd(deps, skillDir);

    const properties = parseFrontmatter(fileContent);

    const errors = validateFields(properties);

    errors.push(...validateName(String(properties.name ?? ""), skillDir));

    errors.push(...validateDescription(String(properties.description ?? "")));

    if (typeof properties.compatibility === "string") {
      errors.push(...validateCompatibility(properties.compatibility));
    }

    return errors;
  } catch (err) {
    return [err as Error];
  }
};
