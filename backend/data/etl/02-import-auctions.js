import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseAuctionCsv } from "./utils/parseAuctionCsv.js";
import Logger from "./utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const log = new Logger("02-auctions");

const RAW_DIR = path.resolve(__dirname, "../raw/auctions");

async function main() {
  if (!fs.existsSync(RAW_DIR)) {
    log.error(`Directory not found: ${RAW_DIR}`);
    log.info(
      "Please download auction CSV files from Kaggle and place them in data/raw/auctions/",
    );
    process.exit(1);
  }

  const csvFiles = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".csv"));
  if (csvFiles.length === 0) {
    log.error("No CSV files found in data/raw/auctions/");
    process.exit(1);
  }

  log.info(`Found ${csvFiles.length} CSV file(s)`);

  const franchises = await prisma.franchise.findMany();
  const franchiseMap = {};
  for (const f of franchises) {
    franchiseMap[f.shortName] = f.id;
  }

  let totalEntries = 0;
  let totalPlayers = 0;

  for (const csvFile of csvFiles) {
    log.info(`Parsing ${csvFile}...`);
    const filePath = path.join(RAW_DIR, csvFile);
    const entries = parseAuctionCsv(filePath);
    log.info(`  → ${entries.length} records found`);

    const existingPlayers = await prisma.player.findMany();
    const playerMap = {};
    for (const p of existingPlayers) {
      playerMap[p.name.toLowerCase()] = p.id;
    }

    const newPlayers = [];
    for (const entry of entries) {
      if (!playerMap[entry.playerName.toLowerCase()]) {
        newPlayers.push({
          name: entry.playerName,
          nationality: entry.nationality,
          role: entry.role,
          isCapped: true,
        });
        playerMap[entry.playerName.toLowerCase()] = "pending";
      }
    }

    if (newPlayers.length > 0) {
      await prisma.player.createMany({
        data: newPlayers,
        skipDuplicates: true,
      });
      const refreshPlayers = await prisma.player.findMany();
      for (const p of refreshPlayers) {
        playerMap[p.name.toLowerCase()] = p.id;
      }
    }

    const auctionData = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const playerId = playerMap[entry.playerName.toLowerCase()];
      if (!playerId || playerId === "pending") continue;

      const franchiseId = entry.team ? franchiseMap[entry.team] || null : null;

      if (entry.season) {
        auctionData.push({
          season: entry.season,
          playerId: playerId,
          franchiseId,
          role: entry.role,
          basePrice: entry.basePrice,
          soldPrice: entry.soldPrice,
          status: entry.status,
          isRetained: entry.isRetained,
        });
      }
    }

    if (auctionData.length > 0) {
      await prisma.auctionEntry.createMany({
        data: auctionData,
        skipDuplicates: true,
      });
      totalEntries += auctionData.length;
      totalPlayers += Object.keys(playerMap).length;
    }

    log.progress(entries.length, entries.length, "entries");
  }

  log.success(
    `Imported ${totalEntries} auction entries for ${totalPlayers} players`,
  );
  log.done();
}

main()
  .catch((e) => {
    log.error("Failed", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
