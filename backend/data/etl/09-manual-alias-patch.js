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

  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('\"PlayerAlias\"', 'id'), coalesce(max(id), 0) + 1, false) FROM \"PlayerAlias\";`,
    );
    console.log("✅ Reset PlayerAlias sequence successfully.");
  } catch (e) {
    console.error(
      "⚠️ Failed to reset sequence (might not be postgres):",
      e.message,
    );
  }

  let updatedEntries = 0;
  let skipped = 0;

  for (const [auctionName, cricsheetName] of Object.entries(aliases)) {
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
      console.log(`✅ Created alias: ${auctionName} ↔ ${cricsheetName}`);
    } catch (e) {
      console.error(`Error creating alias for ${auctionName}:`, e.message);
    }

    const auctionPlayer = await prisma.player.findFirst({
      where: { name: auctionName },
    });

    if (auctionPlayer && auctionPlayer.id !== cricsheetPlayer.id) {
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
            `✅ Linked Auction Entry: ${auctionName} ↔ ${cricsheetName} (Season ${entry.season})`,
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

      try {
        await prisma.playerMatchStats.deleteMany({
          where: { playerId: auctionPlayer.id },
        });
        await prisma.playerSeasonStats.deleteMany({
          where: { playerId: auctionPlayer.id },
        });
        await prisma.venueMasteryStat.deleteMany({
          where: { playerId: auctionPlayer.id },
        });
        await prisma.playerCrazyStats.deleteMany({
          where: { playerId: auctionPlayer.id },
        });
        await prisma.headToHeadStat.deleteMany({
          where: {
            OR: [
              { batterId: auctionPlayer.id },
              { bowlerId: auctionPlayer.id },
            ],
          },
        });

        await prisma.playerAnalytics.deleteMany({
          where: { playerId: auctionPlayer.id },
        });
        await prisma.playerAlias.deleteMany({
          where: { playerId: auctionPlayer.id },
        });
        await prisma.player.delete({
          where: { id: auctionPlayer.id },
        });
        console.log(`🗑️ Deleted duplicate player record: ${auctionName}`);
      } catch (err) {
        console.error(
          `⚠️ Failed to delete duplicate player ${auctionName}:`,
          err.message,
        );
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
