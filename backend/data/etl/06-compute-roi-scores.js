import { PrismaClient } from '@prisma/client';
import Logger from './utils/logger.js';

const prisma = new PrismaClient();
const log = new Logger('06-roi-scores');

function computePerformanceScore(stats) {
  let score = 0;

  score += stats.totalRuns * 1.0;

  score += stats.totalWickets * 25;

  score += stats.catches * 8;
  score += stats.stumpings * 12;

  score += stats.playerOfMatch * 50;

  if (stats.innings >= 3 && stats.totalRuns > 50) {
    if (stats.strikeRate > 150) score += 20;
    else if (stats.strikeRate > 140) score += 10;
  }

  if (stats.totalWickets >= 3) {
    if (stats.economyRate > 0 && stats.economyRate < 7.0) score += 20;
    else if (stats.economyRate > 0 && stats.economyRate < 8.0) score += 10;
  }

  return Math.round(score * 100) / 100;
}

async function main() {
  log.info('Computing ROI scores...');

  log.info('Step 1: Player performance scores...');

  const allSeasonStats = await prisma.playerSeasonStats.findMany();
  log.info(`  Processing ${allSeasonStats.length} player-season records`);

  const BATCH_SIZE = 500;
  for (let i = 0; i < allSeasonStats.length; i += BATCH_SIZE) {
    const batch = allSeasonStats.slice(i, i + BATCH_SIZE);

    const updatePromises = batch.map((stats) => {
      const performanceScore = computePerformanceScore(stats);
      return prisma.playerSeasonStats.update({
        where: { id: stats.id },
        data: { performanceScore },
      });
    });

    await prisma.$transaction(updatePromises);
    log.progress(
      Math.min(i + BATCH_SIZE, allSeasonStats.length),
      allSeasonStats.length,
      'player scores batched'
    );
  }

  log.info('Step 2: Franchise ROI scores...');

  const franchiseStats = await prisma.franchiseSeasonStats.findMany({
    include: { franchise: true },
  });

  for (let i = 0; i < franchiseStats.length; i++) {
    const fs = franchiseStats[i];

    const spentInCrores = fs.totalSpent / 100;
    const spendEfficiency =
      spentInCrores > 0 ? Math.round((fs.matchesWon / spentInCrores) * 100) / 100 : 0;

    const winPct = fs.matchesPlayed > 0 ? (fs.matchesWon / fs.matchesPlayed) * 100 : 0;
    const titleBonus = fs.isChampion ? 100 : 0;

    const normalizedSpendEff = Math.min(spendEfficiency * 10, 100);

    const totalPlayers = fs.playersBought + fs.playersRetained;
    const retentionPct = totalPlayers > 0 ? (fs.playersRetained / totalPlayers) * 100 : 50;

    const roiScore = Math.round(
      winPct * 0.4 + titleBonus * 0.2 + normalizedSpendEff * 0.2 + retentionPct * 0.2
    );

    await prisma.franchiseSeasonStats.update({
      where: { id: fs.id },
      data: { roiScore, spendEfficiency },
    });

    if ((i + 1) % 20 === 0 || i === franchiseStats.length - 1) {
      log.progress(i + 1, franchiseStats.length, 'franchise scores');
    }
  }

  log.success('ROI scores computed successfully');
  log.done();
}

main()
  .catch((e) => {
    log.error('Failed', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
