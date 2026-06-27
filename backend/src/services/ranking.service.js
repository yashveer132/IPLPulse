import { getPrisma } from "../config/index.js";

const IPL_SALARY_CAPS = {
  2013: 6000,
  2014: 6000,
  2015: 6300,
  2016: 6600,
  2017: 6600,
  2018: 8000,
  2019: 8200,
  2020: 8500,
  2021: 8500,
  2022: 9000,
  2023: 9500,
  2024: 10000,
};

function getSalaryCap(season) {
  return IPL_SALARY_CAPS[season] || 9000;
}

const KNOWN_ANOMALIES = [
  "rohit-sharma-2015",
  "hardik-pandya-2015",
  "yuzvendra-chahal-2014",
];

function isAnomaly(playerName, season) {
  const key = `${playerName.toLowerCase().replace(/\s+/g, "-")}-${season}`;
  return KNOWN_ANOMALIES.includes(key);
}

function getMedian(values) {
  if (values.length === 0) return 200;
  values.sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  if (values.length % 2) return values[half];
  return (values[half - 1] + values[half]) / 2.0;
}

async function getSeasonRoleMedians(prisma) {
  const stats = await prisma.playerSeasonStats.findMany({
    include: { player: { select: { role: true } } },
  });

  const roleMap = {};
  for (const s of stats) {
    if (!roleMap[s.season]) {
      roleMap[s.season] = { Batting: [], Bowling: [] };
    }

    if (s.battingContribution > 0) {
      roleMap[s.season].Batting.push(s.battingContribution);
    }
    if (s.bowlingContribution > 0) {
      roleMap[s.season].Bowling.push(s.bowlingContribution);
    }
  }

  const medians = {};
  for (const year in roleMap) {
    medians[year] = {
      Batting: getMedian(roleMap[year].Batting) || 50,
      Bowling: getMedian(roleMap[year].Bowling) || 50,
    };
  }
  return medians;
}

function calculateTrueValueScore(stat, roleMedians, costPercentage, matches) {
  if (!costPercentage || costPercentage <= 0) return 0;

  const role = stat.player?.role || "Batter";
  const cleanRole = role.includes("All")
    ? "All-Rounder"
    : role.includes("Bowl")
      ? "Bowler"
      : role.includes("Wicket")
        ? "Wicketkeeper Batter"
        : "Batter";

  let roleImpact = 0;
  let roleMedian = 100;

  if (cleanRole === "Batter" || cleanRole === "Wicketkeeper Batter") {
    roleImpact = stat.battingContribution;
    roleMedian = roleMedians.Batting;
  } else if (cleanRole === "Bowler") {
    roleImpact = stat.bowlingContribution;
    roleMedian = roleMedians.Bowling;
  } else {
    roleImpact = stat.battingContribution + stat.bowlingContribution;
    roleMedian = roleMedians.Batting + roleMedians.Bowling;
  }

  const roleMultiplier = roleImpact / Math.max(roleMedian, 1);
  const stabilityMultiplier = Math.log(1 + matches) / Math.log(15);
  const consistencyFactor = 0.7 + 0.6 * (1 - Math.exp(-matches / 10));

  const rawValue = (roleImpact * roleMultiplier) / costPercentage;
  return rawValue * stabilityMultiplier * consistencyFactor;
}

function calculateAuctionImpactScore(
  stat,
  trueValueScore,
  seasonsWithFranchise,
  isChampion,
) {
  const role = stat.player?.role || "Batter";
  const cleanRole = role.includes("All")
    ? "All-Rounder"
    : role.includes("Bowl")
      ? "Bowler"
      : role.includes("Wicket")
        ? "Wicketkeeper Batter"
        : "Batter";

  let roleImpact = 0;
  if (cleanRole === "Batter" || cleanRole === "Wicketkeeper Batter") {
    roleImpact = stat.battingContribution;
  } else if (cleanRole === "Bowler") {
    roleImpact = stat.bowlingContribution;
  } else {
    roleImpact = stat.battingContribution + stat.bowlingContribution;
  }

  const blendedScore = roleImpact * 0.6 + trueValueScore * 0.4;
  const longevityBonus = 1 + Math.min((seasonsWithFranchise - 1) * 0.05, 0.25);
  const champBonus = isChampion ? 1.15 : 1.0;
  return blendedScore * longevityBonus * champBonus;
}

function getRoleImpactValue(stat) {
  const role = stat.player?.role || "Batter";
  if (role.includes("All")) {
    return stat.battingContribution + stat.bowlingContribution;
  }
  if (role.includes("Bowl")) return stat.bowlingContribution;
  return stat.battingContribution;
}

