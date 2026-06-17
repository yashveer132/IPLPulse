import { PrismaClient } from "@prisma/client";
import { cosineSimilarity } from "../utils/math.js";
const prisma = new PrismaClient();

const globalCache = {
  allSeasons: null,
  allStats: null,
  allCrazyStats: null,
  lastFetched: 0,
};
const CACHE_TTL = 1000 * 60 * 60;

const getCachedAggregates = async () => {
  if (
    globalCache.allSeasons &&
    Date.now() - globalCache.lastFetched < CACHE_TTL
  ) {
    return globalCache;
  }
  const [allSeasons, allStats, allCrazyStats] = await Promise.all([
    prisma.playerSeasonStats.findMany({
      include: { player: { select: { role: true } } },
    }),
    prisma.playerSeasonStats.groupBy({
      by: ["playerId"],
      _sum: {
        matches: true,
        innings: true,
        totalRuns: true,
        fours: true,
        sixes: true,
        fifties: true,
        hundreds: true,
        totalWickets: true,
      },
      _avg: {
        average: true,
        strikeRate: true,
        economyRate: true,
        bowlingAvg: true,
        dotBallPct: true,
      },
      _max: { totalRuns: true, totalWickets: true },
    }),
    prisma.playerCrazyStats.findMany(),
  ]);
  globalCache.allSeasons = allSeasons;
  globalCache.allStats = allStats;
  globalCache.allCrazyStats = allCrazyStats;
  globalCache.lastFetched = Date.now();
  return globalCache;
};

export const getCareerTrajectory = async (playerId) => {
  const seasons = await prisma.playerSeasonStats.findMany({
    where: { playerId },
    orderBy: { season: "asc" },
    include: {
      player: {
        select: { name: true, role: true },
      },
    },
  });

  if (!seasons || seasons.length === 0) return null;

  let peakSeason = null;
  let maxScore = -1;

  seasons.forEach((s) => {
    if (s.performanceScore > maxScore) {
      maxScore = s.performanceScore;
      peakSeason = s;
    }
  });

  let bestWindow = { start: null, end: null, avgScore: -1 };

  if (seasons.length >= 3) {
    for (let i = 0; i <= seasons.length - 3; i++) {
      const window = seasons.slice(i, i + 3);

      const matchesInWindow = window.reduce((sum, s) => sum + s.matches, 0);
      if (matchesInWindow >= 15) {
        const avg = window.reduce((sum, s) => sum + s.performanceScore, 0) / 3;
        if (avg > bestWindow.avgScore) {
          bestWindow = {
            start: window[0].season,
            end: window[2].season,
            avgScore: avg,
          };
        }
      }
    }
  } else if (seasons.length > 0 && bestWindow.start === null) {
    bestWindow = {
      start: seasons[0].season,
      end: seasons[seasons.length - 1].season,
      avgScore:
        seasons.reduce((sum, s) => sum + s.performanceScore, 0) /
        seasons.length,
    };
  }

  let trajectory = "Stable";
  if (seasons.length >= 2) {
    const latest = seasons[seasons.length - 1].performanceScore;
    const previous = seasons[seasons.length - 2].performanceScore;
    const diff = latest - previous;

    if (diff > 15) trajectory = "Improving significantly";
    else if (diff > 5) trajectory = "Trending upwards";
    else if (diff < -15) trajectory = "Declining significantly";
    else if (diff < -5) trajectory = "Trending downwards";
  }

  const eras = [];
  if (seasons.length > 0 && bestWindow.start) {
    let currentEraSeasons = [];
    let currentEraName = "Breakthrough";

    for (let i = 0; i < seasons.length; i++) {
      const s = seasons[i];
      if (s.season < bestWindow.start) {
        if (
          currentEraName !== "Breakthrough" &&
          currentEraName !== "Ascension"
        ) {
          eras.push({
            name: currentEraName,
            start: currentEraSeasons[0].season,
            end: currentEraSeasons[currentEraSeasons.length - 1].season,
          });
          currentEraSeasons = [];
        }
        currentEraName =
          s.season === seasons[0].season ? "Breakthrough" : "Ascension";
        currentEraSeasons.push(s);
      } else if (s.season >= bestWindow.start && s.season <= bestWindow.end) {
        if (currentEraName !== "Prime") {
          if (currentEraSeasons.length > 0)
            {eras.push({
              name: currentEraName,
              start: currentEraSeasons[0].season,
              end: currentEraSeasons[currentEraSeasons.length - 1].season,
            });}
          currentEraSeasons = [];
        }
        currentEraName = "Prime";
        currentEraSeasons.push(s);
      } else {
        if (
          currentEraName !== "Veteran Elite" &&
          currentEraName !== "Late Career"
        ) {
          if (currentEraSeasons.length > 0)
            {eras.push({
              name: currentEraName,
              start: currentEraSeasons[0].season,
              end: currentEraSeasons[currentEraSeasons.length - 1].season,
            });}
          currentEraSeasons = [];
        }
        currentEraName =
          s.performanceScore > 40 ? "Veteran Elite" : "Late Career";
        currentEraSeasons.push(s);
      }
    }
    if (currentEraSeasons.length > 0)
      {eras.push({
        name: currentEraName,
        start: currentEraSeasons[0].season,
        end: currentEraSeasons[currentEraSeasons.length - 1].season,
      });}
  }

  return {
    trajectory,
    peakSeason: peakSeason
      ? {
          season: peakSeason.season,
          team: peakSeason.team,
          score: Math.round(peakSeason.performanceScore),
          matches: peakSeason.matches,
          runs: peakSeason.totalRuns,
          wickets: peakSeason.totalWickets,
        }
      : null,
    primeEra: bestWindow.start ? `${bestWindow.start}-${bestWindow.end}` : null,
    eras,
    seasons: seasons.map((s) => ({
      season: s.season,
      team: s.team,
      score: Math.round(s.performanceScore),
      matches: s.matches,
      runs: s.totalRuns,
      wickets: s.totalWickets,
      average: s.average,
      strikeRate: s.strikeRate,
      economy: s.economyRate,
      bowlingAvg: s.bowlingAvg,
    })),
  };
};

