import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BATCH_SIZE = 50;

function chunkArray(array, size) {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

async function computeRetentionAnalytics() {
  console.log("Calculating Retention Analytics...");

  console.log("Skipping retention analysis (Phase 2 requirement).");
  return;

  const retentions = await prisma.auctionEntry.findMany({
    where: { isRetained: true },
    include: { player: true },
  });

  console.log(`Found ${retentions.length} retained entries to process.`);

  let processed = 0;
  for (const entry of retentions) {
    const { playerId, season } = entry;

    const preStats = await prisma.playerSeasonStats.findMany({
      where: {
        playerId,
        season: { gte: season - 2, lt: season },
      },
    });

    const postStats = await prisma.playerSeasonStats.findMany({
      where: {
        playerId,
        season: { gte: season, lte: season + 1 },
      },
    });

    const preScore =
      preStats.length > 0
        ? preStats.reduce((sum, s) => sum + s.performanceScore, 0) /
          preStats.length
        : 0;

    const postScore =
      postStats.length > 0
        ? postStats.reduce((sum, s) => sum + s.performanceScore, 0) /
          postStats.length
        : 0;

    await prisma.auctionEntry.update({
      where: { id: entry.id },
      data: {
        preRetentionScore: preScore,
        postRetentionScore: postScore,
      },
    });

    processed++;
    if (processed % 10 === 0) {
      process.stdout.write(
        `\rProcessed ${processed}/${retentions.length} retentions`,
      );
    }
  }
  console.log(
    `\rProcessed ${retentions.length}/${retentions.length} retentions ✅`,
  );
}

async function computeFranchiseAnalytics() {
  console.log("\nCalculating Franchise Intelligence Scores...");

  const franchises = await prisma.franchise.findMany({
    include: { seasonStats: true },
  });

  const allPlayerStats = await prisma.playerSeasonStats.findMany({
    include: { player: { select: { role: true } } },
  });

  let totalProcessed = 0;

  for (const franchise of franchises) {
    for (const fStat of franchise.seasonStats) {
      const currentSeason = fStat.season;

      let devScore = 0;
      const franchisePlayers = [
        ...new Set(
          allPlayerStats
            .filter(
              (s) =>
                s.team === franchise.shortName && s.season <= currentSeason,
            )
            .map((s) => s.playerId),
        ),
      ];

      let totalImprovement = 0;
      let validPlayersForDev = 0;

      for (const pId of franchisePlayers) {
        const pStats = allPlayerStats
          .filter(
            (s) =>
              s.playerId === pId &&
              s.team === franchise.shortName &&
              s.season <= currentSeason,
          )
          .sort((a, b) => a.season - b.season);

        if (pStats.length >= 2) {
          const first = pStats[0];
          const last = pStats[pStats.length - 1];

          let imp = 0;
          if (
            first.player.role.includes("Bat") ||
            first.player.role.includes("All")
          ) {
            const runImp =
              first.totalRuns > 0
                ? ((last.totalRuns - first.totalRuns) / first.totalRuns) * 100
                : 0;
            const srImp =
              first.strikeRate > 0
                ? ((last.strikeRate - first.strikeRate) / first.strikeRate) *
                  100
                : 0;
            const matImp =
              first.matches > 0
                ? ((last.matches - first.matches) / first.matches) * 100
                : 0;
            imp = (runImp + srImp + matImp) / 3;
          } else {
            const wktImp =
              first.totalWickets > 0
                ? ((last.totalWickets - first.totalWickets) /
                    first.totalWickets) *
                  100
                : 0;
            const econImp =
              first.economyRate > 0
                ? ((first.economyRate - last.economyRate) / first.economyRate) *
                  100
                : 0;
            const matImp =
              first.matches > 0
                ? ((last.matches - first.matches) / first.matches) * 100
                : 0;
            imp = (wktImp + econImp + matImp) / 3;
          }

          imp = Math.max(-100, Math.min(200, imp));
          totalImprovement += imp;
          validPlayersForDev++;
        }
      }

      if (validPlayersForDev > 0) {
        const avgImp = totalImprovement / validPlayersForDev;
        devScore = Math.min(100, Math.max(0, 50 + avgImp / 4));
      }

      let retScore = 50;
      const seasonRetentions = await prisma.auctionEntry.findMany({
        where: {
          franchiseId: franchise.id,
          season: currentSeason,
          isRetained: true,
        },
      });

      if (seasonRetentions.length > 0) {
        const avgDelta =
          seasonRetentions.reduce(
            (sum, r) =>
              sum + ((r.postRetentionScore || 0) - (r.preRetentionScore || 0)),
            0,
          ) / seasonRetentions.length;
        retScore = Math.min(100, Math.max(0, 50 + avgDelta * 2));
      }

      const aucScore = Math.min(100, Math.max(0, fStat.roiScore * 20));

      let trophScore = 40;
      const winPct =
        fStat.matchesPlayed > 0 ? fStat.matchesWon / fStat.matchesPlayed : 0;
      trophScore += winPct * 40;
      if (fStat.isChampion) trophScore = 100;

      const intelScore =
        aucScore * 0.5 + devScore * 0.3125 + trophScore * 0.1875;

      await prisma.franchiseAnalytics.upsert({
        where: {
          franchiseId_season: {
            franchiseId: franchise.id,
            season: currentSeason,
          },
        },
        update: {
          auctionScore: aucScore,
          developmentScore: devScore,
          retentionScore: retScore,
          trophyEfficiency: trophScore,
          intelligenceScore: intelScore,
        },
        create: {
          franchiseId: franchise.id,
          season: currentSeason,
          auctionScore: aucScore,
          developmentScore: devScore,
          retentionScore: retScore,
          trophyEfficiency: trophScore,
          intelligenceScore: intelScore,
        },
      });

      totalProcessed++;
      process.stdout.write(
        `\rProcessed analytics for ${totalProcessed} franchise seasons...`,
      );
    }
  }

  console.log(
    `\nProcessed analytics for ${totalProcessed} franchise seasons ✅`,
  );
}

async function computePlayerValueScores() {
  console.log("\nCalculating Player Value Scores...");

  const allPlayerStats = await prisma.playerSeasonStats.findMany({
    include: { player: { select: { role: true } } },
  });

  const playersMap = {};

  let processed = 0;
  const BATCH_SIZE = 500;
  for (let i = 0; i < allPlayerStats.length; i += BATCH_SIZE) {
    const batch = allPlayerStats.slice(i, i + BATCH_SIZE);

    const updatePromises = batch.map((stat) => {
      let battingContribution = 0;
      let bowlingContribution = 0;
      let consistencyContribution = 0;
      let awardContribution = 0;

      const participationBonus =
        stat.matches > 0 ? Math.min(10, stat.matches) * 2 : 0;

      if (stat.totalRuns > 0) {
        const srMultiplier =
          stat.strikeRate >= 150
            ? 1.5
            : stat.strikeRate >= 130
              ? 1.2
              : stat.strikeRate < 100
                ? 0.8
                : 1.0;
        battingContribution =
          stat.totalRuns * 0.5 * srMultiplier + participationBonus;
      }

      if (stat.totalWickets > 0) {
        const econBonus =
          stat.economyRate <= 6.0
            ? 1.5
            : stat.economyRate <= 8.0
              ? 1.2
              : stat.economyRate > 10.0
                ? 0.8
                : 1.0;
        bowlingContribution =
          stat.totalWickets * 15 * econBonus + participationBonus;
      }

      if (stat.matches > 0) {
        if (
          stat.player.role.includes("Bat") &&
          stat.totalRuns < stat.matches * 10
        )
          consistencyContribution -= 20;
        if (
          stat.player.role.includes("Bowl") &&
          stat.totalWickets < stat.matches * 0.5
        )
          consistencyContribution -= 20;
      }

      awardContribution = stat.playerOfMatch * 25;

      let rawValueScore =
        battingContribution +
        bowlingContribution +
        consistencyContribution +
        awardContribution;
      let valueScore = Math.min(100, Math.max(0, rawValueScore / 4));

      if (!playersMap[stat.playerId]) {
        playersMap[stat.playerId] = [];
      }
      playersMap[stat.playerId].push({
        battingContribution,
        bowlingContribution,
        consistencyContribution,
        valueScore,
      });

      return prisma.playerSeasonStats.update({
        where: { id: stat.id },
        data: {
          battingContribution,
          bowlingContribution,
          consistencyContribution,
          awardContribution,
          valueScore,
        },
      });
    });

    await prisma.$transaction(updatePromises);
    processed += batch.length;
    if (processed % 500 === 0 || processed === allPlayerStats.length) {
      process.stdout.write(
        `\rProcessed ${processed}/${allPlayerStats.length} season stats`,
      );
    }
  }

  console.log(
    `\rProcessed ${allPlayerStats.length}/${allPlayerStats.length} season stats ✅`,
  );
  console.log("\nAggregating Lifetime Player Analytics...");

  const playerIds = Object.keys(playersMap);
  let aggregated = 0;

  const ops = [];

  for (const pId of playerIds) {
    const seasons = playersMap[pId];

    const sortedValue = [...seasons]
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 3);
    const lifetimeValueScore =
      sortedValue.reduce((sum, s) => sum + s.valueScore, 0) /
      sortedValue.length;

    const battingValueScore =
      seasons.reduce((sum, s) => sum + s.battingContribution, 0) /
      seasons.length;
    const bowlingValueScore =
      seasons.reduce((sum, s) => sum + s.bowlingContribution, 0) /
      seasons.length;
    const consistencyScore =
      seasons.reduce((sum, s) => sum + s.consistencyContribution, 0) /
      seasons.length;

    ops.push(
      prisma.playerAnalytics.upsert({
        where: { playerId: pId },
        update: {
          lifetimeValueScore,
          battingValueScore,
          bowlingValueScore,
          consistencyScore,
        },
        create: {
          playerId: pId,
          lifetimeValueScore,
          battingValueScore,
          bowlingValueScore,
          consistencyScore,
        },
      }),
    );
  }

  const chunkedOps = chunkArray(ops, 500);
  for (const batch of chunkedOps) {
    await prisma.$transaction(batch);
    aggregated += batch.length;
    process.stdout.write(
      `\rAggregated ${aggregated}/${playerIds.length} lifetime analytics...`,
    );
  }

  console.log(`Aggregated lifetime analytics for ${aggregated} players ✅`);
}

async function main() {
  console.log("=============================================");
  console.log("🚀 Phase 7: Compute Advanced Analytics");
  console.log("=============================================\n");

  try {
    await computeRetentionAnalytics();
    await computeFranchiseAnalytics();
    await computePlayerValueScores();
    console.log("\n✨ Advanced Analytics computation complete!\n");
  } catch (error) {
    console.error("Error computing advanced analytics:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
