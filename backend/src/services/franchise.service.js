import { getPrisma } from "../config/index.js";

export async function getFranchises() {
  const prisma = await getPrisma();
  const franchises = await prisma.franchise.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { auctionEntries: true, seasonStats: true },
      },
    },
  });

  const statsGroup = await prisma.franchiseSeasonStats.groupBy({
    by: ["franchiseId"],
    _sum: {
      totalSpent: true,
      matchesPlayed: true,
      matchesWon: true,
    },
  });

  const statsMap = {};
  statsGroup.forEach((g) => {
    statsMap[g.franchiseId] = g._sum;
  });

  const enriched = franchises.map((f) => {
    const stats = statsMap[f.id] || {
      totalSpent: 0,
      matchesPlayed: 0,
      matchesWon: 0,
    };
    return {
      ...f,
      totalSpent: stats.totalSpent || 0,
      totalMatchesPlayed: stats.matchesPlayed || 0,
      totalMatchesWon: stats.matchesWon || 0,
      winPct: stats.matchesPlayed
        ? Math.round(((stats.matchesWon || 0) / stats.matchesPlayed) * 10000) /
          100
        : 0,
    };
  });

  return enriched;
}

export async function getFranchiseById(id) {
  const prisma = await getPrisma();

  const franchise = await prisma.franchise.findFirst({
    where: {
      OR: [
        { id: id.length === 36 ? id : undefined },
        { shortName: { equals: id, mode: "insensitive" } },
      ].filter(Boolean),
    },
  });

  if (!franchise) return null;

  const aggStats = await prisma.franchiseSeasonStats.aggregate({
    where: { franchiseId: franchise.id },
    _sum: {
      totalSpent: true,
      playersBought: true,
      playersRetained: true,
      matchesPlayed: true,
      matchesWon: true,
      matchesLost: true,
    },
    _avg: {
      roiScore: true,
      spendEfficiency: true,
    },
    _count: true,
  });

  return {
    ...franchise,
    lifetimeStats: {
      totalSpent: aggStats._sum.totalSpent || 0,
      totalPlayersBought: aggStats._sum.playersBought || 0,
      totalPlayersRetained: aggStats._sum.playersRetained || 0,
      totalMatches: aggStats._sum.matchesPlayed || 0,
      totalWins: aggStats._sum.matchesWon || 0,
      totalLosses: aggStats._sum.matchesLost || 0,
      avgRoiScore: Math.round((aggStats._avg.roiScore || 0) * 100) / 100,
      avgSpendEfficiency:
        Math.round((aggStats._avg.spendEfficiency || 0) * 100) / 100,
      seasonsPlayed: aggStats._count,
      winPct: aggStats._sum.matchesPlayed
        ? Math.round(
            ((aggStats._sum.matchesWon || 0) / aggStats._sum.matchesPlayed) *
              10000,
          ) / 100
        : 0,
    },
  };
}

export async function getFranchiseSeasons(id) {
  const prisma = await getPrisma();
  const franchise = await prisma.franchise.findFirst({
    where: {
      OR: [
        { id: id.length === 36 ? id : undefined },
        { shortName: { equals: id, mode: "insensitive" } },
      ].filter(Boolean),
    },
  });

  if (!franchise) return [];

  return prisma.franchiseSeasonStats.findMany({
    where: { franchiseId: franchise.id },
    orderBy: { season: "desc" },
  });
}

export async function getFranchiseSquad(id, season) {
  const prisma = await getPrisma();
  const franchise = await prisma.franchise.findFirst({
    where: {
      OR: [
        { id: id.length === 36 ? id : undefined },
        { shortName: { equals: id, mode: "insensitive" } },
      ].filter(Boolean),
    },
  });

  if (!franchise) return [];

  const parsedSeason = parseInt(season);

  const stats = await prisma.playerSeasonStats.findMany({
    where: {
      team: franchise.shortName,
      season: parsedSeason,
    },
    include: {
      player: {
        select: { id: true, name: true, role: true, nationality: true },
      },
    },
  });

  const auctionEntries = await prisma.auctionEntry.findMany({
    where: {
      franchiseId: franchise.id,
      season: parsedSeason,
      status: { in: ["Sold", "Retained", "RTM"] },
    },
  });

  const auctionMap = new Map(
    auctionEntries.map((e) => [e.playerId, e.soldPrice]),
  );

  const squad = stats.map((s) => ({
    id: s.id,
    playerId: s.playerId,
    player: s.player,
    soldPrice: auctionMap.get(s.playerId) || 0,
  }));

  squad.sort((a, b) => {
    if (b.soldPrice !== a.soldPrice) {
      return b.soldPrice - a.soldPrice;
    }
    return a.player.name.localeCompare(b.player.name);
  });

  return squad;
}