export const getHistoricalRivalries = async (playerId) => {
  const asBatter = await prisma.headToHeadStat.findMany({
    where: { batterId: playerId },
    include: { bowler: { select: { name: true, role: true } } },
    orderBy: { ballsFaced: "desc" },
    take: 50,
  });

  const asBowler = await prisma.headToHeadStat.findMany({
    where: { bowlerId: playerId },
    include: { batter: { select: { name: true, role: true } } },
    orderBy: { ballsFaced: "desc" },
    take: 50,
  });

  const enrichMatchup = (m) => {
    const isBatter = !!m.bowler;
    const opponent = isBatter ? m.bowler.name : m.batter.name;
    const average =
      m.dismissals > 0 ? (m.runsScored / m.dismissals).toFixed(1) : "∞";
    const bpd =
      m.dismissals > 0 ? (m.ballsFaced / m.dismissals).toFixed(1) : "∞";
    const intensity = Math.round(
      m.dismissals * 25 +
        (m.runsScored / Math.max(1, m.ballsFaced)) * 20 +
        m.ballsFaced * 0.5,
    );
    return {
      opponent,
      runs: m.runsScored,
      balls: m.ballsFaced,
      dismissals: m.dismissals,
      sr: m.strikeRate,
      average,
      ballsPerDismissal: bpd,
      intensity,
    };
  };

  const batterMatchups = asBatter
    .filter((m) => m.ballsFaced > 15)
    .map(enrichMatchup)
    .sort((a, b) => b.intensity - a.intensity);

  const batterNemesis = batterMatchups.length > 0 ? batterMatchups[0] : null;
  const batterBunny =
    batterMatchups.length > 0
      ? batterMatchups[batterMatchups.length - 1]
      : null;

  const bowlerMatchups = asBowler
    .filter((m) => m.ballsFaced > 15)
    .map(enrichMatchup)
    .sort((a, b) => b.intensity - a.intensity);

  const bowlerBunny = bowlerMatchups.length > 0 ? bowlerMatchups[0] : null;
  const bowlerNemesis =
    bowlerMatchups.length > 0
      ? bowlerMatchups[bowlerMatchups.length - 1]
      : null;

  return {
    topBattlesAsBatter: asBatter.slice(0, 10).map(enrichMatchup),
    topBattlesAsBowler: asBowler.slice(0, 10).map(enrichMatchup),
    nemesis: batterNemesis || bowlerNemesis,
    favorite: batterBunny || bowlerBunny,
  };
};

export const getPlayerDNA = async (playerId) => {
  const matchStats = await prisma.playerMatchStats.findMany({
    where: { playerId },
    include: { match: true },
  });

  if (!matchStats || matchStats.length === 0) return null;

  let totalRuns = 0;
  let totalBalls = 0;
  let totalFours = 0;
  let totalSixes = 0;

  let batFirstRuns = 0,
    batFirstBalls = 0;
  let chaseRuns = 0,
    chaseBalls = 0;
  const homeRuns = 0,
    awayRuns = 0;

  matchStats.forEach((stat) => {
    totalRuns += stat.runsScored;
    totalBalls += stat.ballsFaced;
    totalFours += stat.fours;
    totalSixes += stat.sixes;

    if (stat.match) {
      if (!stat.match.winner) return;

      let teamBattedFirst = stat.match.team1;
      if (stat.match.tossWinner && stat.match.tossDecision) {
        if (stat.match.tossDecision === "bat") {
          teamBattedFirst = stat.match.tossWinner;
        } else {
          teamBattedFirst =
            stat.match.tossWinner === stat.match.team1
              ? stat.match.team2
              : stat.match.team1;
        }
      }

      const isBatFirst = stat.team === teamBattedFirst;
      if (isBatFirst) {
        batFirstRuns += stat.runsScored;
        batFirstBalls += stat.ballsFaced;
      } else {
        chaseRuns += stat.runsScored;
        chaseBalls += stat.ballsFaced;
      }
    }
  });

  const boundaryRuns = totalFours * 4 + totalSixes * 6;
  const runningRuns = totalRuns - boundaryRuns;

  const boundaryPct = totalRuns > 0 ? (boundaryRuns / totalRuns) * 100 : 0;
  const runningPct = totalRuns > 0 ? (runningRuns / totalRuns) * 100 : 0;

  let playstyle = "Anchor";
  if (boundaryPct >= 65) playstyle = "Pure Aggressor";
  else if (boundaryPct >= 55) playstyle = "Anchor + Aggressor";
  else if (boundaryPct >= 45) playstyle = "Accumulator";

  const powerplayImpact = Math.min(
    10,
    (totalFours / Math.max(1, totalRuns)) * 50 + 5,
  ).toFixed(1);
  const deathImpact = Math.min(
    10,
    (totalSixes / Math.max(1, totalRuns)) * 80 + 4,
  ).toFixed(1);
  const middleImpact = Math.min(10, runningPct / 10).toFixed(1);

  return {
    distribution: {
      boundaryPct,
      runningPct,
    },
    playstyle,
    phaseImpacts: {
      powerplay: powerplayImpact,
      middleOvers: middleImpact,
      deathOvers: deathImpact,
    },
    splits: {
      batFirst: {
        runs: batFirstRuns,
        sr: batFirstBalls > 0 ? (batFirstRuns / batFirstBalls) * 100 : 0,
      },
      chase: {
        runs: chaseRuns,
        sr: chaseBalls > 0 ? (chaseRuns / chaseBalls) * 100 : 0,
      },
    },
  };
};