function generateWhy(stat, cost, type) {
  const crores = cost >= 100 ? `${(cost / 100).toFixed(2)} Cr` : `${cost}L`;
  const role = stat.player?.role || "";
  const matches = stat.matches;

  const parts = [];
  if (
    stat.totalRuns > 0 &&
    (stat.totalRuns >= 50 || role.includes("Bat") || role.includes("All"))
  ) {
    parts.push(
      `${stat.totalRuns} runs (${(stat.strikeRate || 0).toFixed(1)} SR)`,
    );
  }
  if (
    stat.totalWickets > 0 &&
    (stat.totalWickets >= 3 || role.includes("Bowl") || role.includes("All"))
  ) {
    parts.push(
      `${stat.totalWickets} wkts (${(stat.economyRate || 0).toFixed(1)} Econ)`,
    );
  }
  const statsStr = parts.length > 0 ? ` [${parts.join(", ")}]` : "";

  if (type === "greatest") {
    if (
      role.includes("All") &&
      stat.battingContribution > 30 &&
      stat.bowlingContribution > 30
    ) {
      return `Elite dual-phase impact for ₹${crores}${statsStr}`;
    }
    if (role.includes("Bowl") && stat.bowlingContribution > 100) {
      return `Elite wicket-taking impact for ₹${crores}${statsStr}`;
    }
    if (stat.battingContribution > 100) {
      return `Elite batting value for ₹${crores}${statsStr}`;
    }
    return `Championship-tier contributor for ₹${crores}${statsStr}`;
  }

  if (type === "bargain") {
    if (matches < 10) {
      return `Massive breakout ROI over ${matches} matches (₹${crores})${statsStr}`;
    }
    return `Elite full-season value buy for just ₹${crores}${statsStr}`;
  }

  if (type === "disaster") {
    if (matches === 0) return `₹${crores} purchase never played a match`;
    if (getRoleImpactValue(stat) < 20) {
      return `₹${crores} purchase failed to justify cost${statsStr}`;
    }
    return `₹${crores} purchase delivered only ${matches} matches${statsStr}`;
  }

  return `Solid contributor for ₹${crores}${statsStr}`;
}

export async function getGreatestPurchases({
  page = 1,
  limit = 25,
  season,
  team,
}) {
  const prisma = await getPrisma();
  const skip = (page - 1) * limit;

  const roleMedians = await getSeasonRoleMedians(prisma);

  const where = {
    soldPrice: { gt: 0 },
    isRetained: false,
    status: { not: "Retained" },
  };
  if (season) where.season = parseInt(season);
  if (team) where.franchise = { shortName: team };

  const entries = await prisma.auctionEntry.findMany({
    where,
    include: {
      player: {
        include: { seasonStats: true },
      },
      franchise: {
        select: {
          id: true,
          shortName: true,
          name: true,
          color: true,
          titleYears: true,
        },
      },
    },
  });

  const bestPurchasesMap = new Map();

  for (const entry of entries) {
    if (isAnomaly(entry.player.name, entry.season)) continue;

    const stat = entry.player.seasonStats.find(
      (s) => s.season === entry.season,
    );
    if (!stat || !entry.franchise) continue;

    stat.player = entry.player;

    const capPercentage = (entry.soldPrice / getSalaryCap(entry.season)) * 100;
    const trueValueScore = calculateTrueValueScore(
      stat,
      roleMedians[entry.season] || { Batting: 100, Bowling: 100 },
      capPercentage,
      stat.matches,
    );

    const seasonsWithFranchise = entry.player.seasonStats.filter(
      (s) => s.team === stat.team && s.matches > 0,
    ).length;
    const isChampion = entry.franchise.titleYears.includes(entry.season);

    const greatestScore = calculateAuctionImpactScore(
      stat,
      trueValueScore,
      Math.max(1, seasonsWithFranchise),
      isChampion,
    );

    const purchaseData = {
      playerId: entry.player.id,
      playerName: entry.player.name,
      season: entry.season,
      team: stat.team,
      franchise: entry.franchise,
      cost: entry.soldPrice,
      costPercentage: capPercentage.toFixed(2) + "%",
      matches: stat.matches,
      confidence: stat.matches >= 10 ? "High" : "Low",
      performanceScore: Math.round(getRoleImpactValue(stat)),
      battingImpact: Math.round(stat.battingContribution || 0),
      bowlingImpact: Math.round(stat.bowlingContribution || 0),
      valueScore: Math.round(trueValueScore),
      longevityBonus:
        (
          1 + Math.min((Math.max(1, seasonsWithFranchise) - 1) * 0.05, 0.25)
        ).toFixed(2) + "x",
      greatestScore: Math.round(greatestScore),
      why: generateWhy(stat, entry.soldPrice, "greatest"),
    };

    const uniqueKey = `${entry.playerId}-${entry.franchise.id}`;
    if (
      !bestPurchasesMap.has(uniqueKey) ||
      bestPurchasesMap.get(uniqueKey).greatestScore < purchaseData.greatestScore
    ) {
      bestPurchasesMap.set(uniqueKey, purchaseData);
    }
  }

  const rankings = Array.from(bestPurchasesMap.values());
  rankings.sort((a, b) => b.greatestScore - a.greatestScore);

  const total = rankings.length;
  const paginated = rankings.slice(skip, skip + limit);
  const ranked = paginated.map((r, i) => ({ rank: skip + i + 1, ...r }));

  return { rankings: ranked, pagination: { page, limit, total } };
}

