import NodeCache from "node-cache";
import { getPrisma } from "../config/index.js";

const recordCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

export async function getDynamicRecord(categoryId, recordId) {
  if (recordCache.has(recordId)) {
    return recordCache.get(recordId);
  }

  const result = await computeDynamicRecord(categoryId, recordId);

  if (Array.isArray(result) && result.length > 0) {
    recordCache.set(recordId, result);
  }
  return result;
}

export async function getSeasonLeaderboards() {
  const prisma = await getPrisma();
  const limit = 10;

  const baseInclude = {
    player: { select: { id: true, name: true, role: true, nationality: true } },
  };

  const [
    mostRuns,
    mostWickets,
    mostSixes,
    highestStrikeRate,
    bestEconomy,
    highestScore,
  ] = await Promise.all([
    prisma.playerSeasonStats.findMany({
      orderBy: { totalRuns: "desc" },
      take: limit,
      include: baseInclude,
    }),
    prisma.playerSeasonStats.findMany({
      orderBy: { totalWickets: "desc" },
      take: limit,
      include: baseInclude,
    }),
    prisma.playerSeasonStats.findMany({
      orderBy: { sixes: "desc" },
      take: limit,
      include: baseInclude,
    }),
    prisma.playerSeasonStats.findMany({
      where: { totalRuns: { gte: 150 } },
      orderBy: { strikeRate: "desc" },
      take: limit,
      include: baseInclude,
    }),
    prisma.playerSeasonStats.findMany({
      where: { totalWickets: { gte: 10 } },
      orderBy: { economyRate: "asc" },
      take: limit,
      include: baseInclude,
    }),
    prisma.playerSeasonStats.findMany({
      orderBy: { highestScore: "desc" },
      take: limit,
      include: baseInclude,
    }),
  ]);

  return {
    mostRuns,
    mostWickets,
    mostSixes,
    highestStrikeRate,
    bestEconomy,
    highestScore,
  };
}

