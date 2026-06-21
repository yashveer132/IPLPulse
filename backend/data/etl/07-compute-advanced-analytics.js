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

function getPercentile(values, percentile) {
  if (!values || values.length === 0) return 1;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  const val = sorted[Math.max(0, index)];
  return val > 0 ? val : 1;
}

function normalizeWithMagnitude(value, p95, maxVal) {
  if (value <= 0) return 0;
  if (p95 <= 0) return 0;
  if (value <= p95) {
    return (value / p95) * 80;
  }
  if (maxVal <= p95) return 100;
  return Math.min(100, 80 + ((value - p95) / (maxVal - p95)) * 20);
}

function normalizeInverseWithMagnitude(value, p05, minVal, maxVal) {
  if (value <= 0) return 0;
  if (value <= minVal) return 100;
  if (value >= maxVal) return 0;

  if (value >= p05) {
    if (maxVal <= p05) return 0;
    return Math.max(0, 80 * (1 - (value - p05) / (maxVal - p05)));
  } else {
    if (p05 <= minVal) return 100;
    return Math.min(100, 80 + 20 * (1 - (value - minVal) / (p05 - minVal)));
  }
}

async function computePlayerValueScores() {
  console.log("\nCalculating Player Value Scores...");

  const allPlayerStats = await prisma.playerSeasonStats.findMany({
    include: { player: { select: { role: true } } },
  });

  const playersMap = {};

  let processed = 0;
  const BATCH_SIZE = 100;
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
      let valueScore = Math.max(0, rawValueScore / 4);

      if (!playersMap[stat.playerId]) {
        playersMap[stat.playerId] = [];
      }
      playersMap[stat.playerId].push({
        id: stat.id,
        season: stat.season,
        matches: stat.matches,
        innings: stat.innings,
        totalRuns: stat.totalRuns,
        strikeRate: stat.strikeRate,
        average: stat.average,
        fifties: stat.fifties,
        hundreds: stat.hundreds,
        fours: stat.fours,
        sixes: stat.sixes,
        totalWickets: stat.totalWickets,
        bowlingAvg: stat.bowlingAvg,
        economyRate: stat.economyRate,
        dotBallPct: stat.dotBallPct,
        playerOfMatch: stat.playerOfMatch,
        role: stat.player.role,
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

  const rawPlayerStatsList = [];

  for (const pId of playerIds) {
    const seasons = playersMap[pId];

    const totalRuns = seasons.reduce((sum, s) => sum + s.totalRuns, 0);
    const totalWickets = seasons.reduce((sum, s) => sum + s.totalWickets, 0);
    const totalMatches = seasons.reduce((sum, s) => sum + s.matches, 0);
    const totalBoundaries = seasons.reduce(
      (sum, s) => sum + s.fours + s.sixes,
      0,
    );
    const seasonsPlayed = seasons.length;
    const totalPOM = seasons.reduce((sum, s) => sum + s.playerOfMatch, 0);

    const totalBattingInnings = seasons.reduce(
      (sum, s) => sum + (s.totalRuns > 0 ? s.innings || 1 : 0),
      0,
    );
    const rawBattingAverage =
      totalBattingInnings > 0
        ? seasons.reduce(
            (sum, s) => sum + (s.average || 0) * (s.innings || 1),
            0,
          ) / totalBattingInnings
        : 0;

    let totalBallsFaced = 0;
    seasons.forEach((s) => {
      if (s.strikeRate > 0) {
        totalBallsFaced += (s.totalRuns / s.strikeRate) * 100;
      }
    });
    const rawBattingSR =
      totalBallsFaced > 0 ? (totalRuns / totalBallsFaced) * 100 : 0;

    let totalRunsConceded = 0;
    let totalOversBowled = 0;
    seasons.forEach((s) => {
      if (s.totalWickets > 0) {
        const runs = s.totalWickets * s.bowlingAvg;
        totalRunsConceded += runs;
        if (s.economyRate > 0) {
          totalOversBowled += runs / s.economyRate;
        }
      }
    });
    const rawEconomyRate =
      totalOversBowled > 0 ? totalRunsConceded / totalOversBowled : 0;
    const rawBowlingSR =
      totalWickets > 0 ? (totalOversBowled * 6) / totalWickets : 0;

    const activeBowlingSeasons = seasons.filter((s) => s.totalWickets > 0);
    const rawDotBallPct =
      activeBowlingSeasons.length > 0
        ? activeBowlingSeasons.reduce((sum, s) => sum + s.dotBallPct, 0) /
          activeBowlingSeasons.length
        : 0;

    const sortedValue = [...seasons]
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 5);
    const weights = [0.35, 0.25, 0.2, 0.12, 0.08];
    let rawPeakPerformance = 0;
    sortedValue.forEach((s, idx) => {
      rawPeakPerformance += s.valueScore * weights[idx];
    });

    const meaningfulSeasons = seasons.filter((s) => s.matches >= 5);
    let rawConsistency = 70;
    if (meaningfulSeasons.length >= 2) {
      const seasonScores = meaningfulSeasons.map((s) => s.valueScore);
      const mean =
        seasonScores.reduce((sum, val) => sum + val, 0) / seasonScores.length;
      if (mean > 0) {
        const variance =
          seasonScores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          seasonScores.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;
        rawConsistency = Math.max(30, Math.min(100, 100 - cv * 50));
      }
    }

    rawPlayerStatsList.push({
      playerId: pId,
      role: seasons[0].role,
      totalRuns,
      totalWickets,
      totalMatches,
      totalBoundaries,
      seasonsPlayed,
      totalPOM,
      rawBattingAverage,
      rawBattingSR,
      rawEconomyRate,
      rawBowlingSR,
      rawDotBallPct,
      rawPeakPerformance,
      rawConsistency,
      totalOversBowled,
    });
  }

  const battingQualifiers = rawPlayerStatsList.filter(
    (p) => p.totalRuns >= 500,
  );
  const bowlingQualifiers = rawPlayerStatsList.filter(
    (p) => p.totalWickets >= 30 && p.totalOversBowled >= 100,
  );

  const p95Runs = getPercentile(
    rawPlayerStatsList.map((p) => p.totalRuns),
    95,
  );
  const maxRuns = Math.max(...rawPlayerStatsList.map((p) => p.totalRuns), 1);

  const p95BattingAvg = getPercentile(
    battingQualifiers.map((p) => p.rawBattingAverage),
    95,
  );
  const activeBattingAvgs = battingQualifiers
    .map((p) => p.rawBattingAverage)
    .filter((v) => v > 0);
  const maxBattingAvg =
    activeBattingAvgs.length > 0 ? Math.max(...activeBattingAvgs) : 40.0;

  const p95BattingSR = getPercentile(
    battingQualifiers.map((p) => p.rawBattingSR),
    95,
  );
  const activeBattingSRs = battingQualifiers
    .map((p) => p.rawBattingSR)
    .filter((v) => v > 0);
  const maxBattingSR =
    activeBattingSRs.length > 0 ? Math.max(...activeBattingSRs) : 160.0;

  const p95Boundaries = getPercentile(
    rawPlayerStatsList.map((p) => p.totalBoundaries),
    95,
  );
  const maxBoundaries = Math.max(
    ...rawPlayerStatsList.map((p) => p.totalBoundaries),
    1,
  );

  const p95Wickets = getPercentile(
    rawPlayerStatsList.map((p) => p.totalWickets),
    95,
  );
  const maxWickets = Math.max(
    ...rawPlayerStatsList.map((p) => p.totalWickets),
    1,
  );

  const p05Economy = getPercentile(
    bowlingQualifiers.map((p) => p.rawEconomyRate).filter((v) => v > 0),
    5,
  );
  const activeEconRates = bowlingQualifiers
    .map((p) => p.rawEconomyRate)
    .filter((v) => v > 0);
  const minEconomy =
    activeEconRates.length > 0 ? Math.min(...activeEconRates) : 6.0;
  const maxEconomy =
    activeEconRates.length > 0 ? Math.max(...activeEconRates) : 12.0;

  const p05BowlingSR = getPercentile(
    bowlingQualifiers.map((p) => p.rawBowlingSR).filter((v) => v > 0),
    5,
  );
  const activeBowlingSRs = bowlingQualifiers
    .map((p) => p.rawBowlingSR)
    .filter((v) => v > 0);
  const minBowlingSR =
    activeBowlingSRs.length > 0 ? Math.min(...activeBowlingSRs) : 15.0;
  const maxBowlingSR =
    activeBowlingSRs.length > 0 ? Math.max(...activeBowlingSRs) : 35.0;

  const p95DotBallPct = getPercentile(
    rawPlayerStatsList.map((p) => p.rawDotBallPct),
    95,
  );
  const maxDotBallPct = Math.max(
    ...rawPlayerStatsList.map((p) => p.rawDotBallPct),
    1,
  );

  const p95Peak = getPercentile(
    rawPlayerStatsList.map((p) => p.rawPeakPerformance),
    95,
  );
  const maxPeak = Math.max(
    ...rawPlayerStatsList.map((p) => p.rawPeakPerformance),
    1,
  );

  const p95Matches = getPercentile(
    rawPlayerStatsList.map((p) => p.totalMatches),
    95,
  );
  const maxMatches = Math.max(
    ...rawPlayerStatsList.map((p) => p.totalMatches),
    1,
  );

  const p95Seasons = getPercentile(
    rawPlayerStatsList.map((p) => p.seasonsPlayed),
    95,
  );
  const maxSeasons = Math.max(
    ...rawPlayerStatsList.map((p) => p.seasonsPlayed),
    1,
  );

  const p95POM = getPercentile(
    rawPlayerStatsList.map((p) => p.totalPOM),
    95,
  );
  const maxPOM = Math.max(...rawPlayerStatsList.map((p) => p.totalPOM), 1);

  const ops = [];

  for (const raw of rawPlayerStatsList) {
    if (raw.totalMatches < 20) {
      ops.push(
        prisma.playerAnalytics.upsert({
          where: { playerId: raw.playerId },
          update: {
            lifetimeValueScore: 0,
            battingValueScore: 0,
            bowlingValueScore: 0,
            consistencyScore: 0,
          },
          create: {
            playerId: raw.playerId,
            lifetimeValueScore: 0,
            battingValueScore: 0,
            bowlingValueScore: 0,
            consistencyScore: 0,
          },
        }),
      );
      continue;
    }

    let runsScore = normalizeWithMagnitude(raw.totalRuns, p95Runs, maxRuns);
    let boundaryScore = normalizeWithMagnitude(
      raw.totalBoundaries,
      p95Boundaries,
      maxBoundaries,
    );

    let careerBattingScore = 0;
    if (raw.totalRuns >= 500) {
      const avgScore = normalizeWithMagnitude(
        raw.rawBattingAverage,
        p95BattingAvg,
        maxBattingAvg,
      );
      const srScore = normalizeWithMagnitude(
        raw.rawBattingSR,
        p95BattingSR,
        maxBattingSR,
      );
      careerBattingScore =
        runsScore * 0.5 + avgScore * 0.2 + srScore * 0.2 + boundaryScore * 0.1;
    } else {
      careerBattingScore = runsScore * 0.8333 + boundaryScore * 0.1667;
    }

    let wicketsScore = normalizeWithMagnitude(
      raw.totalWickets,
      p95Wickets,
      maxWickets,
    );
    let dotBallScore = normalizeWithMagnitude(
      raw.rawDotBallPct,
      p95DotBallPct,
      maxDotBallPct,
    );

    let careerBowlingScore = 0;
    if (raw.totalWickets >= 30 && raw.totalOversBowled >= 100) {
      const economyScore = normalizeInverseWithMagnitude(
        raw.rawEconomyRate,
        p05Economy,
        minEconomy,
        maxEconomy,
      );
      const bowlingSRScore = normalizeInverseWithMagnitude(
        raw.rawBowlingSR,
        p05BowlingSR,
        minBowlingSR,
        maxBowlingSR,
      );
      careerBowlingScore =
        wicketsScore * 0.5 +
        economyScore * 0.25 +
        bowlingSRScore * 0.15 +
        dotBallScore * 0.1;
    } else {
      careerBowlingScore = wicketsScore * 0.8333 + dotBallScore * 0.1667;
    }

    let careerPerformance = 0;
    const isBatter =
      raw.role.includes("Bat") ||
      raw.role.includes("Keeper") ||
      raw.role.includes("Wicket");
    const isBowler = raw.role.includes("Bowl");
    const isAllRounder = raw.role.includes("All");

    if (isAllRounder) {
      const basePerformance = (careerBattingScore + careerBowlingScore) / 2;
      const allRounderBonus = Math.min(
        10,
        Math.min(careerBattingScore, careerBowlingScore) * 0.1,
      );
      careerPerformance = Math.min(100, basePerformance + allRounderBonus);
    } else if (isBowler) {
      careerPerformance = careerBowlingScore;
    } else {
      careerPerformance = careerBattingScore;
    }

    const peakPerformance = normalizeWithMagnitude(
      raw.rawPeakPerformance,
      p95Peak,
      maxPeak,
    );

    const consistency = raw.rawConsistency;

    const matchesScore = normalizeWithMagnitude(
      raw.totalMatches,
      p95Matches,
      maxMatches,
    );
    const seasonsScore = normalizeWithMagnitude(
      raw.seasonsPlayed,
      p95Seasons,
      maxSeasons,
    );
    const longevityScore = matchesScore * 0.6 + seasonsScore * 0.4;

    const impactScore = normalizeWithMagnitude(raw.totalPOM, p95POM, maxPOM);

    const lifetimeValueScore =
      careerPerformance * 0.4 +
      peakPerformance * 0.25 +
      consistency * 0.1 +
      longevityScore * 0.15 +
      impactScore * 0.1;

    ops.push(
      prisma.playerAnalytics.upsert({
        where: { playerId: raw.playerId },
        update: {
          lifetimeValueScore,
          battingValueScore: careerBattingScore,
          bowlingValueScore: careerBowlingScore,
          consistencyScore: consistency,
        },
        create: {
          playerId: raw.playerId,
          lifetimeValueScore,
          battingValueScore: careerBattingScore,
          bowlingValueScore: careerBowlingScore,
          consistencyScore: consistency,
        },
      }),
    );
  }

  const chunkedOps = chunkArray(ops, 100);
  let aggregated = 0;
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