export async function getBiggestBargains({
  page = 1,
  limit = 25,
  type = "elite",
  season,
  team,
}) {
  const prisma = await getPrisma();
  const skip = (page - 1) * limit;

  const roleMedians = await getSeasonRoleMedians(prisma);

  const where = {
    soldPrice: { gt: 0, lte: 50 },
    isRetained: false,
    status: { not: "Retained" },
  };
  if (season) where.season = parseInt(season);
  if (team) where.franchise = { shortName: team };

  const entries = await prisma.auctionEntry.findMany({
    where,
    include: {
      player: { include: { seasonStats: true } },
      franchise: {
        select: { id: true, shortName: true, name: true, color: true },
      },
    },
  });

  const bestBargainsMap = new Map();

  for (const entry of entries) {
    if (isAnomaly(entry.player.name, entry.season)) continue;

    const stat = entry.player.seasonStats.find(
      (s) => s.season === entry.season,
    );
    if (!stat || !entry.franchise) continue;

    if (type === "elite" && stat.matches < 10) continue;
    if (type === "breakout" && stat.matches >= 10) continue;

    stat.player = entry.player;

    const capPercentage = (entry.soldPrice / getSalaryCap(entry.season)) * 100;
    const trueValueScore = calculateTrueValueScore(
      stat,
      roleMedians[entry.season] || { Batting: 100, Bowling: 100 },
      capPercentage,
      stat.matches,
    );

    const purchaseData = {
      playerId: entry.player.id,
      playerName: entry.player.name,
      season: entry.season,
      team: stat.team,
      franchise: entry.franchise,
      cost: entry.soldPrice,
      costPercentage: capPercentage.toFixed(2) + "%",
      matches: stat.matches,
      confidence: stat.matches >= 10 ? "High" : "Low",
      performanceScore: Math.round(getRoleImpactValue(stat)),
      battingImpact: Math.round(stat.battingContribution || 0),
      bowlingImpact: Math.round(stat.bowlingContribution || 0),
      valueScore: Math.round(trueValueScore),
      why: generateWhy(stat, entry.soldPrice, "bargain"),
    };

    const uniqueKey = `${entry.playerId}-${entry.franchise.id}`;
    if (
      !bestBargainsMap.has(uniqueKey) ||
      bestBargainsMap.get(uniqueKey).valueScore < purchaseData.valueScore
    ) {
      bestBargainsMap.set(uniqueKey, purchaseData);
    }
  }

  const rankings = Array.from(bestBargainsMap.values());
  rankings.sort((a, b) => b.valueScore - a.valueScore);

  const total = rankings.length;
  const paginated = rankings.slice(skip, skip + limit);
  const ranked = paginated.map((r, i) => ({ rank: skip + i + 1, ...r }));

  return { rankings: ranked, pagination: { page, limit, total } };
}

