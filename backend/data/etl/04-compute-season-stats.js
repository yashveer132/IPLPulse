import { PrismaClient } from "@prisma/client";
import Logger from "./utils/logger.js";

const prisma = new PrismaClient();
const log = new Logger("04-player-stats");

async function main() {
  log.info("Computing player season stats...");

  const combos = await prisma.playerMatchStats.findMany({
    select: { playerId: true, season: true, team: true },
    distinct: ["playerId", "season", "team"],
  });

  log.info(`Found ${combos.length} player-season-team combinations`);

  const matches = await prisma.match.findMany({
    where: { playerOfMatch: { not: null } },
    select: { season: true, playerOfMatch: true },
  });

  const pomLookup = {};
  for (const m of matches) {
    const key = `${m.playerOfMatch}-${m.season}`;
    pomLookup[key] = (pomLookup[key] || 0) + 1;
  }

  const players = await prisma.player.findMany({
    select: { id: true, name: true },
  });
  const playerNameMap = {};
  for (const p of players) {
    playerNameMap[p.id] = p.name;
  }

  for (let i = 0; i < combos.length; i++) {
    const { playerId, season, team } = combos[i];

    const stats = await prisma.playerMatchStats.findMany({
      where: { playerId, season, team },
    });

    if (stats.length === 0) continue;

    const matchesCount = stats.length;
    const battingInnings = stats.filter(
      (s) => s.ballsFaced > 0 || s.runsScored > 0,
    ).length;
    const totalRuns = stats.reduce((sum, s) => sum + s.runsScored, 0);
    const totalBallsFaced = stats.reduce((sum, s) => sum + s.ballsFaced, 0);
    const totalFours = stats.reduce((sum, s) => sum + s.fours, 0);
    const totalSixes = stats.reduce((sum, s) => sum + s.sixes, 0);
    const dismissals = stats.filter((s) => s.isOut).length;
    const highestScore = Math.max(...stats.map((s) => s.runsScored), 0);
    const fifties = stats.filter(
      (s) => s.runsScored >= 50 && s.runsScored < 100,
    ).length;
    const hundreds = stats.filter((s) => s.runsScored >= 100).length;

    const battingAvg = dismissals > 0 ? totalRuns / dismissals : totalRuns;
    const strikeRate =
      totalBallsFaced > 0 ? (totalRuns / totalBallsFaced) * 100 : 0;

    const totalWickets = stats.reduce((sum, s) => sum + s.wickets, 0);
    const totalRunsConceded = stats.reduce((sum, s) => sum + s.runsConceded, 0);
    const totalOversBowled = stats.reduce((sum, s) => sum + s.oversBowled, 0);
    const totalDotBalls = stats.reduce((sum, s) => sum + s.dotBalls, 0);

    const totalBallsBowled = stats.reduce((s, st) => {
      const fullOvers = Math.floor(st.oversBowled);
      const remainingBalls = Math.round((st.oversBowled - fullOvers) * 10);
      return s + fullOvers * 6 + remainingBalls;
    }, 0);

    const bowlingAvg = totalWickets > 0 ? totalRunsConceded / totalWickets : 0;
    const economyRate =
      totalBallsBowled > 0 ? (totalRunsConceded / totalBallsBowled) * 6 : 0;
    const dotBallPct =
      totalBallsBowled > 0 ? (totalDotBalls / totalBallsBowled) * 100 : 0;

    const bowlingMatches = stats.filter((s) => s.wickets > 0);
    let bestBowling = null;
    if (bowlingMatches.length > 0) {
      const best = bowlingMatches.sort(
        (a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded,
      )[0];
      bestBowling = `${best.wickets}/${best.runsConceded}`;
    }

    const catches = stats.reduce((sum, s) => sum + s.catches, 0);
    const stumpings = stats.reduce((sum, s) => sum + s.stumpings, 0);

    const playerName = playerNameMap[playerId];
    const pomKey = `${playerName}-${season}`;
    const playerOfMatch = pomLookup[pomKey] || 0;

    await prisma.playerSeasonStats.upsert({
      where: {
        playerId_season: { playerId, season },
      },
      update: {
        team,
        matches: matchesCount,
        innings: battingInnings,
        totalRuns,
        highestScore,
        average: Math.round(battingAvg * 100) / 100,
        strikeRate: Math.round(strikeRate * 100) / 100,
        fifties,
        hundreds,
        fours: totalFours,
        sixes: totalSixes,
        totalWickets,
        bestBowling,
        bowlingAvg: Math.round(bowlingAvg * 100) / 100,
        economyRate: Math.round(economyRate * 100) / 100,
        dotBallPct: Math.round(dotBallPct * 100) / 100,
        catches,
        stumpings,
        playerOfMatch,
      },
      create: {
        playerId,
        season,
        team,
        matches: matchesCount,
        innings: battingInnings,
        totalRuns,
        highestScore,
        average: Math.round(battingAvg * 100) / 100,
        strikeRate: Math.round(strikeRate * 100) / 100,
        fifties,
        hundreds,
        fours: totalFours,
        sixes: totalSixes,
        totalWickets,
        bestBowling,
        bowlingAvg: Math.round(bowlingAvg * 100) / 100,
        economyRate: Math.round(economyRate * 100) / 100,
        dotBallPct: Math.round(dotBallPct * 100) / 100,
        catches,
        stumpings,
        playerOfMatch,
      },
    });

    if ((i + 1) % 100 === 0 || i === combos.length - 1) {
      log.progress(i + 1, combos.length, "player-seasons");
    }
  }

  log.success(`Computed ${combos.length} player season stat records`);
  log.done();
}

main()
  .catch((e) => {
    log.error("Failed", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
