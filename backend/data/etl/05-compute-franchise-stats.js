import { PrismaClient } from '@prisma/client';
import Logger from './utils/logger.js';

const prisma = new PrismaClient();
const log = new Logger('05-franchise-stats');

async function main() {
  log.info('Computing franchise season stats...');

  const franchises = await prisma.franchise.findMany();
  const seasons = await prisma.match.findMany({
    select: { season: true },
    distinct: ['season'],
    orderBy: { season: 'asc' },
  });

  const seasonList = seasons.map((s) => s.season);
  log.info(`Seasons: ${seasonList.join(', ')}`);

  let count = 0;
  const total = franchises.length * seasonList.length;

  for (const franchise of franchises) {
    for (const season of seasonList) {
      const matchesAsTeam1 = await prisma.match.findMany({
        where: { season, team1: franchise.shortName },
      });
      const matchesAsTeam2 = await prisma.match.findMany({
        where: { season, team2: franchise.shortName },
      });

      const allMatches = [...matchesAsTeam1, ...matchesAsTeam2];
      const matchesPlayed = allMatches.length;

      if (matchesPlayed === 0) {
        count++;
        continue;
      }

      const matchesWon = allMatches.filter((m) => m.winner === franchise.shortName).length;
      const matchesLost = matchesPlayed - matchesWon;

      const auctionEntries = await prisma.auctionEntry.findMany({
        where: { franchiseId: franchise.id, season },
      });

      const totalSpent = auctionEntries.reduce((sum, e) => sum + (e.soldPrice || 0), 0);
      const playersBought = auctionEntries.filter(
        (e) => e.status === 'Sold' || e.status === 'RTM'
      ).length;
      const playersRetained = auctionEntries.filter((e) => e.isRetained).length;

      const isChampion = franchise.titleYears.includes(season);

      let finalPosition = null;
      if (isChampion) finalPosition = 1;

      await prisma.franchiseSeasonStats.upsert({
        where: {
          franchiseId_season: { franchiseId: franchise.id, season },
        },
        update: {
          totalSpent,
          playersBought,
          playersRetained,
          matchesPlayed,
          matchesWon,
          matchesLost,
          finalPosition,
          isChampion,
        },
        create: {
          franchiseId: franchise.id,
          season,
          totalSpent,
          playersBought,
          playersRetained,
          matchesPlayed,
          matchesWon,
          matchesLost,
          finalPosition,
          isChampion,
        },
      });

      count++;
      if (count % 20 === 0 || count === total) {
        log.progress(count, total, 'franchise-seasons');
      }
    }
  }

  log.success(`Computed ${count} franchise season stat records`);
  log.done();
}

main()
  .catch((e) => {
    log.error('Failed', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
