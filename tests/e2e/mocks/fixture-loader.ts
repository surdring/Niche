import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, "..", "fixtures");

export const readFixture = <TSchema extends z.ZodTypeAny>(fileName: string, schema: TSchema): z.infer<TSchema> => {
  const raw = readFileSync(join(fixturesDir, fileName), "utf8");
  const json: unknown = JSON.parse(raw);
  return schema.parse(json);
};
