import aliases from "../constants/manual-aliases.json";
const reverseAliases = {};
try {
  const aliasesData = aliases && aliases.default ? aliases.default : aliases;
  if (aliasesData && typeof aliasesData === "object") {
    for (const [fullName, dbName] of Object.entries(aliasesData)) {
      reverseAliases[dbName] = fullName;
    }
  }
} catch (e) {
  console.error("Failed to build reverse aliases mapping:", e);
}

export function getPlayerDisplayName(player) {
  try {
    if (!player) return "";
    const name = typeof player === "string" ? player : player.name;
    if (!name) return "";
    if (reverseAliases && reverseAliases[name]) {
      return reverseAliases[name];
    }
    return name;
  } catch (err) {
    console.error("Error in getPlayerDisplayName:", err);
    return typeof player === "object"
      ? player?.name || ""
      : String(player || "");
  }
}

export function deduplicatePlayers(players) {
  if (!Array.isArray(players)) return [];
  const seen = new Set();
  return players.filter((player) => {
    if (!player) return false;
    const displayName = getPlayerDisplayName(player);
    if (!displayName || seen.has(displayName)) {
      return false;
    }
    seen.add(displayName);
    return true;
  });
}
