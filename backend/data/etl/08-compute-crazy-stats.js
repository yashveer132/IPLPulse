import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Logger from "./utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const log = new Logger("08-crazy-stats");

const RAW_DIR = path.resolve(__dirname, "../raw/cricsheet");

function normalizeVenue(v) {
  if (!v) return "Unknown";
  if (v.includes("Chinnaswamy")) return "M. Chinnaswamy Stadium, Bengaluru";
  if (v.includes("Wankhede")) return "Wankhede Stadium, Mumbai";
  if (v.includes("Eden Gardens")) return "Eden Gardens, Kolkata";
  if (v.includes("Feroz Shah") || v.includes("Arun Jaitley"))
    return "Arun Jaitley Stadium, Delhi";
  if (v.includes("Rajiv Gandhi")) return "Rajiv Gandhi Int Stadium, Hyderabad";
  if (v.includes("Chepauk") || v.includes("Chidambaram"))
    return "MA Chidambaram Stadium, Chennai";
  if (v.includes("Narendra Modi") || v.includes("Motera"))
    return "Narendra Modi Stadium, Ahmedabad";
  if (v.includes("Sawai Mansingh")) return "Sawai Mansingh Stadium, Jaipur";
  if (v.includes("PCA Stadium") || v.includes("Punjab Cricket"))
    return "PCA Stadium, Mohali";
  if (v.includes("Dubai")) return "Dubai International Stadium";
  if (v.includes("Sharjah")) return "Sharjah Cricket Stadium";
  if (v.includes("Zayed")) return "Sheikh Zayed Stadium, Abu Dhabi";
  if (v.includes("Maharashtra Cricket Association") || v.includes("MCA"))
    return "MCA Stadium, Pune";
  if (v.includes("Brabourne")) return "Brabourne Stadium, Mumbai";
  if (v.includes("DY Patil")) return "DY Patil Stadium, Navi Mumbai";
  if (v.includes("Green Park")) return "Green Park, Kanpur";
  if (v.includes("Holkar")) return "Holkar Stadium, Indore";
  if (v.includes("JSCA")) return "JSCA Stadium, Ranchi";
  if (v.includes("Saurashtra")) return "SCA Stadium, Rajkot";
  if (v.includes("Dr. Y.S. Rajasekhara") || v.includes("ACA-VDCA"))
    return "ACA-VDCA Stadium, Visakhapatnam";
  if (v.includes("Barabati")) return "Barabati Stadium, Cuttack";
  if (v.includes("Himachal Pradesh") || v.includes("Dharamsala"))
    return "HPCA Stadium, Dharamsala";
  if (v.includes("Vidarbha")) return "VCA Stadium, Nagpur";
  if (v.includes("Kingsmead")) return "Kingsmead, Durban";
  if (v.includes("Centurion") || v.includes("SuperSport"))
    return "SuperSport Park, Centurion";
  if (v.includes("Wanderers")) return "Wanderers Stadium, Johannesburg";
  if (v.includes("St George")) return "St George's Park, Port Elizabeth";
  if (v.includes("Newlands")) return "Newlands, Cape Town";
  if (v.includes("Buffalo Park")) return "Buffalo Park, East London";
  if (v.includes("De Beers")) return "De Beers Diamond Oval, Kimberley";
  if (
    v.includes("Mangaung") ||
    v.includes("OUTsurance") ||
    v.includes("Free State")
  )
    return "Mangaung Oval, Bloemfontein";
  if (v.includes("Ekana") || v.includes("Lucknow"))
    return "Ekana Cricket Stadium, Lucknow";
  if (v.includes("Barsapara") || v.includes("Guwahati"))
    return "Barsapara Cricket Stadium, Guwahati";
  if (v.includes("Maharaja Yadavindra") || v.includes("Mullanpur"))
    return "Maharaja Yadavindra Stadium, Mullanpur";
  return v;
}

