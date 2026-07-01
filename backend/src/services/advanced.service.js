import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPrisma } from "../config/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function getTeamDevelopmentIndex() {
  const prisma = await getPrisma();

  const analytics = await prisma.franchiseAnalytics.findMany({
    orderBy: { season: "asc" },
  });

  const allPlayerStats = await prisma.playerSeasonStats.findMany({
    select: { playerId: true, team: true },
  });

  const franchises = await prisma.franchise.findMany({
    select: { id: true, name: true, shortName: true, color: true },
  });

  const rankings = franchises
    .map((f) => {
      const fAnalytics = analytics.filter((a) => a.franchiseId === f.id);

      let totalScore = 0;
      const history = [];
      fAnalytics.forEach((a) => {
        totalScore += a.developmentScore || 0;
        history.push({
          season: a.season,
          score: Math.round((a.developmentScore || 0) * 100) / 100,
        });
      });
      const avgScore =
        fAnalytics.length > 0 ? totalScore / fAnalytics.length : 0;

      const fStats = allPlayerStats.filter((s) => s.team === f.shortName);
      const uniquePlayers = [...new Set(fStats.map((s) => s.playerId))];
      const totalPlayersAnalyzed = uniquePlayers.length;

      let validTrajectories = 0;
      for (const pId of uniquePlayers) {
        const pSeasons = fStats.filter((s) => s.playerId === pId);
        if (pSeasons.length >= 2) validTrajectories++;
      }

      let confidenceLevel = "Low";
      if (validTrajectories >= 25) confidenceLevel = "High";
      else if (validTrajectories >= 10) confidenceLevel = "Medium";

      return {
        franchise: f,
        developmentScore: Math.round(avgScore * 100) / 100,
        totalPlayersAnalyzed,
        validTrajectories,
        confidenceLevel,
        history,
      };
    })
    .sort((a, b) => b.developmentScore - a.developmentScore);

  return rankings.map((r, i) => ({ rank: i + 1, ...r }));
}

export async function getTeamDevelopmentBreakdown(franchiseId) {
  const prisma = await getPrisma();

  const franchise = await prisma.franchise.findUnique({
    where: { id: franchiseId },
  });

  if (!franchise) throw new Error("Franchise not found");

  const allPlayerStats = await prisma.playerSeasonStats.findMany({
    where: { team: franchise.shortName },
    include: { player: { select: { id: true, name: true, role: true } } },
    orderBy: { season: "asc" },
  });

  const uniquePlayers = [...new Set(allPlayerStats.map((s) => s.playerId))];
  const trajectories = [];

  for (const pId of uniquePlayers) {
    const pStats = allPlayerStats.filter((s) => s.playerId === pId);

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
            ? ((last.strikeRate - first.strikeRate) / first.strikeRate) * 100
            : 0;
        const matImp =
          first.matches > 0
            ? ((last.matches - first.matches) / first.matches) * 100
            : 0;
        imp = (runImp + srImp + matImp) / 3;
      } else {
        const wktImp =
          first.totalWickets > 0
            ? ((last.totalWickets - first.totalWickets) / first.totalWickets) *
              100
            : 0;
        const econImp =
          first.economyRate > 0
            ? ((first.economyRate - last.economyRate) / first.economyRate) * 100
            : 0;
        const matImp =
          first.matches > 0
            ? ((last.matches - first.matches) / first.matches) * 100
            : 0;
        imp = (wktImp + econImp + matImp) / 3;
      }

      imp = Math.max(-100, Math.min(200, imp));

      trajectories.push({
        player: first.player,
        firstSeason: first,
        lastSeason: last,
        deltaScore: Math.round(imp * 100) / 100,
        contribution: Math.round((imp / 4) * 100) / 100,
      });
    }
  }

  trajectories.sort((a, b) => b.deltaScore - a.deltaScore);

  const topContributors = trajectories.slice(0, 5);
  const bottomContributors = [...trajectories].reverse().slice(0, 5);

  return {
    franchise,
    totalPlayersAnalyzed: uniquePlayers.length,
    validTrajectories: trajectories.length,
    topContributors,
    bottomContributors,
    allTrajectories: trajectories,
  };
}

