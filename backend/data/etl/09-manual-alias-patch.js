import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyManualAliases() {
  console.log("=============================================");
  console.log("🚀 Phase 9: Manual Player Alias Patch");
  console.log("=============================================\n");

  const configPath = path.join(__dirname, "config", "manual-aliases.json");
  const aliases = JSON.parse(fs.readFileSync(configPath, "utf8"));

  let updatedEntries = 0;
  let skipped = 0;

  for (const [auctionName, cricsheetName] of Object.entries(aliases)) {
    const auctionPlayer = await prisma.player.findFirst({
      where: { name: auctionName },
    });

    if (!auctionPlayer) {
      console.log(`⚠️ Auction player not found: ${auctionName}`);
      skipped++;
      continue;
    }

    const cricsheetPlayer = await prisma.player.findFirst({
      where: { name: cricsheetName },
    });

    if (!cricsheetPlayer) {
      console.log(`⚠️ Cricsheet player not found: ${cricsheetName}`);
      skipped++;
      continue;
    }

    try {
      await prisma.playerAlias.upsert({
        where: { alias: auctionName },
        update: {
          playerId: cricsheetPlayer.id,
          confidence: 100,
          needsReview: false,
        },
        create: {
          alias: auctionName,
          playerId: cricsheetPlayer.id,
          confidence: 100,
          needsReview: false,
        },
      });
    } catch (e) {}

    const entries = await prisma.auctionEntry.findMany({
      where: { playerId: auctionPlayer.id },
    });

    for (const entry of entries) {
      try {
        await prisma.auctionEntry.update({
          where: { id: entry.id },
          data: { playerId: cricsheetPlayer.id },
        });
        updatedEntries++;
        console.log(
          `✅ Linked ${auctionName} ↔ ${cricsheetName} (Season ${entry.season})`,
        );
      } catch (e) {
        if (e.code === "P2002") {
          console.log(
            `ℹ️ Link already exists for ${auctionName} in ${entry.season}`,
          );
        } else {
          console.error(`Error linking ${auctionName}:`, e.message);
        }
      }
    }
  }

  console.log(
    `\n✅ Manual Patch Complete! Updated ${updatedEntries} auction entries.`,
  );
}

applyManualAliases()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