export async function compareFranchises(ids) {
  const prisma = await getPrisma();
  let franchises = await Promise.all(ids.map((id) => getFranchiseById(id)));
  franchises = franchises.filter(Boolean);

  franchises.forEach((f) => {
    if (f.lifetimeStats) {
      delete f.lifetimeStats.totalSpent;
      delete f.lifetimeStats.totalPlayersBought;
      delete f.lifetimeStats.totalPlayersRetained;
      delete f.lifetimeStats.avgRoiScore;
      delete f.lifetimeStats.avgSpendEfficiency;
    }
  });

  if (franchises.length === 2) {
    const f1 = franchises[0];
    const f2 = franchises[1];

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { team1: f1.shortName, team2: f2.shortName },
          { team1: f2.shortName, team2: f1.shortName },
        ],
      },
      orderBy: { date: "desc" },
    });

    const matchIds = matches.map((m) => m.id);

    let topRunScorers = [];
    let topWicketTakers = [];
    let topSixHitters = [];
    let topFourHitters = [];
    let highestScores = [];
    let bestBowling = [];
    let topPotm = [];
    let topStrikeRates = [];
    let topEconomyRates = [];
    let topFielders = [];
    let topDotBallers = [];
    let topBoundaryDep = [];
    let topBowlingSr = [];
    let topIronmen = [];

    if (matchIds.length > 0) {
      const playerStats = await prisma.playerMatchStats.findMany({
        where: { matchId: { in: matchIds } },
        select: {
          playerId: true,
          runsScored: true,
          ballsFaced: true,
          fours: true,
          sixes: true,
          wickets: true,
          oversBowled: true,
          runsConceded: true,
          dotBalls: true,
          catches: true,
          team: true,
          player: { select: { name: true } },
        },
      });

      const aggStats = {};
      const potmCounts = {};

      matches.forEach((m) => {
        if (m.playerOfMatch) {
          potmCounts[m.playerOfMatch] = (potmCounts[m.playerOfMatch] || 0) + 1;
        }
      });

      topPotm = Object.keys(potmCounts)
        .map((name) => ({
          name,
          awards: potmCounts[name],
        }))
        .sort((a, b) => b.awards - a.awards)
        .slice(0, 3);

      playerStats.forEach((stat) => {
        if (!aggStats[stat.playerId]) {
          aggStats[stat.playerId] = {
            name: stat.player.name,
            team: stat.team,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            wickets: 0,
            oversBowled: 0,
            runsConceded: 0,
            dotBalls: 0,
            catches: 0,
            matchesPlayed: 0,
          };
        }
        aggStats[stat.playerId].runs += stat.runsScored;
        aggStats[stat.playerId].ballsFaced += stat.ballsFaced;
        aggStats[stat.playerId].fours += stat.fours;
        aggStats[stat.playerId].sixes += stat.sixes;
        aggStats[stat.playerId].wickets += stat.wickets;
        const balls =
          Math.floor(stat.oversBowled) * 6 +
          Math.round((stat.oversBowled % 1) * 10);
        aggStats[stat.playerId].ballsBowled =
          (aggStats[stat.playerId].ballsBowled || 0) + balls;
        aggStats[stat.playerId].oversBowled += stat.oversBowled;

        aggStats[stat.playerId].runsConceded += stat.runsConceded;
        aggStats[stat.playerId].dotBalls += stat.dotBalls;
        aggStats[stat.playerId].catches += stat.catches;
        aggStats[stat.playerId].matchesPlayed += 1;
      });

      const playersArray = Object.values(aggStats);

      topRunScorers = [...playersArray]
        .sort((a, b) => b.runs - a.runs)
        .slice(0, 3);
      topWicketTakers = [...playersArray]
        .sort((a, b) => b.wickets - a.wickets)
        .slice(0, 3);
      topSixHitters = [...playersArray]
        .sort((a, b) => b.sixes - a.sixes)
        .slice(0, 3);
      topFourHitters = [...playersArray]
        .sort((a, b) => b.fours - a.fours)
        .slice(0, 3);
      topFielders = [...playersArray]
        .sort((a, b) => b.catches - a.catches)
        .slice(0, 3);

      topStrikeRates = [...playersArray]
        .filter((p) => p.runs >= 50 && p.ballsFaced > 0)
        .map((p) => ({ ...p, sr: (p.runs / p.ballsFaced) * 100 }))
        .sort((a, b) => b.sr - a.sr)
        .slice(0, 3);

      topEconomyRates = [...playersArray]
        .filter((p) => p.oversBowled >= 8)
        .map((p) => ({ ...p, eco: p.runsConceded / (p.ballsBowled / 6) }))
        .sort((a, b) => a.eco - b.eco)
        .slice(0, 3);

      topDotBallers = [...playersArray]
        .filter((p) => p.ballsBowled >= 60)
        .map((p) => ({ ...p, dotPct: (p.dotBalls / p.ballsBowled) * 100 }))
        .sort((a, b) => b.dotPct - a.dotPct)
        .slice(0, 3);

      topBoundaryDep = [...playersArray]
        .filter((p) => p.runs >= 100)
        .map((p) => ({
          ...p,
          boundPct: ((p.fours * 4 + p.sixes * 6) / p.runs) * 100,
        }))
        .sort((a, b) => b.boundPct - a.boundPct)
        .slice(0, 3);

      topBowlingSr = [...playersArray]
        .filter((p) => p.wickets >= 5)
        .map((p) => ({ ...p, bowlSr: p.ballsBowled / p.wickets }))
        .sort((a, b) => a.bowlSr - b.bowlSr)
        .slice(0, 3);

      topIronmen = [...playersArray]
        .sort((a, b) => b.matchesPlayed - a.matchesPlayed)
        .slice(0, 3);

      highestScores = [...playerStats]
        .sort((a, b) => b.runsScored - a.runsScored)
        .slice(0, 3)
        .map((p) => ({
          name: p.player.name,
          team: p.team,
          runs: p.runsScored,
          balls: p.ballsFaced,
        }));

      bestBowling = [...playerStats]
        .filter((p) => p.wickets > 0)
        .sort((a, b) =>
          b.wickets !== a.wickets
            ? b.wickets - a.wickets
            : a.runsConceded - b.runsConceded,
        )
        .slice(0, 3)
        .map((p) => ({
          name: p.player.name,
          team: p.team,
          wickets: p.wickets,
          runsConceded: p.runsConceded,
          overs: p.oversBowled,
        }));
    }

    const getTeamStats = (teamName) => {
      const wins = matches.filter((m) => m.winner === teamName);
      const batFirstWins = wins.filter((m) => m.winType === "runs").length;
      const batSecondWins = wins.filter((m) => m.winType === "wickets").length;
      const largestRunWin = Math.max(
        0,
        ...wins
          .filter((m) => m.winType === "runs")
          .map((m) => m.winMargin || 0),
      );
      const largestWicketWin = Math.max(
        0,
        ...wins
          .filter((m) => m.winType === "wickets")
          .map((m) => m.winMargin || 0),
      );

      return {
        wins: wins.length,
        batFirstWins,
        batSecondWins,
        largestRunWin,
        largestWicketWin,
      };
    };

    const f1Stats = getTeamStats(f1.shortName);
    const f2Stats = getTeamStats(f2.shortName);
    const ties = matches.length - f1Stats.wins - f2Stats.wins;

    const last5Matches = matches.slice(0, 5).map((m) => ({
      date: m.date,
      winner: m.winner,
      margin: `${m.winMargin} ${m.winType}`,
    }));

    const tossImpact =
      matches.length > 0
        ? Math.round(
            (matches.filter((m) => m.winner === m.tossWinner).length /
              matches.length) *
              100,
          )
        : 0;

    const f1HomeWins = matches.filter(
      (m) => m.winner === f1.shortName && m.city === f1.city,
    ).length;
    const f2HomeWins = matches.filter(
      (m) => m.winner === f2.shortName && m.city === f2.city,
    ).length;

    const getTossCausality = (teamName) => {
      const tossWins = matches.filter((m) => m.tossWinner === teamName);
      if (tossWins.length === 0) return null;

      const batDecisions = tossWins.filter((m) => m.tossDecision === "bat");
      const fieldDecisions = tossWins.filter((m) => m.tossDecision === "field");

      const batWins = batDecisions.filter((m) => m.winner === teamName).length;
      const fieldWins = fieldDecisions.filter(
        (m) => m.winner === teamName,
      ).length;

      return {
        tossWins: tossWins.length,
        chooseBatPct: Math.round((batDecisions.length / tossWins.length) * 100),
        chooseFieldPct: Math.round(
          (fieldDecisions.length / tossWins.length) * 100,
        ),
        batWinProb:
          batDecisions.length > 0
            ? Math.round((batWins / batDecisions.length) * 100)
            : 0,
        fieldWinProb:
          fieldDecisions.length > 0
            ? Math.round((fieldWins / fieldDecisions.length) * 100)
            : 0,
      };
    };

    const venueCounts = {};
    matches.forEach((m) => {
      if (m.venue) {
        venueCounts[m.venue] = (venueCounts[m.venue] || 0) + 1;
      }
    });

    let topVenue = null;
    let venueCausality = null;

    if (Object.keys(venueCounts).length > 0) {
      topVenue = Object.keys(venueCounts).reduce((a, b) =>
        venueCounts[a] > venueCounts[b] ? a : b,
      );
      const topVenueMatches = matches.filter((m) => m.venue === topVenue);
      const batFirstWins = topVenueMatches.filter(
        (m) => m.winType === "runs",
      ).length;
      const fieldFirstWins = topVenueMatches.filter(
        (m) => m.winType === "wickets",
      ).length;
      const totalVenueMatches = topVenueMatches.length;

      venueCausality = {
        name: topVenue,
        matches: totalVenueMatches,
        batFirstWinProb:
          totalVenueMatches > 0
            ? Math.round((batFirstWins / totalVenueMatches) * 100)
            : 0,
        fieldFirstWinProb:
          totalVenueMatches > 0
            ? Math.round((fieldFirstWins / totalVenueMatches) * 100)
            : 0,
      };
    }

    const getXFactorImpact = async (topPlayers, teamName) => {
      const xFactor = topPlayers.find((p) => p.team === teamName);
      if (!xFactor) return null;

      const xFactorName = xFactor.name;

      const pStats = await prisma.playerMatchStats.findMany({
        where: { matchId: { in: matchIds }, player: { name: xFactorName } },
        select: { matchId: true, runsScored: true },
      });

      const playedMatchIds = pStats.map((s) => s.matchId);
      const playedMatches = matches.filter((m) =>
        playedMatchIds.includes(m.id),
      );

      if (playedMatches.length === 0) return null;

      const scoredBigMatches = pStats
        .filter((s) => s.runsScored >= 30)
        .map((s) => s.matchId);
      const failedMatches = pStats
        .filter((s) => s.runsScored < 30)
        .map((s) => s.matchId);

      const bigMatchesObj = matches.filter((m) =>
        scoredBigMatches.includes(m.id),
      );
      const failMatchesObj = matches.filter((m) =>
        failedMatches.includes(m.id),
      );

      const bigWinProb =
        bigMatchesObj.length > 0
          ? Math.round(
              (bigMatchesObj.filter((m) => m.winner === teamName).length /
                bigMatchesObj.length) *
                100,
            )
          : 0;

      const failWinProb =
        failMatchesObj.length > 0
          ? Math.round(
              (failMatchesObj.filter((m) => m.winner === teamName).length /
                failMatchesObj.length) *
                100,
            )
          : 0;

      return {
        name: xFactorName,
        bigWinProb,
        failWinProb,
        bigMatches: bigMatchesObj.length,
        failMatches: failMatchesObj.length,
      };
    };

    const f1XFactor = await getXFactorImpact(topRunScorers, f1.shortName);
    const f2XFactor = await getXFactorImpact(topRunScorers, f2.shortName);

    return {
      franchises,
      h2h: {
        totalMatches: matches.length,
        [f1.shortName]: f1Stats,
        [f2.shortName]: f2Stats,
        ties,
        last5Matches,
        tossImpact,
        f1HomeWins,
        f2HomeWins,
        topRunScorers,
        topWicketTakers,
        topSixHitters,
        topFourHitters,
        topFielders,
        highestScores,
        bestBowling,
        topPotm,
        topStrikeRates,
        topEconomyRates,
        topDotBallers,
        topBoundaryDep,
        topBowlingSr,
        topIronmen,
        causality: {
          [f1.shortName]: {
            toss: getTossCausality(f1.shortName),
            xFactor: f1XFactor,
          },
          [f2.shortName]: {
            toss: getTossCausality(f2.shortName),
            xFactor: f2XFactor,
          },
          venue: venueCausality,
        },
      },
    };
  }

  return { franchises };
}

export * from "./franchiseIntelligence.service.js";
