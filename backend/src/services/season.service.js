import NodeCache from "node-cache";
import { getPrisma } from "../config/index.js";
import { computeEliteFeatures } from "./seasonAdvanced.service.js";

const seasonCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });
const intelligenceCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

export async function getSeasons() {
  if (seasonCache.has("all")) return seasonCache.get("all");
  const prisma = await getPrisma();
  const seasons = await prisma.match.findMany({
    select: { season: true },
    distinct: ["season"],
    orderBy: { season: "desc" },
  });
  const res = seasons.map((s) => s.season);
  seasonCache.set("all", res);
  return res;
}

export async function getSeasonIntelligence(year) {
  if (intelligenceCache.has(year)) return intelligenceCache.get(year);
  const prisma = await getPrisma();

  const [
    playerSeasonStats,
    franchiseSeasonStats,
    matches,
    topInnings,
    auctionEntries,
    auctionCount,
    allPlayerMatchStats,
  ] = await Promise.all([
    prisma.playerSeasonStats.findMany({
      where: { season: year },
      include: {
        player: {
          select: { id: true, name: true, role: true, nationality: true },
        },
      },
      orderBy: { totalRuns: "desc" },
    }),

    prisma.franchiseSeasonStats.findMany({
      where: { season: year },
      include: {
        franchise: {
          select: {
            id: true,
            name: true,
            shortName: true,
            color: true,
            logoUrl: true,
            titleYears: true,
          },
        },
      },
      orderBy: { finalPosition: "asc" },
    }),

    prisma.match.findMany({
      where: { season: year },
      select: {
        id: true,
        date: true,
        matchNumber: true,
        team1: true,
        team2: true,
        winner: true,
        winMargin: true,
        winType: true,
        venue: true,
        city: true,
        tossWinner: true,
        tossDecision: true,
        playerOfMatch: true,
      },
      orderBy: { date: "asc" },
    }),

    prisma.playerMatchStats.findMany({
      where: { season: year, ballsFaced: { gt: 0 } },
      select: {
        playerId: true,
        runsScored: true,
        ballsFaced: true,
        fours: true,
        sixes: true,
        isOut: true,
        team: true,
        player: { select: { id: true, name: true, role: true } },
        match: {
          select: { date: true, venue: true, team1: true, team2: true },
        },
      },
      orderBy: { runsScored: "desc" },
      take: 10,
    }),

    prisma.auctionEntry.findMany({
      where: { season: year },
      include: {
        player: {
          select: { id: true, name: true, role: true, nationality: true },
        },
        franchise: {
          select: { id: true, name: true, shortName: true, color: true },
        },
      },
      orderBy: { soldPrice: "desc" },
    }),

    prisma.auctionEntry.count({ where: { season: year } }),

    prisma.playerMatchStats.findMany({
      where: { season: year },
      select: {
        matchId: true,
        playerId: true,
        team: true,
        runsScored: true,
        wickets: true,
        runsConceded: true,
        ballsFaced: true,
        sixes: true,
        oversBowled: true,
        dotBalls: true,
        player: { select: { id: true, name: true, role: true } },
      },
    }),
  ]);

  const totalMatches = matches.length;
  const totalRuns = playerSeasonStats.reduce((sum, s) => sum + s.totalRuns, 0);
  const totalWickets = playerSeasonStats.reduce(
    (sum, s) => sum + s.totalWickets,
    0,
  );
  const totalSixes = playerSeasonStats.reduce((sum, s) => sum + s.sixes, 0);
  const totalFours = playerSeasonStats.reduce((sum, s) => sum + s.fours, 0);
  const totalFifties = playerSeasonStats.reduce((sum, s) => sum + s.fifties, 0);
  const totalHundreds = playerSeasonStats.reduce(
    (sum, s) => sum + s.hundreds,
    0,
  );
  const totalPOM = playerSeasonStats.reduce(
    (sum, s) => sum + s.playerOfMatch,
    0,
  );
  const avgScorePerMatch =
    totalMatches > 0 ? Math.round(totalRuns / (totalMatches * 2)) : 0;

  const champion = franchiseSeasonStats.find((f) => f.isChampion);
  const runnerUp = franchiseSeasonStats.find((f) => f.finalPosition === 2);

  const orangeCapStat =
    playerSeasonStats.length > 0 ? playerSeasonStats[0] : null;

  const purpleCapList = [...playerSeasonStats].sort(
    (a, b) => b.totalWickets - a.totalWickets,
  );
  const purpleCapStat = purpleCapList.length > 0 ? purpleCapList[0] : null;

  const topBatters = playerSeasonStats
    .filter((s) => s.totalRuns > 0)
    .slice(0, 10)
    .map((s, i) => ({
      rank: i + 1,
      player: s.player,
      team: s.team,
      matches: s.matches,
      innings: s.innings,
      runs: s.totalRuns,
      highestScore: s.highestScore,
      average: s.average,
      strikeRate: s.strikeRate,
      fifties: s.fifties,
      hundreds: s.hundreds,
      fours: s.fours,
      sixes: s.sixes,
    }));

  const topBowlers = [...playerSeasonStats]
    .sort((a, b) => b.totalWickets - a.totalWickets)
    .filter((s) => s.totalWickets > 0)
    .slice(0, 10)
    .map((s, i) => ({
      rank: i + 1,
      player: s.player,
      team: s.team,
      matches: s.matches,
      wickets: s.totalWickets,
      bestBowling: s.bestBowling,
      bowlingAvg: s.bowlingAvg,
      economyRate: s.economyRate,
      dotBallPct: s.dotBallPct,
    }));

  const franchiseStandings = franchiseSeasonStats.map((f) => ({
    franchise: f.franchise,
    finalPosition: f.finalPosition,
    isChampion: f.isChampion,
    matchesPlayed: f.matchesPlayed,
    matchesWon: f.matchesWon,
    matchesLost: f.matchesLost,
    winPercentage:
      f.matchesPlayed > 0
        ? Math.round((f.matchesWon / f.matchesPlayed) * 100)
        : 0,
    totalSpent: f.totalSpent,
    playersBought: f.playersBought,
    playersRetained: f.playersRetained,
    roiScore: f.roiScore,
    spendEfficiency: f.spendEfficiency,
  }));

  const topInningsList = topInnings.map((t, i) => ({
    rank: i + 1,
    player: t.player,
    team: t.team,
    runsScored: t.runsScored,
    ballsFaced: t.ballsFaced,
    fours: t.fours,
    sixes: t.sixes,
    strikeRate:
      t.ballsFaced > 0
        ? Math.round((t.runsScored / t.ballsFaced) * 100 * 100) / 100
        : 0,
    isNotOut: !t.isOut,
    opponent: t.match.team1 === t.team ? t.match.team2 : t.match.team1,
    venue: t.match.venue,
    date: t.match.date,
  }));

  const matchTeamTotals = {};
  allPlayerMatchStats.forEach((s) => {
    if (!matchTeamTotals[s.matchId]) matchTeamTotals[s.matchId] = {};
    if (!matchTeamTotals[s.matchId][s.team]) {
      matchTeamTotals[s.matchId][s.team] = 0;
    }
    matchTeamTotals[s.matchId][s.team] += s.runsScored;
  });

  let sumFirstInnings = 0;
  let firstInningsCount = 0;
  let sumWinningScore = 0;
  let winningScoreCount = 0;

  let batFirstWins = 0;
  let chaseWins = 0;
  let matchesWithResult = 0;

  const venueStats = {};

  let highestTeamTotal = null;
  let lowestTeamTotalBatFirst = null;
  let biggestChase = null;
  let closestMatch = null;

  matches.forEach((m) => {
    if (m.winType === "runs") {
      batFirstWins++;
      matchesWithResult++;
    }
    if (m.winType === "wickets") {
      chaseWins++;
      matchesWithResult++;
    }

    if (m.winner === null && m.playerOfMatch !== null) {
      closestMatch = {
        match: m,
        margin: 0,
        winner: "Tie (Super Over)",
        isSuperOver: true,
      };
    } else if (
      m.winType === "runs" &&
      (!closestMatch ||
        (!closestMatch.isSuperOver && m.winMargin < closestMatch.margin))
    ) {
      closestMatch = {
        match: m,
        margin: m.winMargin,
        winner: m.winner,
        isSuperOver: false,
      };
    }

    const totals = matchTeamTotals[m.id];
    if (!totals) return;

    let batFirstTeam = null;
    let batSecondTeam = null;
    if (m.tossWinner && m.tossDecision) {
      if (m.tossDecision === "bat") {
        batFirstTeam = m.tossWinner;
        batSecondTeam = m.team1 === m.tossWinner ? m.team2 : m.team1;
      } else {
        batSecondTeam = m.tossWinner;
        batFirstTeam = m.team1 === m.tossWinner ? m.team2 : m.team1;
      }
    }

    const batFirstScore = batFirstTeam ? totals[batFirstTeam] || 0 : 0;
    const batSecondScore = batSecondTeam ? totals[batSecondTeam] || 0 : 0;
    const matchAggregate = batFirstScore + batSecondScore;

    const isValidMatch = m.winner !== null || m.playerOfMatch !== null;
    if (batFirstScore > 0 && isValidMatch) {
      sumFirstInnings += batFirstScore;
      firstInningsCount++;
      if (
        !lowestTeamTotalBatFirst ||
        batFirstScore < lowestTeamTotalBatFirst.score
      ) {
        lowestTeamTotalBatFirst = {
          team: batFirstTeam,
          score: batFirstScore,
          opponent: batSecondTeam,
          match: m,
        };
      }
    }

    if (m.winner && totals[m.winner]) {
      sumWinningScore += totals[m.winner];
      winningScoreCount++;

      if (
        m.winType === "wickets" &&
        (!biggestChase || totals[m.winner] > biggestChase.score)
      ) {
        biggestChase = {
          team: m.winner,
          score: totals[m.winner],
          target: batFirstScore + 1,
          opponent: batFirstTeam,
          match: m,
        };
      }
    }

    Object.entries(totals).forEach(([team, score]) => {
      if (!highestTeamTotal || score > highestTeamTotal.score) {
        highestTeamTotal = {
          team,
          score,
          opponent: team === m.team1 ? m.team2 : m.team1,
          match: m,
        };
      }
    });

    if (m.venue) {
      if (!venueStats[m.venue]) {
        venueStats[m.venue] = { totalRuns: 0, matches: 0 };
      }
      venueStats[m.venue].totalRuns += matchAggregate;
      venueStats[m.venue].matches += 1;
    }
  });

  const avgFirstInningsScore =
    firstInningsCount > 0 ? Math.round(sumFirstInnings / firstInningsCount) : 0;
  const avgWinningScore =
    winningScoreCount > 0 ? Math.round(sumWinningScore / winningScoreCount) : 0;
  const batFirstWinPct =
    matchesWithResult > 0
      ? Math.round((batFirstWins / matchesWithResult) * 100)
      : 0;
  const chaseWinPct =
    matchesWithResult > 0
      ? Math.round((chaseWins / matchesWithResult) * 100)
      : 0;

  let highestScoringVenue = null;
  let lowestScoringVenue = null;
  Object.entries(venueStats).forEach(([venue, stats]) => {
    if (stats.matches >= 3) {
      const avg = stats.totalRuns / stats.matches;
      if (!highestScoringVenue || avg > highestScoringVenue.avg) {
        highestScoringVenue = { venue, avg: Math.round(avg) };
      }
      if (!lowestScoringVenue || avg < lowestScoringVenue.avg) {
        lowestScoringVenue = { venue, avg: Math.round(avg) };
      }
    }
  });

  let topSpell = null;
  allPlayerMatchStats.forEach((stat) => {
    if (stat.wickets >= 3) {
      if (
        !topSpell ||
        stat.wickets > topSpell.wickets ||
        (stat.wickets === topSpell.wickets &&
          stat.runsConceded < topSpell.runsConceded)
      ) {
        topSpell = stat;
      }
    }
  });

  let bestBowlingSpell = null;
  if (topSpell) {
    bestBowlingSpell = {
      player: topSpell.player,
      bestBowling: `${topSpell.wickets}/${topSpell.runsConceded}`,
    };
  }

  const storyline = {
    highestTeamTotal,
    lowestTeamTotalBatFirst,
    biggestChase,
    closestMatch,
    bestBowlingSpell,
    highestIndividualScore:
      topBatters.length > 0
        ? { player: topBatters[0].player, score: topBatters[0].highestScore }
        : null,
  };

  const trends = {
    batFirstWinPct,
    chaseWinPct,
    batFirstWins,
    chaseWins,
    matchesWithResult,
    avgFirstInningsScore,
    avgWinningScore,
    highestScoringVenue,
    lowestScoringVenue,
  };

  let eligibleWKs = playerSeasonStats
    .filter((s) => s.player.role === "Wicket-Keeper" && s.totalRuns >= 100)
    .sort(
      (a, b) =>
        b.totalRuns - a.totalRuns || b.performanceScore - a.performanceScore,
    );
  if (eligibleWKs.length === 0) {
    eligibleWKs = playerSeasonStats
      .filter((s) => s.player.role === "Wicket-Keeper")
      .sort((a, b) => b.totalRuns - a.totalRuns);
  }

  const selectedWK = eligibleWKs[0];
  const wkId = selectedWK ? selectedWK.playerId : null;

  const eligibleBatters = playerSeasonStats
    .filter(
      (s) =>
        s.player.role !== "Wicket-Keeper" &&
        s.playerId !== wkId &&
        s.totalRuns >= 150,
    )
    .sort(
      (a, b) =>
        b.totalRuns - a.totalRuns || b.performanceScore - a.performanceScore,
    );
  const top4Batters = eligibleBatters.slice(0, 4);
  const batterIds = new Set(top4Batters.map((b) => b.playerId));

  const eligibleBowlers = playerSeasonStats
    .filter(
      (s) =>
        s.player.role !== "Wicket-Keeper" &&
        s.playerId !== wkId &&
        !batterIds.has(s.playerId) &&
        s.totalWickets >= 8,
    )
    .sort(
      (a, b) =>
        b.totalWickets - a.totalWickets ||
        b.performanceScore - a.performanceScore,
    );
  const top4Bowlers = eligibleBowlers.slice(0, 4);
  const bowlerIds = new Set(top4Bowlers.map((b) => b.playerId));

  const eligibleARs = playerSeasonStats
    .filter(
      (s) =>
        s.playerId !== wkId &&
        !batterIds.has(s.playerId) &&
        !bowlerIds.has(s.playerId) &&
        (s.player.role === "All-Rounder" ||
          (s.totalRuns >= 100 && s.totalWickets >= 5)),
    )
    .sort((a, b) => b.performanceScore - a.performanceScore);
  const top2ARs = eligibleARs.slice(0, 2);

  const bestXIList = [
    ...top4Batters.map((s) => ({ ...s, displayRole: "Batter" })),
    ...(selectedWK ? [{ ...selectedWK, displayRole: "Wicket-Keeper" }] : []),
    ...top2ARs.map((s) => ({ ...s, displayRole: "All-Rounder" })),
    ...top4Bowlers.map((s) => ({ ...s, displayRole: "Bowler" })),
  ];

  let bestXICaptain = null;
  let bestXIViceCaptain = null;
  if (bestXIList.length > 0) {
    const sortedForLeadership = [...bestXIList].sort(
      (a, b) => b.performanceScore - a.performanceScore,
    );
    bestXICaptain = sortedForLeadership[0].playerId;
    if (sortedForLeadership.length > 1) {
      bestXIViceCaptain = sortedForLeadership[1].playerId;
    }
  }

  const bestXI = bestXIList.map((s) => ({
    player: s.player,
    team: s.team,
    role: s.displayRole,
    totalRuns: s.totalRuns,
    totalWickets: s.totalWickets,
    performanceScore: Math.round(s.performanceScore * 10) / 10,
    isCaptain: s.playerId === bestXICaptain,
    isViceCaptain: s.playerId === bestXIViceCaptain,
  }));

  const playoffMatches = matches.filter(
    (m) => m.matchNumber === null && m.winner !== null,
  );
  const playoffMatchIds = new Set(playoffMatches.map((m) => m.id));
  const playoffStats = allPlayerMatchStats.filter((s) =>
    playoffMatchIds.has(s.matchId),
  );

  const playoffPerformances = {};
  playoffStats.forEach((s) => {
    if (!playoffPerformances[s.playerId]) {
      playoffPerformances[s.playerId] = {
        player: s.player,
        team: s.team,
        runs: 0,
        wickets: 0,
      };
    }
    playoffPerformances[s.playerId].runs += s.runsScored;
    playoffPerformances[s.playerId].wickets += s.wickets;
  });

  const topPlayoffBatter =
    Object.values(playoffPerformances).sort((a, b) => b.runs - a.runs)[0] ||
    null;
  const topPlayoffBowler =
    Object.values(playoffPerformances).sort(
      (a, b) => b.wickets - a.wickets,
    )[0] || null;

  const clutchPerformers = {
    playoffBatter: topPlayoffBatter?.runs > 0 ? topPlayoffBatter : null,
    playoffBowler: topPlayoffBowler?.wickets > 0 ? topPlayoffBowler : null,
  };

  const hasAuctionData = auctionCount > 0;
  let auctionHighlights = null;

  if (hasAuctionData) {
    const soldPurchases = auctionEntries.filter(
      (e) => e.status === "Sold" && !e.isRetained && e.soldPrice > 0,
    );

    const analyzedPurchases = soldPurchases.map((p) => {
      const stat = playerSeasonStats.find((s) => s.playerId === p.playerId);
      const perf = stat ? stat.performanceScore : 0;
      const roi = p.soldPrice > 0 ? perf / p.soldPrice : 0;
      return { ...p, performanceScore: perf, roi };
    });

    const qualifiedPurchases = analyzedPurchases.filter(
      (p) => p.soldPrice >= 50,
    );
    qualifiedPurchases.sort((a, b) => b.roi - a.roi);

    const bestRoi =
      qualifiedPurchases.length > 0 ? qualifiedPurchases[0] : null;
    const worstRoi =
      qualifiedPurchases.length > 0
        ? qualifiedPurchases[qualifiedPurchases.length - 1]
        : null;
    const highestSpend = soldPurchases.length > 0 ? soldPurchases[0] : null;

    const steals = analyzedPurchases
      .filter((p) => p.performanceScore > 0 && p.soldPrice > 0)
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5)
      .map((s) => ({
        player: s.player,
        franchise: s.franchise,
        soldPrice: s.soldPrice,
        basePrice: s.basePrice,
        performanceScore: Math.round(s.performanceScore * 100) / 100,
        roi: Math.round(s.roi * 100) / 100,
      }));

    const unsoldPlayers = auctionEntries
      .filter((e) => e.status === "Unsold" && e.basePrice >= 100)
      .slice(0, 5)
      .map((u) => ({
        player: u.player,
        basePrice: u.basePrice,
      }));

    const totalAuctionSpend = franchiseSeasonStats.reduce(
      (sum, f) => sum + f.totalSpent,
      0,
    );
    const totalPlayersBought = franchiseSeasonStats.reduce(
      (sum, f) => sum + f.playersBought,
      0,
    );

    const formatEntry = (entry) => {
      if (!entry) return null;
      return {
        player: entry.player,
        franchise: entry.franchise,
        soldPrice: entry.soldPrice,
        basePrice: entry.basePrice,
        roi: Math.round(entry.roi * 100) / 100,
        performanceScore: Math.round(entry.performanceScore * 100) / 100,
      };
    };

    auctionHighlights = {
      totalSpend: totalAuctionSpend,
      playersBought: totalPlayersBought,
      bestRoiPurchase: formatEntry(bestRoi),
      worstRoiPurchase: formatEntry(worstRoi),
      highestSpendPurchase: highestSpend
        ? {
            player: highestSpend.player,
            franchise: highestSpend.franchise,
            soldPrice: highestSpend.soldPrice,
            basePrice: highestSpend.basePrice,
          }
        : null,
      topSteals: steals,
      unsoldNotables: unsoldPlayers,
    };
  }

  const mvpList = [...playerSeasonStats].sort(
    (a, b) => b.performanceScore - a.performanceScore,
  );
  const seasonMvp =
    mvpList.length > 0
      ? {
          player: mvpList[0].player,
          team: mvpList[0].team,
          performanceScore: Math.round(mvpList[0].performanceScore * 100) / 100,
          matches: mvpList[0].matches,
        }
      : null;

  const superOversList = matches
    .filter((m) => m.winner === null && m.playerOfMatch !== null)
    .map((m) => {
      let winnerTeam = "Unknown";
      if (m.playerOfMatch) {
        const pStat = playerSeasonStats.find(
          (s) => s.player.name === m.playerOfMatch,
        );
        if (pStat) winnerTeam = pStat.team;
      }
      return {
        matchInfo: `${m.team1} vs ${m.team2}`,
        winner: winnerTeam,
        pom: m.playerOfMatch,
      };
    });

  const abandonedMatches = matches.filter(
    (m) => m.winner === null && m.playerOfMatch === null,
  ).length;

  let bestSRInnings = null;
  let mostSixesInnings = null;
  let mostEconomicalSpell = null;
  let mostDotsInnings = null;

  allPlayerMatchStats.forEach((stat) => {
    if (stat.runsScored >= 50) {
      const sr =
        stat.ballsFaced > 0 ? (stat.runsScored / stat.ballsFaced) * 100 : 0;
      if (!bestSRInnings || sr > bestSRInnings.sr) {
        bestSRInnings = { ...stat, sr };
      }
    }
    if (stat.sixes > 0) {
      if (!mostSixesInnings || stat.sixes > mostSixesInnings.sixes) {
        mostSixesInnings = stat;
      }
    }
    if (stat.oversBowled >= 4) {
      const econ = stat.runsConceded / stat.oversBowled;
      if (!mostEconomicalSpell || econ < mostEconomicalSpell.econ) {
        mostEconomicalSpell = { ...stat, econ };
      }
    }
    if (stat.dotBalls > 0) {
      if (!mostDotsInnings || stat.dotBalls > mostDotsInnings.dotBalls) {
        mostDotsInnings = stat;
      }
    }
  });

  const seasonMilestones = {
    superOvers: superOversList,
    abandonedMatches,
    fastestFifty: bestSRInnings
      ? {
          player: bestSRInnings.player,
          runs: bestSRInnings.runsScored,
          balls: bestSRInnings.ballsFaced,
          sr: Math.round(bestSRInnings.sr),
        }
      : null,
    mostSixesInnings: mostSixesInnings
      ? {
          player: mostSixesInnings.player,
          sixes: mostSixesInnings.sixes,
          runs: mostSixesInnings.runsScored,
        }
      : null,
    mostEconomicalSpell: mostEconomicalSpell
      ? {
          player: mostEconomicalSpell.player,
          figures: `${mostEconomicalSpell.wickets}/${mostEconomicalSpell.runsConceded}`,
          econ: Math.round(mostEconomicalSpell.econ * 100) / 100,
        }
      : null,
    mostDotsInnings: mostDotsInnings
      ? {
          player: mostDotsInnings.player,
          dotBalls: mostDotsInnings.dotBalls,
          figures: `${mostDotsInnings.wickets}/${mostDotsInnings.runsConceded}`,
        }
      : null,
  };

  const result = {
    year,
    overview: {
      totalMatches,
      totalRuns,
      totalWickets,
      totalSixes,
      totalFours,
      totalFifties,
      totalHundreds,
      totalPOM,
      avgScorePerMatch,
    },
    champion: champion
      ? {
          franchise: champion.franchise,
          matchesWon: champion.matchesWon,
          matchesPlayed: champion.matchesPlayed,
        }
      : null,
    runnerUp: runnerUp
      ? {
          franchise: runnerUp.franchise,
          matchesWon: runnerUp.matchesWon,
          matchesPlayed: runnerUp.matchesPlayed,
        }
      : null,
    orangeCap: orangeCapStat
      ? {
          player: orangeCapStat.player,
          team: orangeCapStat.team,
          runs: orangeCapStat.totalRuns,
          innings: orangeCapStat.innings,
          average: orangeCapStat.average,
          strikeRate: orangeCapStat.strikeRate,
          fifties: orangeCapStat.fifties,
          hundreds: orangeCapStat.hundreds,
          highestScore: orangeCapStat.highestScore,
          sixes: orangeCapStat.sixes,
          fours: orangeCapStat.fours,
        }
      : null,
    purpleCap: purpleCapStat
      ? {
          player: purpleCapStat.player,
          team: purpleCapStat.team,
          wickets: purpleCapStat.totalWickets,
          bestBowling: purpleCapStat.bestBowling,
          economyRate: purpleCapStat.economyRate,
          bowlingAvg: purpleCapStat.bowlingAvg,
          dotBallPct: purpleCapStat.dotBallPct,
          matches: purpleCapStat.matches,
        }
      : null,
    topBatters,
    topBowlers,
    franchiseStandings,
    topInnings: topInningsList,
    storyline,
    trends,
    seasonMilestones,
    bestXI,
    clutchPerformers,
    seasonMvp,
    hasAuctionData,
    auctionHighlights,
  };

  try {
    const eliteFeatures = await computeEliteFeatures(
      year,
      matches,
      allPlayerMatchStats,
      playerSeasonStats,
      seasonMilestones,
    );
    Object.assign(result, eliteFeatures);
  } catch (e) {
    console.error("Error computing elite features:", e);
  }

  intelligenceCache.set(year, result);
  return result;
}
