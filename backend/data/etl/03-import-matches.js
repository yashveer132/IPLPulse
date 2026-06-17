import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseCricsheetMatch, toShortName } from "./utils/parseCricsheet.js";
import Logger from "./utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const log = new Logger("03-matches");

const RAW_DIR = path.resolve(__dirname, "../raw/cricsheet");

function chunkArray(array, size) {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

async function main() {
  if (!fs.existsSync(RAW_DIR)) {
    log.error(`Directory not found: ${RAW_DIR}`);
    process.exit(1);
  }

  const jsonFiles = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".json"));
  if (jsonFiles.length === 0) {
    log.error("No JSON files found");
    process.exit(1);
  }

  log.info(
    `Found ${jsonFiles.length} match files. Pre-processing in memory...`,
  );

  const existingMatches = new Set(
    (await prisma.match.findMany({ select: { cricsheetId: true } })).map(
      (m) => m.cricsheetId,
    ),
  );

  const parsedMatches = [];
  const missingPlayersSet = new Set();

  const existingPlayers = await prisma.player.findMany({
    select: { id: true, name: true },
  });
  const playerCache = {};
  for (const p of existingPlayers) {
    playerCache[p.name.toLowerCase()] = p.id;
  }

  for (const file of jsonFiles) {
    const cricsheetId = path.basename(file, ".json");
    if (existingMatches.has(cricsheetId)) continue;

    const parsed = parseCricsheetMatch(path.join(RAW_DIR, file));
    if (!parsed) continue;

    parsed.match.team1 = toShortName(parsed.match.team1);
    parsed.match.team2 = toShortName(parsed.match.team2);
    if (parsed.match.winner)
      parsed.match.winner = toShortName(parsed.match.winner);
    if (parsed.match.tossWinner)
      parsed.match.tossWinner = toShortName(parsed.match.tossWinner);

    for (const stat of parsed.playerStats) {
      if (!playerCache[stat.playerName.toLowerCase()]) {
        missingPlayersSet.add(stat.playerName);
      }
    }
    parsedMatches.push(parsed);
  }

  log.info(`Found ${missingPlayersSet.size} new players to create...`);

  if (missingPlayersSet.size > 0) {
    const newPlayersData = Array.from(missingPlayersSet).map((name) => ({
      name,
      nationality: "Indian",
      role: "All-Rounder",
      isCapped: true,
    }));

    await prisma.player.createMany({
      data: newPlayersData,
      skipDuplicates: true,
    });

    const refreshedPlayers = await prisma.player.findMany({
      select: { id: true, name: true },
    });
    for (const p of refreshedPlayers) {
      playerCache[p.name.toLowerCase()] = p.id;
    }
  }

  log.info(
    `Uploading ${parsedMatches.length} matches to database in parallel batches...`,
  );

  let imported = 0;
  let skipped = 0;

  const batches = chunkArray(parsedMatches, 10);

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];

    await Promise.all(
      batch.map(async (parsed) => {
        try {
          const match = await prisma.match.create({ data: parsed.match });
          const matchStatsData = parsed.playerStats
            .map((stat) => ({
              matchId: match.id,
              playerId: playerCache[stat.playerName.toLowerCase()],
              team: toShortName(stat.team),
              season: stat.season,
              runsScored: stat.runsScored,
              ballsFaced: stat.ballsFaced,
              fours: stat.fours,
              sixes: stat.sixes,
              isOut: stat.isOut,
              dismissalKind: stat.dismissalKind,
              oversBowled: stat.oversBowled,
              runsConceded: stat.runsConceded,
              wickets: stat.wickets,
              maidens: stat.maidens,
              dotBalls: stat.dotBalls,
              wides: stat.wides,
              noBalls: stat.noBalls,
              catches: stat.catches,
              stumpings: stat.stumpings,
              runOuts: stat.runOuts,
            }))
            .filter((s) => s.playerId);

          if (matchStatsData.length > 0) {
            await prisma.playerMatchStats.createMany({
              data: matchStatsData,
              skipDuplicates: true,
            });
          }
          imported++;
        } catch (err) {
          skipped++;
        }
      }),
    );

    log.progress(imported + skipped, parsedMatches.length, "matches");
  }

  log.success(`Imported ${imported} matches, skipped ${skipped}`);
  log.done();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
