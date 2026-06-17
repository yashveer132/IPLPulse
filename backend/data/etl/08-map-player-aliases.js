import { PrismaClient } from "@prisma/client";
import stringSimilarity from "string-similarity";

const prisma = new PrismaClient();

function getLastName(name) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

function getFirstInitial(name) {
  return name.trim()[0]?.toLowerCase() || "";
}

async function mapPlayerAliases() {
  console.log("=============================================");
  console.log("🚀 Phase 8: Automated Player Name Mapping");
  console.log("=============================================\n");

  const auctionPlayers = await prisma.player.findMany({
    where: { auctionEntries: { some: {} } },
    select: { id: true, name: true, role: true },
  });

  const cricsheetPlayers = await prisma.player.findMany({
    where: { seasonStats: { some: {} } },
    select: { id: true, name: true, role: true },
  });

  console.log(
    `Found ${auctionPlayers.length} Auction Players and ${cricsheetPlayers.length} Cricsheet Players.\n`,
  );

  const aliasesToCreate = [];
  const entriesToUpdate = [];

  for (const aucPlayer of auctionPlayers) {
    let bestMatch = null;
    let highestConfidence = 0;

    const aucLast = getLastName(aucPlayer.name);
    const aucFirst = getFirstInitial(aucPlayer.name);

    for (const cricPlayer of cricsheetPlayers) {
      let confidence = 0;

      const cricLast = getLastName(cricPlayer.name);
      const cricFirst = getFirstInitial(cricPlayer.name);

      if (aucPlayer.name.toLowerCase() === cricPlayer.name.toLowerCase()) {
        confidence = 100;
      } else {
        if (aucLast === cricLast && aucFirst === cricFirst) {
          confidence = 95;
        } else if (aucLast === cricLast) {
          confidence = 80;
        } else {
          const similarity = stringSimilarity.compareTwoStrings(
            aucPlayer.name.toLowerCase(),
            cricPlayer.name.toLowerCase(),
          );
          confidence = Math.round(similarity * 100);
        }
      }

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = cricPlayer;
      }
    }

    if (bestMatch && highestConfidence > 60) {
      aliasesToCreate.push({
        alias: aucPlayer.name,
        playerId: bestMatch.id,
        confidence: highestConfidence,
        needsReview: highestConfidence < 90,
      });

      if (highestConfidence >= 90) {
        entriesToUpdate.push({
          oldPlayerId: aucPlayer.id,
          newPlayerId: bestMatch.id,
        });
      }
    }
  }

  console.log(`Generated ${aliasesToCreate.length} potential aliases.`);
  console.log(
    `Found ${entriesToUpdate.length} highly confident matches to merge.\n`,
  );

  let aliasInserted = 0;
  for (const alias of aliasesToCreate) {
    try {
      await prisma.playerAlias.upsert({
        where: { alias: alias.alias },
        update: {
          playerId: alias.playerId,
          confidence: alias.confidence,
          needsReview: alias.needsReview,
        },
        create: alias,
      });
      aliasInserted++;
    } catch (e) {}
  }
  console.log(`Upserted ${aliasInserted} aliases.`);

  let updatedEntries = 0;
  for (const merge of entriesToUpdate) {
    if (merge.oldPlayerId === merge.newPlayerId) continue;

    const entries = await prisma.auctionEntry.findMany({
      where: { playerId: merge.oldPlayerId },
    });

    for (const entry of entries) {
      try {
        await prisma.auctionEntry.update({
          where: { id: entry.id },
          data: { playerId: merge.newPlayerId },
        });
        updatedEntries++;
      } catch (e) {
        console.error(
          `Could not update auction entry for ${entry.id}:`,
          e.message,
        );
      }
    }
  }

  console.log(
    `\nUpdated ${updatedEntries} AuctionEntry rows to point to matched Cricsheet players.`,
  );
  console.log("✅ Automated Player Name Mapping Complete!\n");
}

mapPlayerAliases()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
