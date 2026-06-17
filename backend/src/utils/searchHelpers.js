import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const aliasesPath = path.resolve(
  __dirname,
  "../../../data/etl/config/manual-aliases.json",
);
let aliases = {};

try {
  const data = fs.readFileSync(aliasesPath, "utf8");
  aliases = JSON.parse(data);
} catch (error) {
  console.error("Error loading manual aliases:", error);
}

export function buildSearchCondition(searchStr) {
  if (!searchStr) return undefined;
  const searchLower = searchStr.trim().toLowerCase();

  const termsToSearch = new Set();

  for (const [key, value] of Object.entries(aliases)) {
    if (
      key.toLowerCase().includes(searchLower) ||
      value.toLowerCase().includes(searchLower)
    ) {
      termsToSearch.add(value);
      termsToSearch.add(key);
    }
  }

  const terms = Array.from(termsToSearch);

  const splitTerms = searchStr.trim().split(/\s+/);
  const originalCondition = {
    AND: splitTerms.map((term) => ({
      name: { contains: term, mode: "insensitive" },
    })),
  };

  if (terms.length === 0) {
    return originalCondition;
  } else {
    return {
      OR: [
        originalCondition,
        ...terms.map((term) => ({
          name: { contains: term, mode: "insensitive" },
        })),
      ],
    };
  }
}
