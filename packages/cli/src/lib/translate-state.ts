import { appendFile, mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { TranslateWriter } from "tools-shared";

type TranslateStateOptions = {
  rootDir?: string;
};

export type TranslateStateContents = Array<{
  file_id: string;
  content: string;
}>;

class TranslateState {
  rootDir: string = "./.neu-translations";

  constructor(options: TranslateStateOptions = {}) {
    if (options.rootDir) {
      this.rootDir = options.rootDir;
    }
  }

  private formatFileName(file_id: string): string {
    return file_id
      .replace(/[/\\]/g, "-") // Replace forward and backward slashes with dashes
      .replace(/:/g, "-"); // Replace colons (Windows drive letters) with dashes
  }

  write: TranslateWriter = async ({ translated_string, file_id }) => {
    const safeFileName = this.formatFileName(file_id);
    const targetPath = join(this.rootDir, safeFileName);
    await mkdir(this.rootDir, { recursive: true });
    await appendFile(targetPath, translated_string);
  };

  async read({ file_id }: { file_id: string }): Promise<string> {
    const safeFileName = this.formatFileName(file_id);
    const targetPath = join(this.rootDir, safeFileName);
    const content = await readFile(targetPath, "utf-8");
    return content;
  }

  async readAll(): Promise<TranslateStateContents> {
    const files = await readdir(this.rootDir);
    const contents: TranslateStateContents = [];
    for (const file of files) {
      // Note: readAll returns the formatted filename as file_id since we can't reverse the mapping
      const targetPath = join(this.rootDir, file);
      const content = await readFile(targetPath, "utf-8");
      contents.push({ file_id: file, content });
    }
    return contents;
  }
}

export const translateState = new TranslateState();
