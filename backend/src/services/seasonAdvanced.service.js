import fs from "fs";
import path from "path";
import { getPrisma } from "../config/index.js";

const RAW_CRICSHEET_DIR = path.join(process.cwd(), "data", "raw", "cricsheet");

export async function computeEliteFeatures(
  year,
  matches,
  allPlayerMatchStats,
  playerSeasonStats,
  seasonMilestones,
) {
  const prisma = await getPrisma();

  const matchFiles = [];
  matches.forEach((m) => {
    if (m.cricsheetId) {
      const fp = path.join(RAW_CRICSHEET_DIR, `${m.cricsheetId}.json`);
      if (fs.existsSync(fp)) {
        try {
          matchFiles.push({
            match: m,
            raw: JSON.parse(fs.readFileSync(fp, "utf8")),
          });
        } catch (e) {
          console.error(`Error parsing ${fp}: ${e.message}`);
        }
      }
    }
  });

  let fastestFifty = null;
  let fastestHundred = null;
  const batterClutchStats = {};
  const bowlerClutchStats = {};

  const getBatterStat = (id, name, role) => {
    if (!batterClutchStats[id]) {
      batterClutchStats[id] = {
        player: { id, name, role },
        runs: 0,
        clutchPoints: 0,
      };
    }
    return batterClutchStats[id];
  };

  const getBowlerStat = (id, name, role) => {
    if (!bowlerClutchStats[id]) {
      bowlerClutchStats[id] = {
        player: { id, name, role },
        wickets: 0,
        clutchPoints: 0,
        topOrderWickets: 0,
      };
    }
    return bowlerClutchStats[id];
  };

  const finisherStats = {};
  const getFinisherStat = (id, name, role) => {
    if (!finisherStats[id]) {
      finisherStats[id] = {
        player: { id, name, role },
        deathRuns: 0,
        deathBalls: 0,
      };
    }
    return finisherStats[id];
  };

  const dynamicH2H = {};

  matchFiles.forEach(({ match, raw }) => {
    const isPlayoff = match.matchNumber === null && match.winner !== null;
    const team1Score = 0;

    const registry = raw.info?.registry?.people || {};
    const getCricsheetId = (name) => registry[name] || null;

    (raw.innings || []).forEach((inning) => {
      const isChasing = inning.team !== match.team1;
      const target = isChasing ? 180 : 0;

      let currentWickets = 0;
      const batterRuns = {};

      (inning.overs || []).forEach((overData) => {
        const overNum = overData.over;
        const isDeathOver = overNum >= 16 && overNum <= 19;

        overData.deliveries.forEach((del) => {
          const batterName = del.batter;
          const bowlerName = del.bowler;
          const batterId = getCricsheetId(batterName);
          const bowlerId = getCricsheetId(bowlerName);

          if (!batterRuns[batterName]) {
            batterRuns[batterName] = {
              runs: 0,
              balls: 0,
              position: Object.keys(batterRuns).length + 1,
            };
          }

          const h2hKey = `${batterName}|${bowlerName}`;
          if (!dynamicH2H[h2hKey]) {
            dynamicH2H[h2hKey] = {
              batter: batterName,
              bowler: bowlerName,
              runs: 0,
              balls: 0,
              wkts: 0,
            };
          }

          const runs = del.runs?.batter || 0;
          const extras = del.extras || {};
          const isWide = extras.wides !== undefined;

          if (!isWide) {
            batterRuns[batterName].balls += 1;
            dynamicH2H[h2hKey].balls += 1;
          }
          batterRuns[batterName].runs += runs;
          dynamicH2H[h2hKey].runs += runs;

          if (batterId && isDeathOver) {
            const pms = allPlayerMatchStats.find(
              (s) => s.matchId === match.id && s.playerId === batterId,
            );
            if (pms) {
              const fStat = getFinisherStat(
                batterId,
                pms.player.name,
                pms.player.role,
              );
              fStat.deathRuns += runs;
              if (!isWide) fStat.deathBalls += 1;
            }
          }

          if (batterRuns[batterName].runs >= 50) {
            const bStats = batterRuns[batterName];
            if (!bStats.reachedFifty) {
              bStats.reachedFifty = true;
              if (!fastestFifty || bStats.balls < fastestFifty.balls) {
                const pms = allPlayerMatchStats.find(
                  (s) => s.matchId === match.id && s.player.name === batterName,
                );
                if (pms) {
                  fastestFifty = {
                    player: pms.player,
                    runs: pms.runsScored,
                    balls: bStats.balls,
                    sr: Math.round((pms.runsScored / pms.ballsFaced) * 100),
                  };
                }
              }
            }
          }

          if (batterRuns[batterName].runs >= 100) {
            const bStats = batterRuns[batterName];
            if (!bStats.reachedHundred) {
              bStats.reachedHundred = true;
              if (!fastestHundred || bStats.balls < fastestHundred.balls) {
                const pms = allPlayerMatchStats.find(
                  (s) => s.matchId === match.id && s.player.name === batterName,
                );
                if (pms) {
                  fastestHundred = {
                    player: pms.player,
                    runs: pms.runsScored,
                    balls: bStats.balls,
                    sr: Math.round((pms.runsScored / pms.ballsFaced) * 100),
                  };
                }
              }
            }
          }

          if (batterId) {
            const pms = allPlayerMatchStats.find(
              (s) => s.matchId === match.id && s.playerId === batterId,
            );
            if (pms && (isDeathOver || currentWickets >= 3)) {
              const bStat = getBatterStat(
                batterId,
                pms.player.name,
                pms.player.role,
              );
              bStat.runs += runs;
              bStat.clutchPoints += runs * (isDeathOver ? 1.5 : 1);
            }
          }

          if (del.wickets) {
            currentWickets += del.wickets.length;
            del.wickets.forEach((w) => {
              if (
                bowlerId &&
                [
                  "bowled",
                  "caught",
                  "lbw",
                  "stumped",
                  "caught and bowled",
                ].includes(w.kind)
              ) {
                const h2hKey = `${batterName}|${bowlerName}`;
                if (dynamicH2H[h2hKey]) dynamicH2H[h2hKey].wkts += 1;

                const pms = allPlayerMatchStats.find(
                  (s) => s.matchId === match.id && s.playerId === bowlerId,
                );
                if (pms) {
                  const bwStat = getBowlerStat(
                    bowlerId,
                    pms.player.name,
                    pms.player.role,
                  );
                  if (isDeathOver || isPlayoff) {
                    bwStat.wickets += 1;
                    bwStat.clutchPoints +=
                      10 * (isPlayoff ? 2 : 1) * (isDeathOver ? 1.5 : 1);
                  }
                  if (
                    batterRuns[batterName] &&
                    batterRuns[batterName].position <= 3
                  ) {
                    bwStat.topOrderWickets += 1;
                  }
                }
              }
            });
          }
        });
      });
    });
  });

  const pressureIndex = {
    clutchBatter:
      Object.values(batterClutchStats).sort(
        (a, b) => b.clutchPoints - a.clutchPoints,
      )[0] || null,
    clutchBowler:
      Object.values(bowlerClutchStats).sort(
        (a, b) => b.clutchPoints - a.clutchPoints,
      )[0] || null,
  };

  const finishers = Object.values(finisherStats)
    .filter((f) => f.deathRuns >= 10)
    .map((f) => ({
      ...f,
      strikeRate:
        f.deathBalls > 0 ? Math.round((f.deathRuns / f.deathBalls) * 100) : 0,
    }))
    .sort((a, b) => b.strikeRate - a.strikeRate);

  const finisherOfTheSeason =
    finishers[0] ||
    Object.values(finisherStats)
      .map((f) => ({
        ...f,
        strikeRate:
          f.deathBalls > 0 ? Math.round((f.deathRuns / f.deathBalls) * 100) : 0,
      }))
      .sort((a, b) => b.deathRuns - a.deathRuns)[0] ||
    null;

  const enforcer =
    Object.values(bowlerClutchStats).sort(
      (a, b) => b.topOrderWickets - a.topOrderWickets,
    )[0] || null;
  const economyKing =
    playerSeasonStats
      .filter((s) => s.economyRate > 0 && s.totalWickets >= 3 && s.matches >= 3)
      .sort((a, b) => a.economyRate - b.economyRate)[0] ||
    playerSeasonStats
      .filter((s) => s.economyRate > 0)
      .sort((a, b) => a.economyRate - b.economyRate)[0] ||
    null;

  const seasonAwards = {
    finisher: finisherOfTheSeason,
    enforcer: enforcer,
    economyKing: economyKing,
  };

  if (fastestFifty) {
    seasonMilestones.fastestFifty = fastestFifty;
  }

  const matchScores = [];
  matches.forEach((m) => {
    if (!m.winner && !m.playerOfMatch) return;
    let score = 0;
    const summary = [];

    if (m.matchNumber === null) {
      score += 20;
      summary.push("High-stakes Playoff/Final");
    }

    if (m.winner === null && m.playerOfMatch) {
      score += 50;
      summary.push("Super Over Thriller");
    }

    if (m.winType === "runs" && m.winMargin <= 5) {
      score += 30;
      summary.push(`Nail-biting ${m.winMargin}-run finish`);
    } else if (m.winType === "wickets" && m.winMargin <= 2) {
      score += 30;
      summary.push(`Tense ${m.winMargin}-wicket victory`);
    } else if (m.winType === "wickets" && m.winMargin <= 4) {
      score += 15;
    } else if (m.winType === "runs" && m.winMargin <= 10) {
      score += 15;
    }

    const matchStats = allPlayerMatchStats.filter((s) => s.matchId === m.id);
    const totalRuns = matchStats.reduce((sum, s) => sum + s.runsScored, 0);
    if (totalRuns >= 400) {
      score += 25;
      summary.push(`Run-fest (${totalRuns} aggregate runs)`);
    } else if (totalRuns >= 350) {
      score += 10;
    }

    if (m.winType === "wickets") {
      const batFirstRuns = matchStats
        .filter((s) => s.team !== m.winner)
        .reduce((sum, s) => sum + s.runsScored, 0);
      if (batFirstRuns >= 200) {
        score += 30;
        summary.push(`Incredible 200+ run chase`);
      }
    }

    const chaseStats = matchStats.filter((s) =>
      m.winner ? s.team === m.winner && m.winType === "wickets" : false,
    );
    const ballsChasing = chaseStats.reduce((sum, s) => sum + s.ballsFaced, 0);
    if (m.winType === "wickets" && ballsChasing >= 115) {
      score += 15;
      if (!summary.includes("Super Over Thriller")) {
        summary.push("Final over drama");
      }
    } else if (m.winType === "runs" && m.winMargin <= 10) {
      score += 15;
      if (!summary.includes("Super Over Thriller")) {
        summary.push("Final over drama");
      }
    }

    matchStats.forEach((s) => {
      if (s.runsScored >= 100) {
        score += 10;
        summary.push(`Century by ${s.player.name}`);
      }
      if (s.wickets >= 5) {
        score += 10;
        summary.push(`5-fer by ${s.player.name}`);
      }
    });

    if (score > 0) {
      matchScores.push({ match: m, score, summary: [...new Set(summary)] });
    }
  });

  const hallOfFameMatch =
    matchScores.sort((a, b) => b.score - a.score)[0] || null;

  let rivalries = [];
  try {
    Object.values(dynamicH2H).forEach((stats) => {
      if (
        stats.wkts >= 2 ||
        (stats.runs >= 30 && stats.runs / stats.balls >= 1.6)
      ) {
        const intensity =
          stats.wkts * 20 + stats.runs + (stats.runs / stats.balls) * 10;
        rivalries.push({
          batter: stats.batter,
          bowler: stats.bowler,
          runs: stats.runs,
          balls: stats.balls,
          dismissals: stats.wkts,
          strikeRate: Math.round((stats.runs / stats.balls) * 100),
          intensity,
        });
      }
    });
  } catch (e) {
    console.error("H2H Rivals Error:", e);
  }
  rivalries = rivalries.sort((a, b) => b.intensity - a.intensity).slice(0, 3);

  let mostImprovedPlayer = null;
  try {
    const prevYearStats = await prisma.playerSeasonStats.findMany({
      where: { season: year - 1 },
      select: {
        playerId: true,
        totalRuns: true,
        totalWickets: true,
        matches: true,
        performanceScore: true,
      },
    });

    const prevMap = {};
    prevYearStats.forEach((s) => (prevMap[s.playerId] = s));

    const improvedPlayers = [];
    playerSeasonStats.forEach((s) => {
      const prev = prevMap[s.playerId];
      if (prev && prev.matches >= 5 && s.matches >= 5) {
        const runDelta = s.totalRuns - prev.totalRuns;
        const wktDelta = (s.totalWickets - prev.totalWickets) * 20;
        const perfDelta = s.performanceScore - prev.performanceScore;

        let improvementScore = 0;
        if (s.player.role === "Bowler") {
          improvementScore = wktDelta + perfDelta;
        } else {
          improvementScore = runDelta + perfDelta;
        }

        if (improvementScore > 50) {
          improvedPlayers.push({
            player: s.player,
            improvementScore: Math.round(improvementScore),
            currentRuns: s.totalRuns,
            prevRuns: prev.totalRuns,
            currentWickets: s.totalWickets,
            prevWickets: prev.totalWickets,
            currentPerf: Math.round(s.performanceScore),
            prevPerf: Math.round(prev.performanceScore),
          });
        }
      }
    });

    mostImprovedPlayer =
      improvedPlayers.sort(
        (a, b) => b.improvementScore - a.improvementScore,
      )[0] || null;
  } catch (e) {
    console.error("MIP Error", e);
  }

  const recordsCheck = [];
  try {
    const [
      hRuns,
      hWkts,
      hSixes,
      hFours,
      h100s,
      hScore,
      hCatches,
      h50s,
      hStumps,
      histSR,
      histAvg,
      histEcon,
      histBowlAvg,
      hPoM,
      hBestSpell,
    ] = await Promise.all([
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { totalRuns: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { totalWickets: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { sixes: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { fours: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { hundreds: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { highestScore: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { catches: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { fifties: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { stumpings: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year }, totalRuns: { gte: 200 } },
        orderBy: { strikeRate: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year }, innings: { gte: 10 } },
        orderBy: { average: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year }, totalWickets: { gte: 15 } },
        orderBy: { economyRate: "asc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year }, totalWickets: { gte: 15 } },
        orderBy: { bowlingAvg: "asc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerSeasonStats.findFirst({
        where: { season: { lt: year } },
        orderBy: { playerOfMatch: "desc" },
        include: { player: { select: { name: true } } },
      }),
      prisma.playerMatchStats.findFirst({
        where: { season: { lt: year } },
        orderBy: [{ wickets: "desc" }, { runsConceded: "asc" }],
        include: { player: { select: { name: true } } },
      }),
    ]);

    const currMaxRuns = playerSeasonStats.reduce(
      (max, s) => (s.totalRuns > max ? s.totalRuns : max),
      0,
    );
    const currMaxSixes = playerSeasonStats.reduce(
      (max, s) => (s.sixes > max ? s.sixes : max),
      0,
    );
    const currMaxWkts = playerSeasonStats.reduce(
      (max, s) => (s.totalWickets > max ? s.totalWickets : max),
      0,
    );
    const currMaxFours = playerSeasonStats.reduce(
      (max, s) => (s.fours > max ? s.fours : max),
      0,
    );
    const currMaxHundreds = playerSeasonStats.reduce(
      (max, s) => (s.hundreds > max ? s.hundreds : max),
      0,
    );
    const currMaxScore = playerSeasonStats.reduce(
      (max, s) => (s.highestScore > max ? s.highestScore : max),
      0,
    );
    const currMaxCatches = playerSeasonStats.reduce(
      (max, s) => (s.catches > max ? s.catches : max),
      0,
    );
    const currMaxFifties = playerSeasonStats.reduce(
      (max, s) => (s.fifties > max ? s.fifties : max),
      0,
    );
    const currMaxStumpings = playerSeasonStats.reduce(
      (max, s) => (s.stumpings > max ? s.stumpings : max),
      0,
    );

    const currMaxSR = playerSeasonStats
      .filter((s) => s.totalRuns >= 200)
      .reduce((max, s) => (s.strikeRate > max ? s.strikeRate : max), 0);
    const currMaxAvg = playerSeasonStats
      .filter((s) => s.innings >= 10)
      .reduce((max, s) => (s.average > max ? s.average : max), 0);
    const currMinEcon = playerSeasonStats
      .filter((s) => s.totalWickets >= 15)
      .reduce(
        (min, s) => (min === 0 || s.economyRate < min ? s.economyRate : min),
        0,
      );
    const currMinBowlAvg = playerSeasonStats
      .filter((s) => s.totalWickets >= 15)
      .reduce(
        (min, s) => (min === 0 || s.bowlingAvg < min ? s.bowlingAvg : min),
        0,
      );
    const currMaxPoM = playerSeasonStats.reduce(
      (max, s) => (s.playerOfMatch > max ? s.playerOfMatch : max),
      0,
    );
    const currBestSpell =
      allPlayerMatchStats.sort(
        (a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded,
      )[0] || null;

    if (hRuns && hRuns.totalRuns > 0) {
      recordsCheck.push({
        title: "Most Runs in a Season",
        old: hRuns.totalRuns,
        oldPlayer: hRuns.player.name,
        new: currMaxRuns,
        player: playerSeasonStats.find((s) => s.totalRuns === currMaxRuns)
          ?.player,
        isBroken: currMaxRuns > hRuns.totalRuns,
      });
    }
    if (hSixes && hSixes.sixes > 0) {
      recordsCheck.push({
        title: "Most Sixes in a Season",
        old: hSixes.sixes,
        oldPlayer: hSixes.player.name,
        new: currMaxSixes,
        player: playerSeasonStats.find((s) => s.sixes === currMaxSixes)?.player,
        isBroken: currMaxSixes > hSixes.sixes,
      });
    }
    if (hWkts && hWkts.totalWickets > 0) {
      recordsCheck.push({
        title: "Most Wickets in a Season",
        old: hWkts.totalWickets,
        oldPlayer: hWkts.player.name,
        new: currMaxWkts,
        player: playerSeasonStats.find((s) => s.totalWickets === currMaxWkts)
          ?.player,
        isBroken: currMaxWkts > hWkts.totalWickets,
      });
    }
    if (hFours && hFours.fours > 0) {
      recordsCheck.push({
        title: "Most Fours in a Season",
        old: hFours.fours,
        oldPlayer: hFours.player.name,
        new: currMaxFours,
        player: playerSeasonStats.find((s) => s.fours === currMaxFours)?.player,
        isBroken: currMaxFours > hFours.fours,
      });
    }
    if (hScore && hScore.highestScore > 0) {
      recordsCheck.push({
        title: "Highest Individual Score",
        old: hScore.highestScore,
        oldPlayer: hScore.player.name,
        new: currMaxScore,
        player: playerSeasonStats.find((s) => s.highestScore === currMaxScore)
          ?.player,
        isBroken: currMaxScore > hScore.highestScore,
      });
    }
    if (h100s && h100s.hundreds > 0) {
      recordsCheck.push({
        title: "Most Centuries in a Season",
        old: h100s.hundreds,
        oldPlayer: h100s.player.name,
        new: currMaxHundreds,
        player: playerSeasonStats.find((s) => s.hundreds === currMaxHundreds)
          ?.player,
        isBroken: currMaxHundreds > h100s.hundreds,
      });
    }
    if (hCatches && hCatches.catches > 0) {
      recordsCheck.push({
        title: "Most Catches in a Season",
        old: hCatches.catches,
        oldPlayer: hCatches.player.name,
        new: currMaxCatches,
        player: playerSeasonStats.find((s) => s.catches === currMaxCatches)
          ?.player,
        isBroken: currMaxCatches > hCatches.catches,
      });
    }
    if (h50s && h50s.fifties > 0) {
      recordsCheck.push({
        title: "Most Fifties in a Season",
        old: h50s.fifties,
        oldPlayer: h50s.player.name,
        new: currMaxFifties,
        player: playerSeasonStats.find((s) => s.fifties === currMaxFifties)
          ?.player,
        isBroken: currMaxFifties > h50s.fifties,
      });
    }
    if (hStumps && hStumps.stumpings > 0) {
      recordsCheck.push({
        title: "Most Stumpings in a Season",
        old: hStumps.stumpings,
        oldPlayer: hStumps.player.name,
        new: currMaxStumpings,
        player: playerSeasonStats.find((s) => s.stumpings === currMaxStumpings)
          ?.player,
        isBroken: currMaxStumpings > hStumps.stumpings,
      });
    }

    if (histSR && histSR.strikeRate > 0) {
      recordsCheck.push({
        title: "Highest Strike Rate (min 200 runs)",
        old: histSR.strikeRate,
        oldPlayer: histSR.player.name,
        new: currMaxSR,
        player: playerSeasonStats.find(
          (s) => s.strikeRate === currMaxSR && s.totalRuns >= 200,
        )?.player,
        isBroken: currMaxSR > histSR.strikeRate,
      });
    }
    if (histAvg && histAvg.average > 0) {
      recordsCheck.push({
        title: "Highest Average (min 10 innings)",
        old: histAvg.average,
        oldPlayer: histAvg.player.name,
        new: currMaxAvg,
        player: playerSeasonStats.find(
          (s) => s.average === currMaxAvg && s.innings >= 10,
        )?.player,
        isBroken: currMaxAvg > histAvg.average,
      });
    }
    if (histEcon && histEcon.economyRate > 0 && currMinEcon > 0) {
      recordsCheck.push({
        title: "Best Economy Rate (min 15 wkts)",
        old: histEcon.economyRate,
        oldPlayer: histEcon.player.name,
        new: currMinEcon,
        player: playerSeasonStats.find(
          (s) => s.economyRate === currMinEcon && s.totalWickets >= 15,
        )?.player,
        isBroken: currMinEcon < histEcon.economyRate,
      });
    }
    if (histBowlAvg && histBowlAvg.bowlingAvg > 0 && currMinBowlAvg > 0) {
      recordsCheck.push({
        title: "Best Bowling Avg (min 15 wkts)",
        old: histBowlAvg.bowlingAvg,
        oldPlayer: histBowlAvg.player.name,
        new: currMinBowlAvg,
        player: playerSeasonStats.find(
          (s) => s.bowlingAvg === currMinBowlAvg && s.totalWickets >= 15,
        )?.player,
        isBroken: currMinBowlAvg < histBowlAvg.bowlingAvg,
      });
    }

    if (hPoM && hPoM.playerOfMatch > 0) {
      recordsCheck.push({
        title: "Most PoM Awards",
        old: hPoM.playerOfMatch,
        oldPlayer: hPoM.player.name,
        new: currMaxPoM,
        player: playerSeasonStats.find((s) => s.playerOfMatch === currMaxPoM)
          ?.player,
        isBroken: currMaxPoM > hPoM.playerOfMatch,
      });
    }

    if (hBestSpell && hBestSpell.wickets > 0 && currBestSpell) {
      const oldSpellStr = `${hBestSpell.wickets}/${hBestSpell.runsConceded}`;
      const newSpellStr = `${currBestSpell.wickets}/${currBestSpell.runsConceded}`;
      const isBroken =
        currBestSpell.wickets > hBestSpell.wickets ||
        (currBestSpell.wickets === hBestSpell.wickets &&
          currBestSpell.runsConceded < hBestSpell.runsConceded);
      recordsCheck.push({
        title: "Best Bowling Spell",
        old: oldSpellStr,
        oldPlayer: hBestSpell.player.name,
        new: newSpellStr,
        player: currBestSpell.player,
        isBroken,
      });
    }

    if (fastestFifty) {
      recordsCheck.push({
        title: "Fastest Fifty",
        old: 13,
        oldPlayer: "Yashasvi Jaiswal",
        new: fastestFifty.balls,
        player: fastestFifty.player,
        isBroken: fastestFifty.balls < 13,
      });
    }
    if (fastestHundred) {
      recordsCheck.push({
        title: "Fastest Hundred",
        old: 30,
        oldPlayer: "Chris Gayle",
        new: fastestHundred.balls,
        player: fastestHundred.player,
        isBroken: fastestHundred.balls < 30,
      });
    }
  } catch (e) {}

  const recordsBroken = recordsCheck.filter((r) => r.isBroken);

  let narrative = "";
  if (recordsBroken.length > 0) {
    narrative = `The season was defined by record-breaking performances, headlined by ${recordsBroken[0].player?.name}'s unprecedented ${recordsBroken[0].new} ${recordsBroken[0].title.toLowerCase().replace(" in a season", "").replace("most ", "")}.`;
  } else if (playerSeasonStats.some((s) => s.totalRuns >= 700)) {
    const star = playerSeasonStats.find((s) => s.totalRuns >= 700);
    narrative = `Batting dominated the season, with ${star.player.name} producing an elite run-scoring campaign with ${star.totalRuns} runs.`;
  } else if (playerSeasonStats.some((s) => s.totalWickets >= 30)) {
    const star = playerSeasonStats.find((s) => s.totalWickets >= 30);
    narrative = `A bowler's paradise where ${star.player.name} dismantled lineups, securing a staggering ${star.totalWickets} wickets.`;
  } else {
    narrative = `A highly competitive season with balanced contests between bat and ball, culminating in intense rivalries and high-pressure chases.`;
  }

  return {
    recordsCheck,
    seasonRivalries: rivalries,
    mostImprovedPlayer,
    hallOfFameMatch,
    pressureIndex,
    seasonNarrative: narrative,
    seasonAwards,
  };
}
