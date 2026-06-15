import fs from 'fs';
import path from 'path';

export function parseCricsheetMatch(filePath) {
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const info = raw.info;
    const innings = raw.innings || [];

    if (!info || !info.dates || !info.teams) return null;

    const cricsheetId = path.basename(filePath, '.json');

    const matchDate = new Date(info.dates[0]);
    const season = matchDate.getFullYear();

    const team1 = info.teams[0];
    const team2 = info.teams[1];

    let winner = null;
    let winMargin = null;
    let winType = null;

    if (info.outcome && info.outcome.winner) {
      winner = info.outcome.winner;
      if (info.outcome.by) {
        if (info.outcome.by.runs) {
          winMargin = info.outcome.by.runs;
          winType = 'runs';
        } else if (info.outcome.by.wickets) {
          winMargin = info.outcome.by.wickets;
          winType = 'wickets';
        }
      }
    }

    const playerOfMatch = info.player_of_match ? info.player_of_match[0] : null;

    const match = {
      cricsheetId,
      season,
      matchNumber: info.event?.match_number || null,
      date: matchDate,
      venue: info.venue || 'Unknown',
      city: info.city || null,
      team1,
      team2,
      tossWinner: info.toss?.winner || null,
      tossDecision: info.toss?.decision || null,
      winner,
      winMargin,
      winType,
      playerOfMatch,
    };

    const registry = {};
    if (info.registry && info.registry.people) {
      for (const [name, id] of Object.entries(info.registry.people)) {
        registry[name] = id;
      }
    }

    const playerStatsMap = {};

    const getOrCreate = (playerName, team) => {
      const key = `${playerName}|${team}`;
      if (!playerStatsMap[key]) {
        playerStatsMap[key] = {
          playerName,
          cricsheetId: registry[playerName] || null,
          team,
          season,
          runsScored: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
          dismissalKind: null,
          oversBowled: 0,
          runsConceded: 0,
          wickets: 0,
          maidens: 0,
          dotBalls: 0,
          wides: 0,
          noBalls: 0,
          catches: 0,
          stumpings: 0,
          runOuts: 0,
        };
      }
      return playerStatsMap[key];
    };

    for (const inning of innings) {
      const battingTeam = inning.team;

      const bowlingTeam = battingTeam === team1 ? team2 : team1;
      const overs = inning.overs || [];

      for (const overData of overs) {
        const overNumber = overData.over;
        const deliveries = overData.deliveries || [];
        let legalBallsInOver = 0;

        for (const delivery of deliveries) {
          const batter = delivery.batter;
          const bowler = delivery.bowler;
          const runs = delivery.runs || {};
          const extras = delivery.extras || {};

          const batterStats = getOrCreate(batter, battingTeam);
          const isWide = extras.wides !== undefined;
          const isNoBall = extras.noballs !== undefined;

          if (!isWide) {
            batterStats.ballsFaced += 1;
            batterStats.runsScored += runs.batter || 0;
          } else {
            batterStats.runsScored += runs.batter || 0;
          }

          if (runs.batter === 4) batterStats.fours += 1;
          if (runs.batter === 6) batterStats.sixes += 1;

          const bowlerStats = getOrCreate(bowler, bowlingTeam);
          const totalRunsOnBall = runs.total || 0;
          bowlerStats.runsConceded += totalRunsOnBall - (extras.legbyes || 0) - (extras.byes || 0);

          if (isWide) {
            bowlerStats.wides += 1;
          } else if (isNoBall) {
            bowlerStats.noBalls += 1;
          } else {
            legalBallsInOver += 1;
            if (totalRunsOnBall === 0) {
              bowlerStats.dotBalls += 1;
            }
          }

          if (delivery.wickets) {
            for (const wicket of delivery.wickets) {
              const playerOut = wicket.player_out;
              const kind = wicket.kind;

              const outStats = getOrCreate(playerOut, battingTeam);
              outStats.isOut = true;
              outStats.dismissalKind = kind;

              if (
                ['bowled', 'caught', 'lbw', 'stumped', 'caught and bowled', 'hit wicket'].includes(
                  kind
                )
              ) {
                bowlerStats.wickets += 1;
              }

              if (wicket.fielders) {
                for (const fielder of wicket.fielders) {
                  const fielderName = fielder.name || fielder;
                  if (typeof fielderName === 'string') {
                    const fielderStats = getOrCreate(fielderName, bowlingTeam);
                    if (kind === 'caught' || kind === 'caught and bowled') {
                      fielderStats.catches += 1;
                    } else if (kind === 'stumped') {
                      fielderStats.stumpings += 1;
                    } else if (kind === 'run out') {
                      fielderStats.runOuts += 1;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const bowlerBallCount = {};
    for (const inning of innings) {
      const battingTeam = inning.team;
      const bowlingTeam = battingTeam === team1 ? team2 : team1;

      for (const overData of inning.overs || []) {
        const deliveries = overData.deliveries || [];
        for (const delivery of deliveries) {
          const bowler = delivery.bowler;
          const extras = delivery.extras || {};
          const isWide = extras.wides !== undefined;
          const isNoBall = extras.noballs !== undefined;

          const key = `${bowler}|${bowlingTeam}`;
          if (!bowlerBallCount[key]) bowlerBallCount[key] = 0;
          if (!isWide && !isNoBall) {
            bowlerBallCount[key] += 1;
          }
        }
      }
    }

    for (const [key, balls] of Object.entries(bowlerBallCount)) {
      if (playerStatsMap[key]) {
        const fullOvers = Math.floor(balls / 6);
        const remainingBalls = balls % 6;
        playerStatsMap[key].oversBowled = fullOvers + remainingBalls / 10;
      }
    }

    const playerStats = Object.values(playerStatsMap);

    return { match, playerStats };
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err.message);
    return null;
  }
}

export const TEAM_NAME_MAP = {
  'Mumbai Indians': 'MI',
  'Chennai Super Kings': 'CSK',
  'Royal Challengers Bangalore': 'RCB',
  'Royal Challengers Bengaluru': 'RCB',
  'Kolkata Knight Riders': 'KKR',
  'Delhi Capitals': 'DC',
  'Delhi Daredevils': 'DC',
  'Punjab Kings': 'PBKS',
  'Kings XI Punjab': 'PBKS',
  'Rajasthan Royals': 'RR',
  'Sunrisers Hyderabad': 'SRH',
  'Deccan Chargers': 'SRH',
  'Gujarat Titans': 'GT',
  'Lucknow Super Giants': 'LSG',
  'Rising Pune Supergiant': 'RPS',
  'Rising Pune Supergiants': 'RPS',
  'Gujarat Lions': 'GL',
  'Pune Warriors India': 'PWI',
  'Kochi Tuskers Kerala': 'KTK',
};

export function toShortName(fullName) {
  return TEAM_NAME_MAP[fullName] || fullName;
}
