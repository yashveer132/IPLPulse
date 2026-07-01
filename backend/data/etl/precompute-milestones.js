import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, "../raw/cricsheet");
const OUTPUT_DIR = path.resolve(__dirname, "../../src/data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "milestones_cache.json");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("Reading match files from:", DIR);
if (!fs.existsSync(DIR)) {
  console.error("Cricsheet raw data not found at:", DIR);
  process.exit(1);
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));
console.log(`Found ${files.length} JSON files. Pre-processing in memory...`);

const matches = [];
for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf-8"));
    if (data.innings) {
      matches.push(data);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
}
console.log(`Successfully loaded ${matches.length} matches with innings.`);

console.log("Computing fastest milestone curve...");
const minBallsPerScore = {};

for (const data of matches) {
  for (const inning of data.innings) {
    const batStats = {};
    for (const over of inning.overs) {
      for (const delivery of over.deliveries) {
        const batter = delivery.batter;
        if (!batStats[batter]) batStats[batter] = { runs: 0, balls: 0 };
        const stats = batStats[batter];

        if (!delivery.extras?.wides) stats.balls += 1;
        stats.runs += delivery.runs.batter;

        const currentRuns = stats.runs;
        if (currentRuns >= 20) {
          if (
            !minBallsPerScore[currentRuns] ||
            stats.balls < minBallsPerScore[currentRuns].balls
          ) {
            minBallsPerScore[currentRuns] = {
              runs: currentRuns,
              balls: stats.balls,
              playerName: batter,
            };
          }
        }
      }
    }
  }
}

const curve = Object.values(minBallsPerScore).sort((a, b) => a.runs - b.runs);
console.log(`Computed curve data with ${curve.length} milestones.`);

const milestones = {};
const targets = [];
for (let t = 20; t <= 180; t++) {
  targets.push(t);
}

console.log("Computing fastest/slowest tables for targets 20 to 180...");
for (const targetRuns of targets) {
  const results = [];

  for (const data of matches) {
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

  milestones[targetRuns] = { fastest, slowest };
}

console.log("Saving cache to:", OUTPUT_FILE);
fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify({ curve, milestones }, null, 2),
  "utf-8",
);
console.log("Precomputation complete!");