export async function getBiggestDisasters({
  page = 1,
  limit = 25,
  season,
  team,
}) {
  const prisma = await getPrisma();
  const skip = (page - 1) * limit;

  const roleMedians = await getSeasonRoleMedians(prisma);

  const where = {
    soldPrice: { gte: 200 },
    isRetained: false,
    status: { not: "Retained" },
  };
  if (season) where.season = parseInt(season);
  if (team) where.franchise = { shortName: team };

  const entries = await prisma.auctionEntry.findMany({
    where,
    include: {
      player: { include: { seasonStats: true } },
      franchise: {
        select: { id: true, shortName: true, name: true, color: true },
      },
    },
  });

  const disastersMap = new Map();

  for (const entry of entries) {
    if (isAnomaly(entry.player.name, entry.season)) continue;
    if (!entry.franchise) continue;

    const stat = entry.player.seasonStats.find(
      (s) => s.season === entry.season,
    );

    let matches = 0;
    let performanceScore = 0;
    let status = "PLAYED";
    let statObj = {
      player: entry.player,
      battingContribution: 0,
      bowlingContribution: 0,
    };

    if (!stat || stat.matches === 0) {
      status = "DNP (Injured/Benched)";
    } else {
      matches = stat.matches;
      performanceScore = getRoleImpactValue(stat);
      statObj = stat;
    }
    statObj.player = entry.player;

    const capPercentage = (entry.soldPrice / getSalaryCap(entry.season)) * 100;
    let trueValueScore = 0;
    if (matches > 0) {
      trueValueScore = calculateTrueValueScore(
        statObj,
        roleMedians[entry.season] || { Batting: 100, Bowling: 100 },
        capPercentage,
        matches,
      );
    }

    const purchaseData = {
      playerId: entry.player.id,
      playerName: entry.player.name,
      season: entry.season,
      team: entry.franchise.shortName,
      franchise: entry.franchise,
      cost: entry.soldPrice,
      costPercentage: capPercentage.toFixed(2) + "%",
      status,
      matches,
      confidence: "High",
      performanceScore: Math.round(performanceScore),
      battingImpact: Math.round(statObj.battingContribution || 0),
      bowlingImpact: Math.round(statObj.bowlingContribution || 0),
      valueScore: Math.round(trueValueScore),
      why: generateWhy(statObj, entry.soldPrice, "disaster"),
    };

    const uniqueKey = `${entry.playerId}-${entry.franchise.id}`;
    if (
      !disastersMap.has(uniqueKey) ||
      disastersMap.get(uniqueKey).valueScore > purchaseData.valueScore
    ) {
      disastersMap.set(uniqueKey, purchaseData);
    }
  }

  const rankings = Array.from(disastersMap.values());
  rankings.sort((a, b) => a.valueScore - b.valueScore);

  const total = rankings.length;
  const paginated = rankings.slice(skip, skip + limit);
  const ranked = paginated.map((r, i) => ({ rank: skip + i + 1, ...r }));

  return { rankings: ranked, pagination: { page, limit, total } };
}

export async function getFranchiseAuctionIq({ season, team } = {}) {
  const prisma = await getPrisma();
  const roleMedians = await getSeasonRoleMedians(prisma);

  const where = {
    soldPrice: { gt: 0 },
    isRetained: false,
    status: { not: "Retained" },
  };
  if (season) where.season = parseInt(season);
  if (team) where.franchise = { shortName: team };

  const entries = await prisma.auctionEntry.findMany({
    where,
    include: {
      player: { include: { seasonStats: true } },
      franchise: {
        select: { id: true, shortName: true, name: true, color: true },
      },
    },
  });

  const franchiseMap = {};

  for (const entry of entries) {
    if (isAnomaly(entry.player.name, entry.season)) continue;
    if (!entry.franchise) continue;

    const fId = entry.franchise.id;
    if (!franchiseMap[fId]) {
      franchiseMap[fId] = {
        franchise: entry.franchise,
        totalSpent: 0,
        playersBought: 0,
        totalValueCreated: 0,
        purchasesAboveMedian: 0,
      };
    }

    const stat = entry.player.seasonStats.find(
      (s) => s.season === entry.season,
    );
    const matches = stat ? stat.matches : 0;

    let trueValueScore = 0;
    if (stat) {
      stat.player = entry.player;
      const capPercentage =
        (entry.soldPrice / getSalaryCap(entry.season)) * 100;
      trueValueScore = calculateTrueValueScore(
        stat,
        roleMedians[entry.season] || { Batting: 100, Bowling: 100 },
        capPercentage,
        matches,
      );
    }

    franchiseMap[fId].totalSpent += entry.soldPrice;
    franchiseMap[fId].playersBought += 1;
    franchiseMap[fId].totalValueCreated += trueValueScore;

    if (!franchiseMap[fId].scores) franchiseMap[fId].scores = [];
    franchiseMap[fId].scores.push({
      season: entry.season,
      valueScore: trueValueScore,
    });
  }

  const seasonScores = {};
  for (const f of Object.values(franchiseMap)) {
    for (const s of f.scores) {
      if (!seasonScores[s.season]) seasonScores[s.season] = [];
      seasonScores[s.season].push(s.valueScore);
    }
  }
  const medianValues = {};
  for (const year in seasonScores) {
    medianValues[year] = getMedian(seasonScores[year]);
  }

  const results = [];
  for (const f of Object.values(franchiseMap)) {
    let successes = 0;
    for (const s of f.scores) {
      if (s.valueScore > (medianValues[s.season] || 0)) successes++;
    }

    const successRate =
      f.playersBought > 0 ? (successes / f.playersBought) * 100 : 0;
    const avgValueScore =
      f.playersBought > 0 ? f.totalValueCreated / f.playersBought : 0;

    results.push({
      franchise: f.franchise,
      totalSpent: f.totalSpent,
      playersBought: f.playersBought,
      totalValueCreated: Math.round(f.totalValueCreated),
      avgValueScore: Math.round(avgValueScore),
      successRate: Math.round(successRate * 10) / 10,
    });
  }

  results.sort((a, b) => b.successRate - a.successRate);

  return results.map((r, i) => ({ rank: i + 1, ...r }));
}