async function main() {
  log.info(
    "Starting Crazy Advanced Analytics Computation (Head-to-Head, Venue Mastery, Pressure Index)...",
  );

  const jsonFiles = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".json"));
  log.info(`Found ${jsonFiles.length} match files to parse.`);

  const players = await prisma.player.findMany({
    select: { id: true, name: true, cricsheetId: true },
  });
  const playerMap = new Map();
  players.forEach((p) => {
    playerMap.set(p.name.toLowerCase(), p.id);
    if (p.cricsheetId) playerMap.set(p.cricsheetId, p.id);
  });

  const getPlayerId = (name) => {
    const key = name.toLowerCase();
    if (playerMap.has(key)) return playerMap.get(key);
    return null;
  };

  const headToHead = new Map();
  const venueStats = new Map();
  const playerCrazy = new Map();

  log.info("Aggregating balls from all historical matches...");

  for (const file of jsonFiles) {
    const rawData = JSON.parse(
      fs.readFileSync(path.join(RAW_DIR, file), "utf8"),
    );
    const info = rawData.info;
    const matchWinner = info.outcome?.winner;
    const rawVenue = info.venue || info.city || "Unknown";
    const venue = normalizeVenue(rawVenue);

    const matchBatterStats = new Map();
    const matchBowlerStats = new Map();
    const matchFieldingStats = new Map();
    const playersInMatch = new Set();

    const inningsData = rawData.innings || [];

    let team1 = null;
    let team2 = null;

    if (inningsData.length >= 1) team1 = inningsData[0].team;
    if (inningsData.length >= 2) team2 = inningsData[1].team;

    inningsData.forEach((inningObj, inningIdx) => {
      const isChasing = inningIdx === 1;
      const battingTeam = inningObj.team;
      const isTeamWinning = battingTeam === matchWinner;

      const overs = inningObj.overs || [];
      overs.forEach((overObj) => {
        const overNum = overObj.over;
        const isPowerplay = overNum < 6;
        const isDeath = overNum >= 15;

        overObj.deliveries.forEach((ball) => {
          const batterId = getPlayerId(ball.batter);
          const bowlerId = getPlayerId(ball.bowler);
          if (!batterId || !bowlerId) return;

          const runsScored = ball.runs.batter;
          const runsConceded = ball.runs.total;
          const isFour = runsScored === 4 ? 1 : 0;
          const isSix = runsScored === 6 ? 1 : 0;
          const isDot =
            runsScored === 0 &&
            (ball.runs.extras === 0 ||
              ball.extras?.legbyes ||
              ball.extras?.byes)
              ? 1
              : 0;
          const isWicket = ball.wickets && ball.wickets.length > 0 ? 1 : 0;

          const h2hKey = `${batterId}_${bowlerId}`;
          if (!headToHead.has(h2hKey)) {
            headToHead.set(h2hKey, {
              runsScored: 0,
              ballsFaced: 0,
              dismissals: 0,
              fours: 0,
              sixes: 0,
              dotBalls: 0,
              seasonDetails: {},
              phaseDetails: {
                Powerplay: { runs: 0, balls: 0, wkts: 0 },
                Middle: { runs: 0, balls: 0, wkts: 0 },
                Death: { runs: 0, balls: 0, wkts: 0 },
              },
              dismissalDetails: {},
            });
          }
          const h2h = headToHead.get(h2hKey);
          h2h.runsScored += runsScored;
          if (!ball.extras?.wides) h2h.ballsFaced += 1;
          h2h.fours += isFour;
          h2h.sixes += isSix;
          h2h.dotBalls += isDot;
          if (isWicket) {
            h2h.dismissals += 1;
            const wktKind = ball.wickets[0].kind;
            h2h.dismissalDetails[wktKind] =
              (h2h.dismissalDetails[wktKind] || 0) + 1;
          }

          const seasonStr = info.season?.toString() || "Unknown";
          if (!h2h.seasonDetails[seasonStr]) {
            h2h.seasonDetails[seasonStr] = {
              runs: 0,
              balls: 0,
              wkts: 0,
              deliveries: [],
            };
          }
          h2h.seasonDetails[seasonStr].runs += runsScored;
          if (!ball.extras?.wides) h2h.seasonDetails[seasonStr].balls += 1;
          if (isWicket) h2h.seasonDetails[seasonStr].wkts += 1;

          h2h.seasonDetails[seasonStr].deliveries.push({
            date:
              info.dates && info.dates.length > 0
                ? info.dates[0]
                : "Unknown Date",
            venue: venue,
            over: overNum + 1,
            runs: runsScored,
            extras: ball.extras ? Object.keys(ball.extras).join(",") : null,
            wicket: isWicket ? ball.wickets[0].kind : null,
          });

          const phaseStr = isPowerplay
            ? "Powerplay"
            : isDeath
              ? "Death"
              : "Middle";
          h2h.phaseDetails[phaseStr].runs += runsScored;
          if (!ball.extras?.wides) h2h.phaseDetails[phaseStr].balls += 1;
          if (isWicket) h2h.phaseDetails[phaseStr].wkts += 1;

          playersInMatch.add(batterId);
          playersInMatch.add(bowlerId);

          if (!matchBatterStats.has(batterId)) {
            matchBatterStats.set(batterId, {
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              isOut: false,
            });
          }
          const mBat = matchBatterStats.get(batterId);
          mBat.runs += runsScored;
          if (!ball.extras?.wides) mBat.balls += 1;
          mBat.fours += isFour;
          mBat.sixes += isSix;

          if (!matchBowlerStats.has(bowlerId)) {
            matchBowlerStats.set(bowlerId, {
              runsConceded: 0,
              balls: 0,
              wickets: 0,
            });
          }
          const mBowl = matchBowlerStats.get(bowlerId);
          mBowl.runsConceded += runsConceded;
          if (!ball.extras?.wides && !ball.extras?.noballs) mBowl.balls += 1;

          if (isWicket) {
            const wicketType = ball.wickets[0].kind;
            if (
              wicketType !== "run out" &&
              wicketType !== "retired hurt" &&
              wicketType !== "obstructing the field"
            ) {
              mBowl.wickets += 1;
            }

            if (ball.wickets[0].player_out) {
              const outPlayerId = getPlayerId(ball.wickets[0].player_out);
              if (outPlayerId && matchBatterStats.has(outPlayerId)) {
                matchBatterStats.get(outPlayerId).isOut = true;
              }
            } else {
              mBat.isOut = true;
            }

            if (ball.wickets[0].fielders) {
              ball.wickets[0].fielders.forEach((f) => {
                const fielderId = getPlayerId(f.name);
                if (fielderId) {
                  playersInMatch.add(fielderId);
                  if (!matchFieldingStats.has(fielderId)) {
                    matchFieldingStats.set(fielderId, {
                      catches: 0,
                      stumpings: 0,
                      runOuts: 0,
                    });
                  }
                  const fStat = matchFieldingStats.get(fielderId);
                  if (
                    wicketType === "caught" ||
                    wicketType === "caught and bowled"
                  )
                    fStat.catches += 1;
                  else if (wicketType === "stumped") fStat.stumpings += 1;
                  else if (wicketType === "run out") fStat.runOuts += 1;
                }
              });
            }
          }

          if (!playerCrazy.has(batterId)) {
            playerCrazy.set(batterId, {
              deathRuns: 0,
              deathBalls: 0,
              deathWickets: 0,
              ppRunsConceded: 0,
              ppBallsBowled: 0,
              ppWickets: 0,
            });
          }
          if (!playerCrazy.has(bowlerId)) {
            playerCrazy.set(bowlerId, {
              deathRuns: 0,
              deathBalls: 0,
              deathWickets: 0,
              ppRunsConceded: 0,
              ppBallsBowled: 0,
              ppWickets: 0,
            });
          }

          const cBat = playerCrazy.get(batterId);
          const cBowl = playerCrazy.get(bowlerId);

          if (isDeath) {
            cBat.deathRuns += runsScored;
            if (!ball.extras?.wides) cBat.deathBalls += 1;
          }

          if (isPowerplay) {
            cBowl.ppRunsConceded += runsConceded;
            if (!ball.extras?.wides && !ball.extras?.noballs)
              cBowl.ppBallsBowled += 1;
            if (isWicket) {
              const wicketType = ball.wickets[0].kind;
              if (wicketType !== "run out") cBowl.ppWickets += 1;
            }
          }
        });
      });
    });

    playersInMatch.forEach((playerId) => {
      const vKey = `${playerId}_${venue}`;
      if (!venueStats.has(vKey)) {
        venueStats.set(vKey, {
          runsScored: 0,
          ballsFaced: 0,
          highestScore: 0,
          inningsBat: 0,
          notOuts: 0,
          fours: 0,
          sixes: 0,
          fifties: 0,
          centuries: 0,
          wickets: 0,
          runsConceded: 0,
          ballsBowled: 0,
          inningsBowl: 0,
          bestWickets: 0,
          bestRuns: 0,
          catches: 0,
          stumpings: 0,
          runOuts: 0,
          matchesPlayed: 0,
          matchLogs: [],
        });
      }
      const vStat = venueStats.get(vKey);
      vStat.matchesPlayed += 1;

      const bStats = matchBatterStats.get(playerId) || {
        runs: 0,
        balls: 0,
        isOut: false,
      };
      const wStats = matchBowlerStats.get(playerId) || {
        runsConceded: 0,
        wickets: 0,
        balls: 0,
      };
      const fStats = matchFieldingStats.get(playerId) || {
        catches: 0,
        stumpings: 0,
        runOuts: 0,
      };

      vStat.matchLogs.push({
        date:
          info.dates && info.dates.length > 0 ? info.dates[0] : "Unknown Date",
        runs: bStats.runs,
        balls: bStats.balls,
        isOut: bStats.isOut,
        wickets: wStats.wickets,
        runsConceded: wStats.runsConceded,
        ballsBowled: wStats.balls,
        catches: fStats.catches,
        stumpings: fStats.stumpings,
        runOuts: fStats.runOuts,
      });
    });

    matchBatterStats.forEach((stats, playerId) => {
      const vKey = `${playerId}_${venue}`;
      const vStat = venueStats.get(vKey);
      if (vStat) {
        vStat.inningsBat += 1;
        vStat.runsScored += stats.runs;
        vStat.ballsFaced += stats.balls;
        vStat.fours += stats.fours;
        vStat.sixes += stats.sixes;
        if (!stats.isOut) vStat.notOuts += 1;
        if (stats.runs > vStat.highestScore) vStat.highestScore = stats.runs;

        if (stats.runs >= 100) vStat.centuries += 1;
        else if (stats.runs >= 50) vStat.fifties += 1;
      }
    });

    matchBowlerStats.forEach((stats, playerId) => {
      const vKey = `${playerId}_${venue}`;
      const vStat = venueStats.get(vKey);
      if (vStat) {
        vStat.inningsBowl += 1;
        vStat.runsConceded += stats.runsConceded;
        vStat.ballsBowled += stats.balls;
        vStat.wickets += stats.wickets;

        if (
          stats.wickets > vStat.bestWickets ||
          (stats.wickets === vStat.bestWickets &&
            stats.runsConceded < vStat.bestRuns)
        ) {
          vStat.bestWickets = stats.wickets;
          vStat.bestRuns = stats.runsConceded;
        }
      }
    });

    matchFieldingStats.forEach((stats, playerId) => {
      const vKey = `${playerId}_${venue}`;
      const vStat = venueStats.get(vKey);
      if (vStat) {
        vStat.catches += stats.catches;
        vStat.stumpings += stats.stumpings;
        vStat.runOuts += stats.runOuts;
      }
    });
  }

  log.info(`Parsed ${headToHead.size} unique Head-to-Head matchups!`);
  log.info(`Parsed ${venueStats.size} unique Player-Venue stats!`);

  function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  }

  log.info("Clearing old crazy stats data...");
  await prisma.headToHeadStat.deleteMany({});
  await prisma.venueMasteryStat.deleteMany({});
  await prisma.playerCrazyStats.deleteMany({});

  log.info("Inserting Head-to-Head Stats...");
  const h2hArray = Array.from(headToHead.entries()).map(([key, stats]) => {
    const [batterId, bowlerId] = key.split("_");
    const strikeRate =
      stats.ballsFaced > 0 ? (stats.runsScored / stats.ballsFaced) * 100 : 0;
    return {
      batterId,
      bowlerId,
      runsScored: stats.runsScored,
      ballsFaced: stats.ballsFaced,
      dismissals: stats.dismissals,
      fours: stats.fours,
      sixes: stats.sixes,
      dotBalls: stats.dotBalls,
      seasonDetails: stats.seasonDetails,
      phaseDetails: stats.phaseDetails,
      dismissalDetails: stats.dismissalDetails,
      strikeRate,
    };
  });
  log.info(`Inserting ${h2hArray.length} head-to-head records...`);

  for (const chunk of chunkArray(h2hArray, 2000)) {
    await prisma.headToHeadStat.createMany({ data: chunk });
  }

  log.info("Inserting Venue Mastery Stats...");
  const venueArray = Array.from(venueStats.entries()).map(([key, stats]) => {
    const [playerId, ...venueParts] = key.split("_");
    const venue = venueParts.join("_");
    const { bestWickets, bestRuns, ...restStats } = stats;
    return {
      playerId,
      venue,
      ...restStats,
      bestBowlingWickets: bestWickets,
      bestBowlingRuns: bestRuns,
    };
  });
  log.info(`Inserting ${venueArray.length} venue mastery records...`);

  for (const chunk of chunkArray(venueArray, 2000)) {
    await prisma.venueMasteryStat.createMany({ data: chunk });
  }

  log.info("Inserting Player Crazy Stats...");
  const crazyArray = Array.from(playerCrazy.entries()).map(
    ([playerId, stats]) => {
      return {
        playerId,
        deathOversRunsScored: stats.deathRuns,
        deathOversBallsFaced: stats.deathBalls,
        deathOversWickets: stats.deathWickets,
        powerplayRunsConceded: stats.ppRunsConceded,
        powerplayBallsBowled: stats.ppBallsBowled,
        powerplayWickets: stats.ppWickets,
      };
    },
  );
  log.info(`Inserting ${crazyArray.length} player crazy stats records...`);

  for (const chunk of chunkArray(crazyArray, 2000)) {
    await prisma.playerCrazyStats.createMany({ data: chunk });
  }

  log.info("✨ Crazy Stats inserted successfully!");
}

main().catch(console.error);