async function computeDynamicRecord(categoryId, recordId) {
  const prisma = await getPrisma();
  const limit = 20;

  switch (recordId) {
    case "career-runs":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { runsScored: true },
          orderBy: { _sum: { runsScored: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "runsScored"));

    case "career-100s": {
      const stats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        where: { runsScored: { gte: 100 } },
        _count: { playerId: true },
      });
      stats.sort((a, b) => b._count.playerId - a._count.playerId);
      return await formatPlayerStats(
        stats.slice(0, limit),
        prisma,
        "_count",
        "playerId",
      );
    }

    case "career-50s": {
      const stats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        where: { runsScored: { gte: 50, lt: 100 } },
        _count: { playerId: true },
      });
      stats.sort((a, b) => b._count.playerId - a._count.playerId);
      return await formatPlayerStats(
        stats.slice(0, limit),
        prisma,
        "_count",
        "playerId",
      );
    }

    case "career-sixes":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { sixes: true },
          orderBy: { _sum: { sixes: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "sixes"));

    case "career-fours":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { fours: true },
          orderBy: { _sum: { fours: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "fours"));

    case "career-strike-rate": {
      const srStats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { runsScored: true, ballsFaced: true },
        having: { ballsFaced: { _sum: { gte: 500 } } },
      });
      srStats.forEach((s) => {
        s.strikeRate =
          s._sum.ballsFaced > 0
            ? (s._sum.runsScored / s._sum.ballsFaced) * 100
            : 0;
      });
      srStats.sort((a, b) => b.strikeRate - a.strikeRate);
      return await formatPlayerStats(
        srStats.slice(0, limit),
        prisma,
        "",
        "strikeRate",
      );
    }

    case "career-average": {
      const avgStats = await prisma.venueMasteryStat.groupBy({
        by: ["playerId"],
        _sum: { runsScored: true, inningsBat: true, notOuts: true },
        having: { inningsBat: { _sum: { gte: 30 } } },
      });
      avgStats.forEach((s) => {
        const dismissals = s._sum.inningsBat - s._sum.notOuts;
        s.average =
          dismissals > 0 ? s._sum.runsScored / dismissals : s._sum.runsScored;
      });
      avgStats.sort((a, b) => b.average - a.average);
      return await formatPlayerStats(
        avgStats.slice(0, limit),
        prisma,
        "",
        "average",
      );
    }

    case "highest-score":
      return await prisma.playerMatchStats
        .findMany({
          orderBy: { runsScored: "desc" },
          take: limit,
          select: {
            playerId: true,
            runsScored: true,
            ballsFaced: true,
            season: true,
            team: true,
          },
        })
        .then((res) =>
          formatRawMatchStats(
            res,
            prisma,
            "runsScored",
            (m) =>
              `${m.runsScored} off ${m.ballsFaced} balls for ${m.team} (${m.season})`,
          ),
        );

    case "most-sixes-innings":
      return await prisma.playerMatchStats
        .findMany({
          orderBy: { sixes: "desc" },
          take: limit,
          select: {
            playerId: true,
            sixes: true,
            runsScored: true,
            ballsFaced: true,
            season: true,
            team: true,
          },
        })
        .then((res) =>
          formatRawMatchStats(
            res,
            prisma,
            "sixes",
            (m) =>
              `${m.sixes} sixes (${m.runsScored} runs) for ${m.team} (${m.season})`,
          ),
        );

    case "most-boundaries-innings": {
      const bMatches = await prisma.playerMatchStats.findMany({
        orderBy: { runsScored: "desc" },
        take: 1000,
        select: {
          playerId: true,
          fours: true,
          sixes: true,
          runsScored: true,
          season: true,
          team: true,
        },
      });
      bMatches.forEach((m) => (m.totalBoundaries = m.fours + m.sixes));
      bMatches.sort((a, b) => b.totalBoundaries - a.totalBoundaries);
      return await formatRawMatchStats(
        bMatches.slice(0, limit),
        prisma,
        "totalBoundaries",
        (m) =>
          `${m.totalBoundaries} boundaries (${m.fours}x4, ${m.sixes}x6) for ${m.team} (${m.season})`,
      );
    }

    case "fastest-50": {
      const f50 = await prisma.playerMatchStats.findMany({
        where: { runsScored: { gte: 50, lt: 100 } },
        select: {
          playerId: true,
          runsScored: true,
          ballsFaced: true,
          season: true,
          team: true,
        },
      });
      f50.forEach((m) => {
        m.sr = m.ballsFaced > 0 ? (m.runsScored / m.ballsFaced) * 100 : 0;
      });
      f50.sort((a, b) => b.sr - a.sr);
      return await formatRawMatchStats(
        f50.slice(0, limit),
        prisma,
        "sr",
        (m) =>
          `${m.runsScored} off ${m.ballsFaced} for ${m.team} (${m.season})`,
      );
    }

    case "fastest-100": {
      const f100 = await prisma.playerMatchStats.findMany({
        where: { runsScored: { gte: 100 } },
        select: {
          playerId: true,
          runsScored: true,
          ballsFaced: true,
          season: true,
          team: true,
        },
      });
      f100.forEach((m) => {
        m.sr = m.ballsFaced > 0 ? (m.runsScored / m.ballsFaced) * 100 : 0;
      });
      f100.sort((a, b) => b.sr - a.sr);
      return await formatRawMatchStats(
        f100.slice(0, limit),
        prisma,
        "sr",
        (m) =>
          `${m.runsScored} off ${m.ballsFaced} for ${m.team} (${m.season})`,
      );
    }

    case "boundary-runs": {
      const bStats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { fours: true, sixes: true },
        having: { runsScored: { _sum: { gte: 500 } } },
      });
      bStats.forEach((s) => {
        s.totalBoundaryRuns = s._sum.fours * 4 + s._sum.sixes * 6;
      });
      bStats.sort((a, b) => b.totalBoundaryRuns - a.totalBoundaryRuns);
      return await formatPlayerStats(
        bStats.slice(0, limit),
        prisma,
        "",
        "totalBoundaryRuns",
      );
    }

    case "seasons-500": {
      const s500 = await prisma.playerSeasonStats.groupBy({
        by: ["playerId"],
        where: { totalRuns: { gte: 500 } },
        _count: { playerId: true },
      });
      s500.sort((a, b) => b._count.playerId - a._count.playerId);
      return await formatPlayerStats(
        s500.slice(0, limit),
        prisma,
        "_count",
        "playerId",
      );
    }

    case "orange-caps": {
      const allSeasons = await prisma.playerSeasonStats.findMany({
        select: { playerId: true, season: true, totalRuns: true },
      });
      const seasonMax = {};
      allSeasons.forEach((s) => {
        if (
          !seasonMax[s.season] ||
          s.totalRuns > seasonMax[s.season].totalRuns
        ) {
          seasonMax[s.season] = s;
        }
      });
      const caps = {};
      Object.values(seasonMax).forEach((s) => {
        caps[s.playerId] = (caps[s.playerId] || 0) + 1;
      });
      const capsArr = Object.entries(caps)
        .map(([playerId, count]) => ({ playerId, count }))
        .sort((a, b) => b.count - a.count);
      return await formatRawMatchStats(
        capsArr.slice(0, limit),
        prisma,
        "count",
        () => "Orange Caps Won",
      );
    }

    case "consecutive-50s":
    case "consecutive-30s": {
      const threshold = recordId === "consecutive-50s" ? 50 : 30;
      const allStats = await prisma.playerMatchStats.findMany({
        select: {
          playerId: true,
          runsScored: true,
          match: { select: { date: true } },
        },
      });

      const playerLogs = {};
      allStats.forEach((s) => {
        if (!playerLogs[s.playerId]) playerLogs[s.playerId] = [];
        playerLogs[s.playerId].push({
          runs: s.runsScored,
          date: new Date(s.match.date).getTime(),
        });
      });

      const streaks = [];
      for (const [playerId, logs] of Object.entries(playerLogs)) {
        logs.sort((a, b) => a.date - b.date);
        let maxStreak = 0;
        let currentStreak = 0;
        logs.forEach((log) => {
          if (log.runs >= threshold) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
          } else {
            currentStreak = 0;
          }
        });
        if (maxStreak > 0) streaks.push({ playerId, maxStreak });
      }

      streaks.sort((a, b) => b.maxStreak - a.maxStreak);
      return await formatRawMatchStats(
        streaks.slice(0, limit),
        prisma,
        "maxStreak",
        (s) => `Matches in a row with ${threshold}+ runs`,
      );
    }

    case "sixes-per-innings": {
      const sStats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { sixes: true },
        _count: { playerId: true },
        having: { playerId: { _count: { gte: 30 } } },
      });
      sStats.forEach((s) => {
        s.sixPerInns =
          s._count.playerId > 0 ? s._sum.sixes / s._count.playerId : 0;
      });
      sStats.sort((a, b) => b.sixPerInns - a.sixPerInns);
      return await formatPlayerStats(
        sStats.slice(0, limit),
        prisma,
        "",
        "sixPerInns",
      );
    }

    case "six-frequency": {
      const freqStats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { sixes: true, ballsFaced: true },
        having: { ballsFaced: { _sum: { gte: 300 } } },
      });
      freqStats.forEach((s) => {
        s.sixFreq =
          s._sum.ballsFaced > 0 ? (s._sum.sixes / s._sum.ballsFaced) * 100 : 0;
      });
      freqStats.sort((a, b) => b.sixFreq - a.sixFreq);
      return await formatPlayerStats(
        freqStats.slice(0, limit),
        prisma,
        "",
        "sixFreq",
      );
    }

    case "boundary-percentage": {
      const boundaryStats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { runsScored: true, fours: true, sixes: true },
        having: { runsScored: { _sum: { gte: 1000 } } },
      });
      boundaryStats.forEach((s) => {
        const boundaryRuns = s._sum.fours * 4 + s._sum.sixes * 6;
        s.boundaryPercentage =
          s._sum.runsScored > 0 ? (boundaryRuns / s._sum.runsScored) * 100 : 0;
      });
      boundaryStats.sort((a, b) => b.boundaryPercentage - a.boundaryPercentage);
      return await formatPlayerStats(
        boundaryStats.slice(0, limit),
        prisma,
        "",
        "boundaryPercentage",
      );
    }

    case "death-runs":
      return await prisma.playerCrazyStats
        .findMany({
          orderBy: { deathOversRunsScored: "desc" },
          take: limit,
          select: { playerId: true, deathOversRunsScored: true },
        })
        .then((res) =>
          formatRawMatchStats(
            res,
            prisma,
            "deathOversRunsScored",
            () => "Total Runs in Overs 16-20",
          ),
        );

    case "death-sr": {
      const dSrStats = await prisma.playerCrazyStats.findMany({
        where: { deathOversBallsFaced: { gte: 100 } },
        select: {
          playerId: true,
          deathOversRunsScored: true,
          deathOversBallsFaced: true,
        },
      });
      dSrStats.forEach((s) => {
        s.deathSR = (s.deathOversRunsScored / s.deathOversBallsFaced) * 100;
      });
      dSrStats.sort((a, b) => b.deathSR - a.deathSR);
      return await formatRawMatchStats(
        dSrStats.slice(0, limit),
        prisma,
        "deathSR",
        (s) =>
          `${s.deathOversRunsScored} runs off ${s.deathOversBallsFaced} balls`,
      );
    }

    case "finisher-chases": {
      const allMatches = await prisma.playerMatchStats.findMany({
        select: {
          playerId: true,
          isOut: true,
          team: true,
          match: { select: { winner: true, team2: true } },
        },
      });

      const chases = {};
      allMatches.forEach((m) => {
        if (!m.isOut && m.team === m.match.winner && m.team === m.match.team2) {
          chases[m.playerId] = (chases[m.playerId] || 0) + 1;
        }
      });

      const chasesArr = Object.entries(chases)
        .map(([playerId, count]) => ({ playerId, count }))
        .sort((a, b) => b.count - a.count);
      return await formatRawMatchStats(
        chasesArr.slice(0, limit),
        prisma,
        "count",
        () => "Successful chases (Not Out)",
      );
    }

    case "career-wickets":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { wickets: true },
          orderBy: { _sum: { wickets: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "wickets"));

    case "best-figures":
      return await prisma.playerMatchStats
        .findMany({
          orderBy: [{ wickets: "desc" }, { runsConceded: "asc" }],
          take: limit,
          select: {
            playerId: true,
            wickets: true,
            runsConceded: true,
            oversBowled: true,
            season: true,
            team: true,
          },
        })
        .then((res) =>
          formatRawMatchStats(
            res,
            prisma,
            "wickets",
            (m) =>
              `${m.wickets}/${m.runsConceded} in ${m.oversBowled} overs for ${m.team} (${m.season})`,
          ),
        );

    case "career-dot-balls":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { dotBalls: true },
          orderBy: { _sum: { dotBalls: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "dotBalls"));

    case "career-maidens":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { maidens: true },
          orderBy: { _sum: { maidens: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "maidens"));

    case "career-5w": {
      const w5Stats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        where: { wickets: { gte: 5 } },
        _count: { playerId: true },
      });
      w5Stats.sort((a, b) => b._count.playerId - a._count.playerId);
      return await formatPlayerStats(
        w5Stats.slice(0, limit),
        prisma,
        "_count",
        "playerId",
      );
    }

    case "powerplay-wickets":
      return await prisma.playerCrazyStats
        .findMany({
          orderBy: { powerplayWickets: "desc" },
          take: limit,
          select: { playerId: true, powerplayWickets: true },
        })
        .then((res) =>
          formatRawMatchStats(
            res,
            prisma,
            "powerplayWickets",
            () => "Wickets in Overs 1-6",
          ),
        );

    case "career-catches":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { catches: true },
          orderBy: { _sum: { catches: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "catches"));

    case "career-stumpings":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { stumpings: true },
          orderBy: { _sum: { stumpings: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "stumpings"));

    case "career-runouts":
      return await prisma.playerMatchStats
        .groupBy({
          by: ["playerId"],
          _sum: { runOuts: true },
          orderBy: { _sum: { runOuts: "desc" } },
          take: limit,
        })
        .then((res) => formatPlayerStats(res, prisma, "_sum", "runOuts"));

    case "venue-runs":
      return await prisma.venueMasteryStat
        .findMany({
          orderBy: { runsScored: "desc" },
          take: limit,
          select: { playerId: true, runsScored: true, venue: true },
        })
        .then((res) =>
          formatRawMatchStats(res, prisma, "runsScored", (m) => m.venue),
        );

    case "venue-wickets":
      return await prisma.venueMasteryStat
        .findMany({
          orderBy: { wickets: "desc" },
          take: limit,
          select: { playerId: true, wickets: true, venue: true },
        })
        .then((res) =>
          formatRawMatchStats(res, prisma, "wickets", (m) => m.venue),
        );

    case "venue-sixes":
      return await prisma.venueMasteryStat
        .findMany({
          orderBy: { sixes: "desc" },
          take: limit,
          select: { playerId: true, sixes: true, venue: true },
        })
        .then((res) =>
          formatRawMatchStats(res, prisma, "sixes", (m) => m.venue),
        );

    case "venue-sr": {
      const vSrStats = await prisma.venueMasteryStat.findMany({
        where: { ballsFaced: { gte: 200 } },
        select: {
          playerId: true,
          runsScored: true,
          ballsFaced: true,
          venue: true,
        },
      });
      vSrStats.forEach((s) => {
        s.sr = (s.runsScored / s.ballsFaced) * 100;
      });
      vSrStats.sort((a, b) => b.sr - a.sr);
      return await formatRawMatchStats(
        vSrStats.slice(0, limit),
        prisma,
        "sr",
        (s) => `${s.venue} (${s.runsScored} off ${s.ballsFaced})`,
      );
    }

    case "silent-assassin": {
      const silentStats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { runsScored: true, fours: true, sixes: true },
        having: { runsScored: { _sum: { gte: 1000 } } },
      });
      silentStats.forEach((s) => {
        const boundaryRuns = s._sum.fours * 4 + s._sum.sixes * 6;
        const nonBoundaryRuns = s._sum.runsScored - boundaryRuns;
        s.nonBoundaryPercentage =
          s._sum.runsScored > 0
            ? (nonBoundaryRuns / s._sum.runsScored) * 100
            : 0;
      });
      silentStats.sort(
        (a, b) => b.nonBoundaryPercentage - a.nonBoundaryPercentage,
      );
      return await formatPlayerStats(
        silentStats.slice(0, limit),
        prisma,
        "",
        "nonBoundaryPercentage",
      );
    }

    case "one-man-army": {
      const allSeasons = await prisma.playerSeasonStats.findMany({
        select: { playerId: true, totalRuns: true, season: true, team: true },
      });

      const teamSeasonTotals = {};
      allSeasons.forEach((s) => {
        const key = `${s.season}_${s.team}`;
        teamSeasonTotals[key] = (teamSeasonTotals[key] || 0) + s.totalRuns;
      });

      const oneManStats = allSeasons
        .map((s) => {
          const key = `${s.season}_${s.team}`;
          const teamTotal = teamSeasonTotals[key];
          const percentage =
            teamTotal > 0 ? (s.totalRuns / teamTotal) * 100 : 0;
          return {
            playerId: s.playerId,
            percentage,
            runs: s.totalRuns,
            season: s.season,
            team: s.team,
            teamTotal,
          };
        })
        .filter((s) => s.runs >= 300);

      oneManStats.sort((a, b) => b.percentage - a.percentage);
      return await formatRawMatchStats(
        oneManStats.slice(0, limit),
        prisma,
        "percentage",
        (m) =>
          `${m.percentage.toFixed(1)}% of ${m.team}'s runs in ${m.season} (${m.runs}/${m.teamTotal})`,
      );
    }

    case "nervous-90s": {
      const n90s = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        where: { runsScored: { gte: 90, lte: 99 }, isOut: true },
        _count: { playerId: true },
      });
      n90s.sort((a, b) => b._count.playerId - a._count.playerId);
      return await formatPlayerStats(
        n90s.slice(0, limit),
        prisma,
        "_count",
        "playerId",
      );
    }

    case "dot-ball-survivor": {
      const dotStats = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { runsScored: true, ballsFaced: true, dotBalls: true },
        having: { runsScored: { _sum: { gte: 500 } } },
      });
      dotStats.forEach((s) => {
        s.dotPercentage =
          s._sum.ballsFaced > 0
            ? (s._sum.dotBalls / s._sum.ballsFaced) * 100
            : 0;
      });
      dotStats.sort((a, b) => b.dotPercentage - a.dotPercentage);
      return await formatPlayerStats(
        dotStats.slice(0, limit),
        prisma,
        "",
        "dotPercentage",
      );
    }

    case "runs-without-cap": {
      const allSeasons = await prisma.playerSeasonStats.findMany({
        select: { playerId: true, season: true, totalRuns: true },
      });
      const seasonMax = {};
      allSeasons.forEach((s) => {
        if (
          !seasonMax[s.season] ||
          s.totalRuns > seasonMax[s.season].totalRuns
        ) {
          seasonMax[s.season] = s;
        }
      });
      const capWinners = new Set(
        Object.values(seasonMax).map((s) => s.playerId),
      );
      const runs = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { runsScored: true },
      });
      const filtered = runs
        .filter((r) => !capWinners.has(r.playerId))
        .sort((a, b) => b._sum.runsScored - a._sum.runsScored);
      return await formatPlayerStats(
        filtered.slice(0, limit),
        prisma,
        "_sum",
        "runsScored",
      );
    }

    case "superstar-ducks": {
      const totalRuns = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        _sum: { runsScored: true },
        having: { runsScored: { _sum: { gte: 2000 } } },
      });
      const superstars = new Set(totalRuns.map((r) => r.playerId));
      const ducks = await prisma.playerMatchStats.groupBy({
        by: ["playerId"],
        where: { runsScored: 0, isOut: true },
        _count: { playerId: true },
      });
      const filtered = ducks
        .filter((d) => superstars.has(d.playerId))
        .sort((a, b) => b._count.playerId - a._count.playerId);
      return await formatPlayerStats(
        filtered.slice(0, limit),
        prisma,
        "_count",
        "playerId",
      );
    }

    case "losing-runs": {
      const matches = await prisma.playerMatchStats.findMany({
        select: {
          playerId: true,
          team: true,
          runsScored: true,
          match: { select: { winner: true } },
        },
      });
      const losingRuns = {};
      matches.forEach((m) => {
        if (m.match.winner && m.team !== m.match.winner) {
          losingRuns[m.playerId] = (losingRuns[m.playerId] || 0) + m.runsScored;
        }
      });
      const arr = Object.entries(losingRuns)
        .map(([playerId, runs]) => ({ playerId, runs }))
        .sort((a, b) => b.runs - a.runs);
      return await formatRawMatchStats(
        arr.slice(0, limit),
        prisma,
        "runs",
        () => "Career Runs in Losses",
      );
    }

    case "losing-wickets": {
      const matches = await prisma.playerMatchStats.findMany({
        select: {
          playerId: true,
          team: true,
          wickets: true,
          match: { select: { winner: true } },
        },
      });
      const losingWkts = {};
      matches.forEach((m) => {
        if (m.match.winner && m.team !== m.match.winner) {
          losingWkts[m.playerId] = (losingWkts[m.playerId] || 0) + m.wickets;
        }
      });
      const arr = Object.entries(losingWkts)
        .map(([playerId, w]) => ({ playerId, w }))
        .sort((a, b) => b.w - a.w);
      return await formatRawMatchStats(
        arr.slice(0, limit),
        prisma,
        "w",
        () => "Career Wickets in Losses",
      );
    }

    case "runs-before-100": {
      const allStats = await prisma.playerMatchStats.findMany({
        select: {
          playerId: true,
          runsScored: true,
          match: { select: { date: true } },
        },
      });
      const logs = {};
      allStats.forEach((s) => {
        if (!logs[s.playerId]) logs[s.playerId] = [];
        logs[s.playerId].push({
          runs: s.runsScored,
          date: new Date(s.match.date).getTime(),
        });
      });
      const runsBefore100 = [];
      for (const [playerId, playerLogs] of Object.entries(logs)) {
        playerLogs.sort((a, b) => a.date - b.date);
        let totalRuns = 0;
        let hit100 = false;
        for (const log of playerLogs) {
          if (log.runs >= 100) {
            hit100 = true;
            break;
          }
          totalRuns += log.runs;
        }
        if (hit100 && totalRuns > 0) {
          runsBefore100.push({ playerId, totalRuns });
        }
      }
      runsBefore100.sort((a, b) => b.totalRuns - a.totalRuns);
      return await formatRawMatchStats(
        runsBefore100.slice(0, limit),
        prisma,
        "totalRuns",
        () => "Runs scored before first century",
      );
    }

    case "season-runs":
      return await prisma.playerSeasonStats
        .findMany({
          orderBy: { totalRuns: "desc" },
          take: limit,
          include: { player: { select: { id: true, name: true } } },
        })
        .then((res) =>
          res.map((r) => ({
            player: r.player,
            value: r.totalRuns,
            context: `Season: ${r.season}`,
          })),
        );
    case "season-wickets":
      return await prisma.playerSeasonStats
        .findMany({
          orderBy: { totalWickets: "desc" },
          take: limit,
          include: { player: { select: { id: true, name: true } } },
        })
        .then((res) =>
          res.map((r) => ({
            player: r.player,
            value: r.totalWickets,
            context: `Season: ${r.season}`,
          })),
        );

    default:
      return [];
  }
}