export const getVenueAndOpposition = async (playerId) => {
  const venues = await prisma.venueMasteryStat.findMany({
    where: { playerId },
  });

  const MIN_MATCHES = 8;
  const validVenues = venues.filter((v) => v.matchesPlayed >= MIN_MATCHES);

  const venueRankings = validVenues
    .map((v) => {
      let score = 0;
      if (v.inningsBat > 0) {
        const avg = v.runsScored / Math.max(1, v.inningsBat - v.notOuts);
        const sr = (v.runsScored / Math.max(1, v.ballsFaced)) * 100;
        score += avg + sr / 2;
      }
      if (v.inningsBowl > 0) {
        const bowlAvg = v.wickets > 0 ? v.runsConceded / v.wickets : 50;
        const econ = v.runsConceded / Math.max(1, v.ballsBowled / 6);
        score += 100 - bowlAvg + (50 - econ * 2);
      }
      return { ...v, score };
    })
    .sort((a, b) => b.score - a.score);

  const bestVenue = venueRankings.length > 0 ? venueRankings[0] : null;
  const worstVenue =
    venueRankings.length > 1 ? venueRankings[venueRankings.length - 1] : null;

  const matchStats = await prisma.playerMatchStats.findMany({
    where: { playerId },
    include: { match: true },
  });

  const opponents = {};
  matchStats.forEach((stat) => {
    if (stat.match) {
      const opp =
        stat.team === stat.match.team1 ? stat.match.team2 : stat.match.team1;
      if (!opponents[opp]) opponents[opp] = { runs: 0, wkts: 0, matches: 0 };
      opponents[opp].matches++;
      opponents[opp].runs += stat.runsScored;
      opponents[opp].wkts += stat.wickets;
    }
  });

  const oppArray = Object.keys(opponents)
    .filter((opp) => opponents[opp].matches >= 6)
    .map((opp) => ({
      name: opp,
      ...opponents[opp],
      score: opponents[opp].runs + opponents[opp].wkts * 25,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    bestVenue,
    worstVenue,
    venueRankings: venueRankings.slice(0, 10),
    favoriteOpposition: oppArray.length > 0 ? oppArray[0] : null,
    nemesisOpposition:
      oppArray.length > 1 ? oppArray[oppArray.length - 1] : null,
  };
};

export const getClutchAnalytics = async (playerId) => {
  const matchStats = await prisma.playerMatchStats.findMany({
    where: { playerId },
    include: { match: true },
  });

  let playoffRuns = 0,
    playoffWkts = 0,
    playoffMatches = 0;
  let winRuns = 0,
    winWkts = 0,
    winMatches = 0;
  let lossRuns = 0,
    lossWkts = 0,
    lossMatches = 0;
  let closeGameRuns = 0,
    closeGameWkts = 0,
    closeGameMatches = 0;

  matchStats.forEach((stat) => {
    if (!stat.match) return;

    if (stat.match.matchNumber === null) {
      playoffMatches++;
      playoffRuns += stat.runsScored;
      playoffWkts += stat.wickets;
    }

    if (stat.match.winner === stat.team) {
      winMatches++;
      winRuns += stat.runsScored;
      winWkts += stat.wickets;
    } else if (stat.match.winner && stat.match.winner !== stat.team) {
      lossMatches++;
      lossRuns += stat.runsScored;
      lossWkts += stat.wickets;
    }

    const isClose =
      (stat.match.winType === "runs" && stat.match.winMargin <= 10) ||
      (stat.match.winType === "wickets" && stat.match.winMargin <= 2);

    if (isClose) {
      closeGameMatches++;
      closeGameRuns += stat.runsScored;
      closeGameWkts += stat.wickets;
    }
  });

  let clutchScore = 0;
  if (playoffMatches > 0) clutchScore += 20;
  if (winMatches > lossMatches) clutchScore += 10;
  if (closeGameMatches > 0) clutchScore += closeGameMatches * 2;

  return {
    clutchScore: Math.min(100, clutchScore),
    playoffs: {
      matches: playoffMatches,
      runs: playoffRuns,
      wickets: playoffWkts,
    },
    wins: { matches: winMatches, runs: winRuns, wickets: winWkts },
    losses: { matches: lossMatches, runs: lossRuns, wickets: lossWkts },
    closeGames: {
      matches: closeGameMatches,
      runs: closeGameRuns,
      wickets: closeGameWkts,
    },
  };
};

export const getSimilarPlayers = async (playerId) => {
  const targetPlayer = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!targetPlayer) return null;

  const { allStats, allCrazyStats } = await getCachedAggregates();
  const targetStats = allStats.find((s) => s.playerId === playerId);
  if (!targetStats) return null;

  if ((targetStats._sum.matches || 0) < 30) {
    return [
      {
        similarPlayers: [],
        confidence: "LOW",
        reason: "Insufficient career sample",
      },
    ];
  }

  const isBowler =
    (targetStats._sum.totalRuns || 0) <=
    (targetStats._sum.totalWickets || 0) * 20;

  const playersData = allStats
    .filter((s) => s._sum.matches >= 30)
    .map((s) => {
      let vector = [];
      const crazy = allCrazyStats.find((c) => c.playerId === s.playerId) || {};
      const sIsBowler =
        (s._sum.totalRuns || 0) <= (s._sum.totalWickets || 0) * 20;

      if (isBowler !== sIsBowler) return null;

      if (!isBowler) {
        const rpi = s._sum.innings > 0 ? s._sum.totalRuns / s._sum.innings : 0;
        const boundPct =
          s._sum.totalRuns > 0
            ? (s._sum.fours * 4 + s._sum.sixes * 6) / s._sum.totalRuns
            : 0;
        const sixPerInn =
          s._sum.innings > 0 ? s._sum.sixes / s._sum.innings : 0;
        const fiftyFreq =
          s._sum.innings > 0
            ? (s._sum.fifties + s._sum.hundreds) / s._sum.innings
            : 0;
        const deathSR =
          crazy.deathOversBallsFaced > 0
            ? (crazy.deathOversRunsScored / crazy.deathOversBallsFaced) * 100
            : 0;

        vector = [
          s._avg.average || 0,
          s._avg.strikeRate || 0,
          rpi,
          boundPct,
          sixPerInn,
          fiftyFreq,
          deathSR,
          s._max.totalRuns || 0,
          s._sum.matches || 0,
        ];
      } else {
        const wpm =
          s._sum.matches > 0 ? s._sum.totalWickets / s._sum.matches : 0;
        const deathWktPct =
          s._sum.totalWickets > 0
            ? (crazy.deathOversWickets || 0) / s._sum.totalWickets
            : 0;
        const ppWktPct =
          s._sum.totalWickets > 0
            ? (crazy.powerplayWickets || 0) / s._sum.totalWickets
            : 0;

        vector = [
          s._avg.economyRate || 10,
          s._avg.bowlingAvg || 50,
          wpm,
          s._avg.dotBallPct || 0,
          deathWktPct,
          ppWktPct,
          s._max.totalWickets || 0,
          s._sum.matches || 0,
        ];
      }
      return { playerId: s.playerId, vector };
    })
    .filter((p) => p !== null);

  if (playersData.length === 0) return [];

  const vectorDim = playersData[0].vector.length;
  const means = new Array(vectorDim).fill(0);
  const stdDevs = new Array(vectorDim).fill(0);

  playersData.forEach((p) => {
    p.vector.forEach((val, i) => (means[i] += val));
  });
  means.forEach((val, i) => (means[i] = val / playersData.length));

  playersData.forEach((p) => {
    p.vector.forEach((val, i) => (stdDevs[i] += Math.pow(val - means[i], 2)));
  });
  stdDevs.forEach(
    (val, i) => (stdDevs[i] = Math.sqrt(val / playersData.length)),
  );

  const normalize = (vec) => {
    return vec.map((val, i) => {
      let z = stdDevs[i] > 0 ? (val - means[i]) / stdDevs[i] : 0;

      if (isBowler && (i === 0 || i === 1)) z = -z;

      return z + 5;
    });
  };

  const targetPlayerData = playersData.find((p) => p.playerId === playerId);
  if (!targetPlayerData) return [];

  const normTarget = normalize(targetPlayerData.vector);

  const similarities = playersData
    .filter((p) => p.playerId !== playerId)
    .map((p) => {
      const normVec = normalize(p.vector);
      const score = cosineSimilarity(normTarget, normVec);

      const adjustedScore = Math.max(0, (score - 0.8) * 5);
      return {
        playerId: p.playerId,
        similarityScore: Math.min(99, adjustedScore * 100),
        isBowler,
        vector: p.vector,
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);

  const similarIds = similarities.map((s) => s.playerId);
  const similarPlayersInfo = await prisma.player.findMany({
    where: { id: { in: similarIds } },
    select: { id: true, name: true, role: true },
  });

  return {
    similarPlayers: similarities.map((s) => {
      const info = similarPlayersInfo.find((p) => p.id === s.playerId);
      const roleName = info?.role || (s.isBowler ? "Bowler" : "Batter");

      const reasons = [];
      const tVec = targetPlayerData.vector;
      const sVec = s.vector;

      if (!isBowler) {
        if (Math.abs(tVec[0] - sVec[0]) <= 3)
          {reasons.push("Similar Career Average");}
        if (Math.abs(tVec[1] - sVec[1]) <= 5)
          {reasons.push("Similar Strike Rate");}
        if (Math.abs(tVec[8] - sVec[8]) <= 20)
          {reasons.push("Similar Longevity");}
        if (Math.abs(tVec[3] - sVec[3]) <= 0.05)
          {reasons.push("Similar Boundary %");}
      } else {
        if (Math.abs(tVec[0] - sVec[0]) <= 0.5)
          {reasons.push("Similar Economy Rate");}
        if (Math.abs(tVec[1] - sVec[1]) <= 3)
          {reasons.push("Similar Bowling Average");}
        if (Math.abs(tVec[8] - sVec[8]) <= 20)
          {reasons.push("Similar Longevity");}
        if (Math.abs(tVec[5] - sVec[5]) <= 0.05)
          {reasons.push("Similar Powerplay Impact");}
      }

      if (reasons.length === 0) reasons.push("Similar Overall DNA");

      return {
        playerId: s.playerId,
        name: info ? info.name : "Unknown",
        role: roleName,
        matchPercentage: Math.round(s.similarityScore),
        reasons: reasons.slice(0, 3),
      };
    }),
    confidence: "HIGH",
  };
};

export const getHistoricalRankings = async (playerId) => {
  const targetPlayer = await prisma.player.findUnique({
    where: { id: playerId },
  });
  if (!targetPlayer) return null;

  const { allSeasons } = await getCachedAggregates();

  const playerAggregates = {};
  allSeasons.forEach((s) => {
    if (!playerAggregates[s.playerId]) {
      playerAggregates[s.playerId] = {
        runs: 0,
        wkts: 0,
        matches: 0,
        scores: [],
        role: s.player?.role || "",
      };
    }
    playerAggregates[s.playerId].runs += s.totalRuns;
    playerAggregates[s.playerId].wkts += s.totalWickets;
    playerAggregates[s.playerId].matches += s.matches;
    playerAggregates[s.playerId].scores.push(s.performanceScore);
  });

  const playersArr = Object.keys(playerAggregates).map((id) => ({
    id,
    ...playerAggregates[id],
  }));

  const runsSorted = [...playersArr].sort((a, b) => b.runs - a.runs);
  const wktsSorted = [...playersArr].sort((a, b) => b.wkts - a.wkts);

  const runRank = runsSorted.findIndex((p) => p.id === playerId) + 1;
  const wktRank = wktsSorted.findIndex((p) => p.id === playerId) + 1;

  const totalPlayers = playersArr.length;
  const runPercentile =
    totalPlayers > 0 ? ((totalPlayers - runRank) / totalPlayers) * 100 : 0;

  const isBowler =
    targetPlayer.role && targetPlayer.role.toLowerCase().includes("bowl");
  const rolePeers = playersArr.filter((p) => p.role === targetPlayer.role);
  let roleRank = 0;
  if (rolePeers.length > 0) {
    if (isBowler) {
      rolePeers.sort((a, b) => b.wkts - a.wkts);
      roleRank = rolePeers.findIndex((p) => p.id === playerId) + 1;
    } else {
      rolePeers.sort((a, b) => b.runs - a.runs);
      roleRank = rolePeers.findIndex((p) => p.id === playerId) + 1;
    }
  }
  const rolePercentile =
    rolePeers.length > 0
      ? ((rolePeers.length - roleRank) / rolePeers.length) * 100
      : 0;

  const targetAgg = playerAggregates[playerId];
  if (!targetAgg) return null;

  playersArr.forEach((p) => {
    const maxPeak = Math.max(...p.scores, 0);
    const longevityScore = p.matches;

    let consistencyScore = 0;
    if (p.scores.length > 2) {
      const mean = p.scores.reduce((a, b) => a + b) / p.scores.length;
      const variance =
        p.scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        p.scores.length;
      const stdDev = Math.sqrt(variance);
      consistencyScore = Math.max(0, 100 - stdDev * 2);
    }

    const playoffComponent = Math.round(maxPeak * 0.1);

    p.peakComponent = Math.round(maxPeak * 2);
    p.longevityComponent = Math.round(longevityScore * 1.5);
    p.consistencyComponent = Math.round(consistencyScore);
    p.playoffComponent = playoffComponent;

    p.rawScore = Math.round(
      p.peakComponent +
        p.longevityComponent +
        p.consistencyComponent +
        p.runs / 50 +
        p.wkts / 2.5 +
        p.playoffComponent,
    );
  });

  const hofSorted = [...playersArr].sort((a, b) => b.rawScore - a.rawScore);
  const hofRank = hofSorted.findIndex((p) => p.id === playerId) + 1;
  const hofPercentile =
    totalPlayers > 0 ? ((totalPlayers - hofRank) / totalPlayers) * 100 : 0;

  const targetScores = hofSorted.find((p) => p.id === playerId);
  const targetRawScore = targetScores?.rawScore || 0;

  let totalBallsFaced = 0;
  let totalInnings = 0;
  let totalHundreds = 0;
  let totalFifties = 0;

  const targetSeasons = allSeasons.filter((s) => s.playerId === playerId);
  targetSeasons.forEach((s) => {
    totalInnings += s.innings;

    if (s.strikeRate > 0) {
      totalBallsFaced += Math.round((s.totalRuns / s.strikeRate) * 100);
    }
    totalHundreds += s.hundreds;
    totalFifties += s.fifties;
  });

  const careerAverage =
    totalInnings > 0 ? (targetAgg.runs / totalInnings).toFixed(1) : 0;
  const careerStrikeRate =
    totalBallsFaced > 0
      ? ((targetAgg.runs / totalBallsFaced) * 100).toFixed(1)
      : 0;

  const peerSeasons = allSeasons.filter(
    (s) => s.player?.role === targetPlayer.role,
  );
  const peerMap = {};
  peerSeasons.forEach((s) => {
    if (!peerMap[s.playerId])
      {peerMap[s.playerId] = {
        runs: 0,
        inns: 0,
        balls: 0,
        hundreds: 0,
        fifties: 0,
        matches: 0,
      };}
    peerMap[s.playerId].runs += s.totalRuns;
    peerMap[s.playerId].inns += s.innings;
    peerMap[s.playerId].matches += s.matches;
    if (s.strikeRate > 0)
      {peerMap[s.playerId].balls += Math.round(
        (s.totalRuns / s.strikeRate) * 100,
      );}
    peerMap[s.playerId].hundreds += s.hundreds;
    peerMap[s.playerId].fifties += s.fifties;
  });

  const validPeers = Object.values(peerMap).filter((p) => p.matches > 15);
  const srPeers = [...validPeers].sort(
    (a, b) =>
      (b.balls > 0 ? b.runs / b.balls : 0) -
      (a.balls > 0 ? a.runs / a.balls : 0),
  );
  const avgPeers = [...validPeers].sort(
    (a, b) =>
      (b.inns > 0 ? b.runs / b.inns : 0) - (a.inns > 0 ? a.runs / a.inns : 0),
  );
  const hunPeers = [...validPeers].sort((a, b) => b.hundreds - a.hundreds);
  const fifPeers = [...validPeers].sort((a, b) => b.fifties - a.fifties);

  const mySr = totalBallsFaced > 0 ? targetAgg.runs / totalBallsFaced : 0;
  const myAvg = totalInnings > 0 ? targetAgg.runs / totalInnings : 0;

  const srRank =
    srPeers.findIndex((p) => (p.balls > 0 ? p.runs / p.balls : 0) <= mySr) +
      1 || 1;
  const srPercentile =
    validPeers.length > 0
      ? ((validPeers.length - srRank) / validPeers.length) * 100
      : 0;

  const avgRank =
    avgPeers.findIndex((p) => (p.inns > 0 ? p.runs / p.inns : 0) <= myAvg) +
      1 || 1;
  const avgPercentile =
    validPeers.length > 0
      ? ((validPeers.length - avgRank) / validPeers.length) * 100
      : 0;

  const hunRank =
    hunPeers.findIndex((p) => p.hundreds <= totalHundreds) + 1 || 1;
  const fifRank = fifPeers.findIndex((p) => p.fifties <= totalFifties) + 1 || 1;

  return {
    allTimeRunRank: runRank,
    allTimeWktRank: wktRank,
    allTimeRunPercentile: runPercentile.toFixed(1),
    rolePercentile: rolePercentile.toFixed(1),
    contextRankings: {
      centuriesRank: hunRank,
      fiftiesRank: fifRank,
      strikeRatePercentile: srPercentile.toFixed(1),
      averagePercentile: avgPercentile.toFixed(1),
      careerAverage,
      careerStrikeRate,
    },
    hallOfFame: {
      rawScore: targetRawScore,
      percentile: parseFloat(hofPercentile.toFixed(1)),
      rank: hofRank,
      peakComponent: targetScores?.peakComponent || 0,
      longevityComponent: targetScores?.longevityComponent || 0,
      consistencyComponent: targetScores?.consistencyComponent || 0,
      playoffComponent: targetScores?.playoffComponent || 0,
    },
  };
};

export const getCareerRecordsBook = async (playerId) => {
  const matchStats = await prisma.playerMatchStats.findMany({
    where: { playerId },
    include: { match: true },
  });

  if (!matchStats || matchStats.length === 0) return null;

  const targetPlayer = await prisma.player.findUnique({
    where: { id: playerId },
  });
  const isBowler = targetPlayer?.role?.toLowerCase().includes("bowl");

  const highestScoreKnock = matchStats.reduce(
    (prev, current) => (prev.runsScored > current.runsScored ? prev : current),
    matchStats[0],
  );

  const fifties = matchStats.filter(
    (m) => m.runsScored >= 50 && m.runsScored < 100,
  );
  const fastestFifty =
    fifties.length > 0
      ? fifties.reduce((prev, current) =>
          prev.ballsFaced < current.ballsFaced ? prev : current,
        )
      : null;

  const hundreds = matchStats.filter((m) => m.runsScored >= 100);
  const fastestHundred =
    hundreds.length > 0
      ? hundreds.reduce((prev, current) =>
          prev.ballsFaced < current.ballsFaced ? prev : current,
        )
      : null;

  const mostSixes = matchStats.reduce(
    (prev, current) => (prev.sixes > current.sixes ? prev : current),
    matchStats[0],
  );
  const mostFours = matchStats.reduce(
    (prev, current) => (prev.fours > current.fours ? prev : current),
    matchStats[0],
  );

  const chaseKnocks = matchStats.filter((stat) => {
    if (!stat.match || stat.match.winner !== stat.team) return false;
    let teamBattedFirst = stat.match.team1;
    if (stat.match.tossWinner && stat.match.tossDecision) {
      if (stat.match.tossDecision === "bat")
        {teamBattedFirst = stat.match.tossWinner;}
      else
        {teamBattedFirst =
          stat.match.tossWinner === stat.match.team1
            ? stat.match.team2
            : stat.match.team1;}
    }
    return stat.team !== teamBattedFirst;
  });
  const bestChaseKnock =
    chaseKnocks.length > 0
      ? chaseKnocks.reduce((prev, current) =>
          prev.runsScored > current.runsScored ? prev : current,
        )
      : null;

  const bestBowlingSpell = matchStats.reduce((prev, current) => {
    if (current.wickets > prev.wickets) return current;
    if (
      current.wickets === prev.wickets &&
      current.runsConceded < prev.runsConceded
    )
      {return current;}
    return prev;
  }, matchStats[0]);

  const fourOvers = matchStats.filter((m) => m.oversBowled >= 4);
  const bestEconomySpell =
    fourOvers.length > 0
      ? fourOvers.reduce((prev, current) =>
          current.runsConceded < prev.runsConceded ? current : prev,
        )
      : null;

  const mostDotBalls = matchStats.reduce(
    (prev, current) => (prev.dotBalls > current.dotBalls ? prev : current),
    matchStats[0],
  );

  const playoffSpells = matchStats.filter(
    (m) => m.match && m.match.matchNumber === null,
  );
  const bestPlayoffSpell =
    playoffSpells.length > 0
      ? playoffSpells.reduce((prev, current) => {
          if (current.wickets > prev.wickets) return current;
          if (
            current.wickets === prev.wickets &&
            current.runsConceded < prev.runsConceded
          )
            {return current;}
          return prev;
        })
      : null;

  return {
    batterRecords: {
      highestScore: highestScoreKnock
        ? `${highestScoreKnock.runsScored}${highestScoreKnock.isOut ? "" : "*"}`
        : "-",
      fastestFifty: fastestFifty ? `${fastestFifty.ballsFaced} balls` : "-",
      fastestHundred: fastestHundred
        ? `${fastestHundred.ballsFaced} balls`
        : "-",
      mostSixesInInnings: mostSixes ? mostSixes.sixes : 0,
      mostFoursInInnings: mostFours ? mostFours.fours : 0,
      bestChaseKnock: bestChaseKnock
        ? `${bestChaseKnock.runsScored}${bestChaseKnock.isOut ? "" : "*"}`
        : "-",
    },
    bowlerRecords: {
      bestBowling: bestBowlingSpell
        ? `${bestBowlingSpell.wickets}/${bestBowlingSpell.runsConceded}`
        : "-",
      bestEconomy: bestEconomySpell
        ? `${(bestEconomySpell.runsConceded / 4).toFixed(1)} Econ`
        : "-",
      mostDotBalls: mostDotBalls ? mostDotBalls.dotBalls : 0,
      bestPlayoffSpell: bestPlayoffSpell
        ? `${bestPlayoffSpell.wickets}/${bestPlayoffSpell.runsConceded}`
        : "-",
    },
  };
};

export const getCareerMilestones = async (playerId) => {
  const matchStats = await prisma.playerMatchStats.findMany({
    where: { playerId },
    include: { match: true },
    orderBy: [{ season: "asc" }, { matchId: "asc" }],
  });

  if (!matchStats || matchStats.length === 0) return [];

  const milestones = [];
  let runningRuns = 0;
  let runningWickets = 0;
  let runningMatches = 0;

  const runThresholds = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
  let nextRunThresholdIdx = 0;

  const wktThresholds = [50, 100, 150, 200, 250];
  let nextWktThresholdIdx = 0;

  const matchThresholds = [50, 100, 150, 200, 250];
  let nextMatchThresholdIdx = 0;

  matchStats.forEach((stat, index) => {
    runningMatches++;
    runningRuns += stat.runsScored;
    runningWickets += stat.wickets;

    if (index === 0) {
      milestones.push({
        season: stat.season,
        title: "IPL Debut",
        description: `Played first match for ${stat.team}`,
      });
    }

    if (
      stat.runsScored >= 100 &&
      !milestones.some((m) => m.title === "First Century")
    ) {
      milestones.push({
        season: stat.season,
        title: "First Century",
        description: `Scored ${stat.runsScored} runs in a match`,
      });
    }

    if (
      nextRunThresholdIdx < runThresholds.length &&
      runningRuns >= runThresholds[nextRunThresholdIdx]
    ) {
      milestones.push({
        season: stat.season,
        title: `${runThresholds[nextRunThresholdIdx]} Runs`,
        description: `Reached milestone in ${runningMatches} innings`,
      });
      nextRunThresholdIdx++;
    }

    if (
      nextWktThresholdIdx < wktThresholds.length &&
      runningWickets >= wktThresholds[nextWktThresholdIdx]
    ) {
      milestones.push({
        season: stat.season,
        title: `${wktThresholds[nextWktThresholdIdx]} Wickets`,
        description: `Reached milestone in ${runningMatches} matches`,
      });
      nextWktThresholdIdx++;
    }

    if (
      nextMatchThresholdIdx < matchThresholds.length &&
      runningMatches === matchThresholds[nextMatchThresholdIdx]
    ) {
      milestones.push({
        season: stat.season,
        title: `${matchThresholds[nextMatchThresholdIdx]} Matches`,
        description: `Played milestone match for ${stat.team}`,
      });
      nextMatchThresholdIdx++;
    }
  });

  return milestones;
};

export const getLegacyScore = async (playerId) => {
  const seasons = await prisma.playerSeasonStats.findMany({
    where: { playerId },
  });
  if (!seasons || seasons.length === 0) return 0;

  let totalPoM = 0;
  let matches = 0;
  let maxPeak = 0;

  seasons.forEach((s) => {
    totalPoM += s.playerOfMatch;
    matches += s.matches;
    if (s.performanceScore > maxPeak) maxPeak = s.performanceScore;
  });

  const clutchStats = await getClutchAnalytics(playerId);

  const legacyPoints =
    totalPoM * 3 +
    clutchStats.playoffs.matches * 2 +
    matches / 10 +
    maxPeak / 10;

  return Math.round(legacyPoints);
};

export const getImpactDifferential = async (playerId) => {
  const playerMatches = await prisma.playerMatchStats.findMany({
    where: { playerId },
    include: { match: true },
  });

  if (!playerMatches || playerMatches.length === 0) return null;

  const activeFranchisesBySeason = {};
  let totalWith = 0;
  let winsWith = 0;

  playerMatches.forEach((stat) => {
    if (!stat.match) return;
    if (!activeFranchisesBySeason[stat.season])
      {activeFranchisesBySeason[stat.season] = new Set();}
    activeFranchisesBySeason[stat.season].add(stat.team);

    if (stat.match.winner) {
      totalWith++;
      if (stat.match.winner === stat.team) winsWith++;
    }
  });

  let totalWithout = 0;
  let winsWithout = 0;

  for (const seasonStr of Object.keys(activeFranchisesBySeason)) {
    const season = parseInt(seasonStr);
    const teams = Array.from(activeFranchisesBySeason[seasonStr]);

    for (const team of teams) {
      const teamMatches = await prisma.match.findMany({
        where: {
          season,
          OR: [{ team1: team }, { team2: team }],
          winner: { not: null },
        },
      });

      const playedMatchIds = new Set(playerMatches.map((m) => m.matchId));
      const matchesWithout = teamMatches.filter(
        (m) => !playedMatchIds.has(m.id),
      );

      matchesWithout.forEach((m) => {
        totalWithout++;
        if (m.winner === team) winsWithout++;
      });
    }
  }

  const winPctWith = totalWith > 0 ? (winsWith / totalWith) * 100 : 0;
  const winPctWithout =
    totalWithout > 0 ? (winsWithout / totalWithout) * 100 : 0;

  let confidence = "LOW";
  if (totalWith >= 30 && totalWithout >= 30) confidence = "HIGH";
  else if (totalWith >= 15 && totalWithout >= 15) confidence = "MEDIUM";

  const isInsufficient = totalWith < 15 || totalWithout < 15;
  if (isInsufficient) {
    return {
      status: "INSUFFICIENT_SAMPLE",
      metadata: {
        label: "Team Dependency Index",
        warning: "Correlation Metric. Not Causal.",
      },
    };
  }

  return {
    winPctWith: parseFloat(winPctWith.toFixed(1)),
    winPctWithout: parseFloat(winPctWithout.toFixed(1)),
    differential: parseFloat((winPctWith - winPctWithout).toFixed(1)),
    matchesWith: totalWith,
    matchesWithout: totalWithout,
    confidence,
    status: "OK",
    metadata: {
      label: "Team Dependency Index",
      warning: "Correlation Metric. Not Causal.",
    },
  };
};