export async function getRetentionAnalytics(page = 1, limit = 25) {
  const prisma = await getPrisma();
  const skip = (page - 1) * limit;

  const retentions = await prisma.auctionEntry.findMany({
    where: {
      isRetained: true,
      preRetentionScore: { not: null },
      postRetentionScore: { not: null },
    },
    include: {
      player: { select: { id: true, name: true, role: true } },
      franchise: {
        select: { id: true, name: true, shortName: true, color: true },
      },
    },
  });

  const analyzed = retentions
    .map((r) => {
      const pre = r.preRetentionScore || 0;
      const post = r.postRetentionScore || 0;
      const efficiency = post - pre;

      return {
        id: r.id,
        season: r.season,
        player: r.player,
        franchise: r.franchise,
        preScore: Math.round(pre * 100) / 100,
        postScore: Math.round(post * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        cost: r.soldPrice || r.basePrice,
      };
    })
    .sort((a, b) => b.efficiency - a.efficiency);

  const total = analyzed.length;
  const paginated = analyzed.slice(skip, skip + limit);

  return {
    best: analyzed.slice(0, 10),
    worst: [...analyzed].reverse().slice(0, 10),
    all: paginated.map((r, i) => ({ rank: skip + i + 1, ...r })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getFranchiseIntelligenceScore() {
  const prisma = await getPrisma();

  const analytics = await prisma.franchiseAnalytics.groupBy({
    by: ["franchiseId"],
    _avg: {
      auctionScore: true,
      developmentScore: true,
      retentionScore: true,
      trophyEfficiency: true,
      intelligenceScore: true,
    },
  });

  const franchises = await prisma.franchise.findMany({
    where: { id: { in: analytics.map((a) => a.franchiseId) } },
    select: { id: true, name: true, shortName: true, color: true },
  });

  const rankings = analytics
    .map((a) => {
      const f = franchises.find((f) => f.id === a.franchiseId);
      return {
        franchise: f,
        scores: {
          auction: Math.round((a._avg.auctionScore || 0) * 100) / 100,
          development: Math.round((a._avg.developmentScore || 0) * 100) / 100,
          retention: Math.round((a._avg.retentionScore || 0) * 100) / 100,
          trophy: Math.round((a._avg.trophyEfficiency || 0) * 100) / 100,
          total: Math.round((a._avg.intelligenceScore || 0) * 100) / 100,
        },
      };
    })
    .sort((a, b) => b.scores.total - a.scores.total);

  return rankings.map((r, i) => ({ rank: i + 1, ...r }));
}

export async function getFranchiseTrends() {
  const prisma = await getPrisma();

  const analytics = await prisma.franchiseAnalytics.findMany({
    include: {
      franchise: {
        select: { id: true, name: true, shortName: true, color: true },
      },
    },
    orderBy: { season: "asc" },
  });

  const trendsByFranchise = {};

  analytics.forEach((a) => {
    const key = a.franchise.shortName;
    if (!trendsByFranchise[key]) {
      trendsByFranchise[key] = {
        franchise: a.franchise,
        history: [],
      };
    }
    trendsByFranchise[key].history.push({
      season: a.season,
      intelligenceScore: Math.round((a.intelligenceScore || 0) * 100) / 100,
    });
  });

  return Object.values(trendsByFranchise);
}

export async function getPlayerValueRankings(
  role = "all",
  page = 1,
  limit = 50,
) {
  const prisma = await getPrisma();
  const skip = (page - 1) * limit;

  let roleFilter = {};
  if (role === "batters") {
    roleFilter = { role: { contains: "Bat", mode: "insensitive" } };
  } else if (role === "bowlers") {
    roleFilter = { role: { contains: "Bowl", mode: "insensitive" } };
  } else if (role === "all-rounders") {
    roleFilter = { role: { contains: "All", mode: "insensitive" } };
  }

  const [analytics, total] = await Promise.all([
    prisma.playerAnalytics.findMany({
      where: { player: roleFilter },
      include: {
        player: {
          select: { id: true, name: true, role: true, nationality: true },
        },
      },
      orderBy: { lifetimeValueScore: "desc" },
      skip,
      take: limit,
    }),
    prisma.playerAnalytics.count({ where: { player: roleFilter } }),
  ]);

  return {
    players: analytics.map((a, i) => ({ rank: skip + i + 1, ...a })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPlayerValueBreakdown(playerId) {
  const prisma = await getPrisma();

  const [player, analytics, seasons] = await Promise.all([
    prisma.player.findUnique({ where: { id: playerId } }),
    prisma.playerAnalytics.findUnique({ where: { playerId } }),
    prisma.playerSeasonStats.findMany({
      where: { playerId },
      orderBy: { season: "asc" },
      select: {
        season: true,
        team: true,
        matches: true,
        totalRuns: true,
        strikeRate: true,
        totalWickets: true,
        economyRate: true,
        playerOfMatch: true,
        battingContribution: true,
        bowlingContribution: true,
        consistencyContribution: true,
        awardContribution: true,
        valueScore: true,
      },
    }),
  ]);

  return {
    player,
    lifetimeAnalytics: analytics,
    seasons,
  };
}

export async function getPlatformSummary() {
  const prisma = await getPrisma();

  const [totalFranchises, totalPlayers, auctionAgg, seasonsAgg] =
    await Promise.all([
      prisma.franchise.count(),
      prisma.player.count(),
      prisma.auctionEntry.aggregate({
        _sum: { soldPrice: true },
      }),
      prisma.match.aggregate({
        _min: { season: true },
        _max: { season: true },
      }),
    ]);

  const totalSpendLakhs = auctionAgg._sum.soldPrice || 0;
  const totalSpendCrores = Math.round(totalSpendLakhs / 100);

  return {
    totalFranchises,
    totalPlayers:
      totalPlayers > 1000
        ? `${Math.floor(totalPlayers / 100) * 100}+`
        : totalPlayers,
    totalAuctionSpend: `₹${totalSpendCrores}+ Cr`,
    seasonsCovered:
      seasonsAgg._min.season && seasonsAgg._max.season
        ? `${seasonsAgg._min.season}-${seasonsAgg._max.season}`
        : "No data",
  };
}

export async function getFastestMilestone(targetRuns) {
  const DIR = path.resolve("data/raw/cricsheet");
  const CACHE_PATH = path.join(__dirname, "../data/milestones_cache.json");

  if (!fs.existsSync(DIR)) {
    if (fs.existsSync(CACHE_PATH)) {
      const cacheContent = await fs.promises.readFile(CACHE_PATH, "utf-8");
      const cacheData = JSON.parse(cacheContent);
      return cacheData.milestones[targetRuns] || { fastest: [], slowest: [] };
    }
    throw new Error("Cricsheet raw data and milestones cache not found");
  }

  const files = await fs.promises
    .readdir(DIR)
    .then((list) => list.filter((f) => f.endsWith(".json")));
  const fileContents = await Promise.all(
    files.map((file) =>
      fs.promises
        .readFile(path.join(DIR, file), "utf-8")
        .then(JSON.parse)
        .catch(() => null),
    ),
  );

  const results = [];

  for (const data of fileContents) {
    if (!data || !data.innings) continue;

    for (const inning of data.innings) {
      const batStats = {};

      for (const over of inning.overs) {
        for (const delivery of over.deliveries) {
          const batter = delivery.batter;
          if (!batStats[batter]) {
            batStats[batter] = {
              runs: 0,
              balls: 0,
              reachedTarget: false,
              sequence: [],
              boundariesRuns: 0,
              rotationRuns: 0,
              powerplayRuns: 0,
              middleRuns: 0,
              deathRuns: 0,
              bowlersTargeted: {},
              currentBoundaryStreak: 0,
              maxBoundaryStreak: 0,
              currentNonDotStreak: 0,
              maxNonDotStreak: 0,
            };
          }

          const stats = batStats[batter];
          if (stats.reachedTarget) continue;

          if (!delivery.extras?.wides) {
            stats.balls += 1;
            stats.sequence.push(delivery.runs.batter);
          }

          const r = delivery.runs.batter;
          stats.runs += r;

          if (!stats.bowlersTargeted[delivery.bowler]) {
            stats.bowlersTargeted[delivery.bowler] = { runs: 0, balls: 0 };
          }
          stats.bowlersTargeted[delivery.bowler].runs += r;
          if (!delivery.extras?.wides) {
            stats.bowlersTargeted[delivery.bowler].balls += 1;
          }

          if (r === 4 || r === 6) {
            stats.currentBoundaryStreak++;
            stats.maxBoundaryStreak = Math.max(
              stats.maxBoundaryStreak,
              stats.currentBoundaryStreak,
            );
            stats.boundariesRuns += r;
          } else {
            stats.currentBoundaryStreak = 0;
            if (r > 0 && r < 4) stats.rotationRuns += r;
          }

          if (r > 0) {
            stats.currentNonDotStreak++;
            stats.maxNonDotStreak = Math.max(
              stats.maxNonDotStreak,
              stats.currentNonDotStreak,
            );
          } else if (!delivery.extras?.wides) {
            stats.currentNonDotStreak = 0;
          }

          const overNum = over.over;
          if (overNum < 6) stats.powerplayRuns += r;
          else if (overNum < 15) stats.middleRuns += r;
          else stats.deathRuns += r;

          if (stats.runs === targetRuns) {
            stats.reachedTarget = true;
            let matchResult = "Lost";
            if (data.info.outcome?.winner === inning.team) matchResult = "Won";
            else if (!data.info.outcome?.winner) matchResult = "Tie/No Result";

            let againstTeam = "Unknown";
            if (data.info.teams && data.info.teams.length === 2) {
              againstTeam =
                data.info.teams.find((t) => t !== inning.team) || "Unknown";
            }
            const venue = data.info.venue || data.info.city || "Unknown Venue";

            const tossWinner = data.info.toss?.winner || "Unknown";
            const tossDecision = data.info.toss?.decision || "Unknown";

            let primaryVictim = "None";
            let maxBowlerRuns = -1;
            let victimBalls = 0;
            for (const [bName, bStats] of Object.entries(
              stats.bowlersTargeted,
            )) {
              if (bStats.runs > maxBowlerRuns) {
                maxBowlerRuns = bStats.runs;
                primaryVictim = bName;
                victimBalls = bStats.balls;
              }
            }

            const halfIndex = Math.floor(stats.sequence.length / 2);
            const firstHalfRuns = stats.sequence
              .slice(0, halfIndex)
              .reduce((a, b) => a + b, 0);
            const secondHalfRuns = stats.sequence
              .slice(halfIndex)
              .reduce((a, b) => a + b, 0);
            const initialSR =
              halfIndex > 0
                ? ((firstHalfRuns / halfIndex) * 100).toFixed(0)
                : 0;
            const deathSR =
              stats.sequence.length - halfIndex > 0
                ? (
                    (secondHalfRuns / (stats.sequence.length - halfIndex)) *
                    100
                  ).toFixed(0)
                : 0;

            results.push({
              id: `${batter}-${data.info.dates[0]}-${stats.balls}`,
              playerName: batter,
              runsScored: stats.runs,
              ballsFaced: stats.balls,
              matchDate: data.info.dates[0],
              team: inning.team,
              againstTeam,
              venue,
              sequence: [...stats.sequence],
              boundariesRuns: stats.boundariesRuns,
              rotationRuns: stats.rotationRuns,
              powerplayRuns: stats.powerplayRuns,
              middleRuns: stats.middleRuns,
              deathRuns: stats.deathRuns,
              matchResult,
              tossWinner,
              tossDecision,
              maxBoundaryStreak: stats.maxBoundaryStreak,
              maxNonDotStreak: stats.maxNonDotStreak,
              primaryVictim,
              victimRuns: maxBowlerRuns,
              victimBalls,
              initialSR,
              deathSR,
            });
          } else if (stats.runs > targetRuns) {
            stats.reachedTarget = true;
          }
        }
      }
    }
  }

  results.sort((a, b) => a.ballsFaced - b.ballsFaced);
  const fastest = results.slice(0, 10);
  const slowest = [...results]
    .sort((a, b) => b.ballsFaced - a.ballsFaced)
    .slice(0, 10);
  return { fastest, slowest };
}

export async function getFastestMilestoneCurve() {
  const DIR = path.resolve("data/raw/cricsheet");
  const CACHE_PATH = path.join(__dirname, "../data/milestones_cache.json");

  if (!fs.existsSync(DIR)) {
    if (fs.existsSync(CACHE_PATH)) {
      const cacheContent = await fs.promises.readFile(CACHE_PATH, "utf-8");
      const cacheData = JSON.parse(cacheContent);
      return cacheData.curve || [];
    }
    throw new Error("Cricsheet raw data and milestones cache not found");
  }

  const files = await fs.promises
    .readdir(DIR)
    .then((list) => list.filter((f) => f.endsWith(".json")));
  const fileContents = await Promise.all(
    files.map((file) =>
      fs.promises
        .readFile(path.join(DIR, file), "utf-8")
        .then(JSON.parse)
        .catch(() => null),
    ),
  );

  const minBallsPerScore = {};

  for (const data of fileContents) {
    if (!data || !data.innings) continue;

    for (const inning of data.innings) {
      const batStats = {};
      for (const over of inning.overs) {
        for (const delivery of over.deliveries) {
          const batter = delivery.batter;
          if (!batStats[batter]) batStats[batter] = { runs: 0, balls: 0 };
          const stats = batStats[batter];

          if (!delivery.extras?.wides) stats.balls += 1;
          const prevRuns = stats.runs;
          stats.runs += delivery.runs.batter;

          if (
            stats.runs >= 20 &&
            stats.runs <= 175 &&
            stats.runs !== prevRuns
          ) {
            if (
              !minBallsPerScore[stats.runs] ||
              stats.balls < minBallsPerScore[stats.runs].balls
            ) {
              minBallsPerScore[stats.runs] = {
                balls: stats.balls,
                playerName: batter,
              };
            }
          }
        }
      }
    }
  }

  const curve = [];
  for (let i = 20; i <= 175; i++) {
    if (minBallsPerScore[i]) {
      curve.push({
        runs: i,
        balls: minBallsPerScore[i].balls,
        playerName: minBallsPerScore[i].playerName,
      });
    }
  }
  return curve;
}

export async function getHeadToHead(player1Id, player2Id) {
  const prisma = await getPrisma();

  const [p1BatsVsP2, p2BatsVsP1] = await Promise.all([
    prisma.headToHeadStat.findUnique({
      where: {
        batterId_bowlerId: { batterId: player1Id, bowlerId: player2Id },
      },
      include: {
        batter: { select: { name: true, role: true } },
        bowler: { select: { name: true, role: true } },
      },
    }),
    prisma.headToHeadStat.findUnique({
      where: {
        batterId_bowlerId: { batterId: player2Id, bowlerId: player1Id },
      },
      include: {
        batter: { select: { name: true, role: true } },
        bowler: { select: { name: true, role: true } },
      },
    }),
  ]);

  if (!p1BatsVsP2 && !p2BatsVsP1) return null;

  const player1Name =
    p1BatsVsP2?.batter?.name || p2BatsVsP1?.bowler?.name || "Player 1";
  const player2Name =
    p1BatsVsP2?.bowler?.name || p2BatsVsP1?.batter?.name || "Player 2";

  const [p1Teams, p2Teams] = await Promise.all([
    prisma.playerMatchStats.findMany({
      where: { playerId: player1Id },
      distinct: ["season"],
      select: { season: true, team: true },
    }),
    prisma.playerMatchStats.findMany({
      where: { playerId: player2Id },
      distinct: ["season"],
      select: { season: true, team: true },
    }),
  ]);

  const p1TeamMap = {};
  p1Teams.forEach((t) => (p1TeamMap[t.season] = t.team));

  const p2TeamMap = {};
  p2Teams.forEach((t) => (p2TeamMap[t.season] = t.team));

  return {
    player1: { name: player1Name, teamMap: p1TeamMap },
    player2: { name: player2Name, teamMap: p2TeamMap },

    p1Batting: p1BatsVsP2
      ? {
          runsScored: p1BatsVsP2.runsScored,
          ballsFaced: p1BatsVsP2.ballsFaced,
          dismissals: p1BatsVsP2.dismissals,
          fours: p1BatsVsP2.fours,
          sixes: p1BatsVsP2.sixes,
          dotBalls: p1BatsVsP2.dotBalls,
          strikeRate: p1BatsVsP2.strikeRate,
          seasonDetails: p1BatsVsP2.seasonDetails,
          phaseDetails: p1BatsVsP2.phaseDetails,
          dismissalDetails: p1BatsVsP2.dismissalDetails,
        }
      : null,

    p2Batting: p2BatsVsP1
      ? {
          runsScored: p2BatsVsP1.runsScored,
          ballsFaced: p2BatsVsP1.ballsFaced,
          dismissals: p2BatsVsP1.dismissals,
          fours: p2BatsVsP1.fours,
          sixes: p2BatsVsP1.sixes,
          dotBalls: p2BatsVsP1.dotBalls,
          strikeRate: p2BatsVsP1.strikeRate,
          seasonDetails: p2BatsVsP1.seasonDetails,
          phaseDetails: p2BatsVsP1.phaseDetails,
          dismissalDetails: p2BatsVsP1.dismissalDetails,
        }
      : null,
  };
}

export async function getVenueMastery(playerId) {
  const prisma = await getPrisma();
  return prisma.venueMasteryStat.findMany({
    where: { playerId },
    orderBy: [{ runsScored: "desc" }, { wickets: "desc" }],
  });
}

export async function getCrazyStats(playerId) {
  const prisma = await getPrisma();
  return prisma.playerCrazyStats.findUnique({
    where: { playerId },
  });
}
