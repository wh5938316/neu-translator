export type FsDeps = {
  exists: (path: string) => Promise<boolean>;
  readFile: (path: string, encoding: string) => Promise<string>;
  join: (...paths: string[]) => string;
};