async function formatPlayerStats(groupedData, prisma, valuePath, valueKey) {
  if (!groupedData || groupedData.length === 0) return [];
  const players = await prisma.player.findMany({
    where: { id: { in: groupedData.map((d) => d.playerId) } },
    select: { id: true, name: true, role: true, nationality: true },
  });
  return groupedData.map((d) => {
    const player = players.find((p) => p.id === d.playerId);
    const val =
      valuePath === "_sum" && d._sum
        ? d._sum[valueKey]
        : valuePath === "_count" && d._count
          ? d._count[valueKey]
          : d[valueKey];
    return {
      player,
      value:
        typeof val === "number" && !Number.isInteger(val)
          ? parseFloat(val.toFixed(2))
          : val,
      raw: d,
    };
  });
}

async function formatRawMatchStats(rawData, prisma, valueKey, contextFn) {
  if (!rawData || rawData.length === 0) return [];
  const players = await prisma.player.findMany({
    where: { id: { in: rawData.map((d) => d.playerId) } },
    select: { id: true, name: true, role: true, nationality: true },
  });
  return rawData.map((d) => {
    const player = players.find((p) => p.id === d.playerId);
    const val = d[valueKey];
    return {
      player,
      value:
        typeof val === "number" && !Number.isInteger(val)
          ? parseFloat(val.toFixed(2))
          : val,
      context: contextFn ? contextFn(d) : "",
    };
  });
}
