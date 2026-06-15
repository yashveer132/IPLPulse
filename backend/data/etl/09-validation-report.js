import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function validate() {
  console.log('='.repeat(70));
  console.log('🔍 IPLPulse — Full Database Validation Report');
  console.log('='.repeat(70));
  console.log(`Generated at: ${new Date().toISOString()}\n`);

  console.log('📊 CORE ENTITY COUNTS');
  console.log('-'.repeat(50));
  const players = await prisma.player.count();
  const franchises = await prisma.franchise.count();
  const auctionEntries = await prisma.auctionEntry.count();
  const matches = await prisma.match.count();
  const playerMatchStats = await prisma.playerMatchStats.count();
  const playerSeasonStats = await prisma.playerSeasonStats.count();
  const franchiseSeasonStats = await prisma.franchiseSeasonStats.count();
  console.log(`  Players:              ${players}`);
  console.log(`  Franchises:           ${franchises}`);
  console.log(`  Auction Entries:      ${auctionEntries}`);
  console.log(`  Matches:              ${matches}`);
  console.log(`  Player Match Stats:   ${playerMatchStats}`);
  console.log(`  Player Season Stats:  ${playerSeasonStats}`);
  console.log(`  Franchise Season Stats: ${franchiseSeasonStats}`);

  console.log('\n📈 ANALYTICS TABLES');
  console.log('-'.repeat(50));
  const franchiseAnalytics = await prisma.franchiseAnalytics.count();
  const playerAnalytics = await prisma.playerAnalytics.count();
  const headToHead = await prisma.headToHeadStat.count();
  const venueMastery = await prisma.venueMasteryStat.count();
  const crazyStats = await prisma.playerCrazyStats.count();
  console.log(`  Franchise Analytics:  ${franchiseAnalytics}`);
  console.log(`  Player Analytics:     ${playerAnalytics}`);
  console.log(`  Head-to-Head Stats:   ${headToHead}`);
  console.log(`  Venue Mastery Stats:  ${venueMastery}`);
  console.log(`  Player Crazy Stats:   ${crazyStats}`);

  console.log('\n🏟️  FRANCHISES');
  console.log('-'.repeat(50));
  const allFranchises = await prisma.franchise.findMany({ orderBy: { name: 'asc' }, select: { name: true, shortName: true, titles: true } });
  allFranchises.forEach(f => console.log(`  ${f.shortName.padEnd(5)} ${f.name.padEnd(30)} Titles: ${f.titles}`));

  console.log('\n📅 SEASON COVERAGE');
  console.log('-'.repeat(50));
  const seasons = await prisma.playerSeasonStats.groupBy({ by: ['season'], _count: { id: true }, orderBy: { season: 'asc' } });
  seasons.forEach(s => console.log(`  ${s.season}: ${s._count.id} player-season records`));

  console.log('\n🏏 TOP 10 PLAYERS BY CAREER MATCHES');
  console.log('-'.repeat(50));
  const topPlayers = await prisma.player.findMany({
    take: 10,
    orderBy: { matchStats: { _count: 'desc' } },
    select: { name: true, role: true, nationality: true, _count: { select: { matchStats: true } } }
  });
  topPlayers.forEach((p, i) => console.log(`  ${(i+1).toString().padEnd(3)} ${p.name.padEnd(25)} ${p.role.padEnd(15)} ${p.nationality.padEnd(10)} ${p._count.matchStats} matches`));

  console.log('\n🤝 HEAD-TO-HEAD SAMPLE RECORDS');
  console.log('-'.repeat(50));
  const h2hSamples = await prisma.headToHeadStat.findMany({
    take: 5,
    orderBy: { ballsFaced: 'desc' },
    include: { batter: { select: { name: true } }, bowler: { select: { name: true } } }
  });
  h2hSamples.forEach(h => {
    console.log(`  ${h.batter.name} vs ${h.bowler.name}: ${h.runsScored} runs, ${h.ballsFaced} balls, ${h.dismissals} dismissals, SR ${h.strikeRate.toFixed(1)}`);
  });

  console.log('\n🏟️  VENUE MASTERY SAMPLE (Top 5 by runs)');
  console.log('-'.repeat(50));
  const venueSamples = await prisma.venueMasteryStat.findMany({
    take: 5,
    orderBy: { runsScored: 'desc' },
    include: { player: { select: { name: true } } }
  });
  venueSamples.forEach(v => {
    console.log(`  ${v.player.name} @ ${v.venue}: ${v.runsScored} runs, ${v.wickets} wkts`);
  });

  console.log('\n🔥 CRAZY STATS SAMPLE (Top 5 death-over batters)');
  console.log('-'.repeat(50));
  const crazySamples = await prisma.playerCrazyStats.findMany({
    take: 5,
    orderBy: { deathOversRunsScored: 'desc' },
    include: { player: { select: { name: true } } }
  });
  crazySamples.forEach(c => {
    const sr = c.deathOversBallsFaced > 0 ? ((c.deathOversRunsScored / c.deathOversBallsFaced) * 100).toFixed(1) : 0;
    console.log(`  ${c.player.name}: ${c.deathOversRunsScored} death runs (SR ${sr}), ${c.powerplayWickets} PP wkts`);
  });

  console.log('\n✅ DATA INTEGRITY CHECKS');
  console.log('-'.repeat(50));
  const orphanH2H = await prisma.headToHeadStat.count({ where: { batter: null } });
  const orphanVenue = await prisma.venueMasteryStat.count({ where: { player: null } });
  console.log(`  Orphan H2H records (no batter):   ${orphanH2H === 0 ? '✅ PASS (0)' : '❌ FAIL (' + orphanH2H + ')'}`);
  console.log(`  Orphan Venue records (no player):  ${orphanVenue === 0 ? '✅ PASS (0)' : '❌ FAIL (' + orphanVenue + ')'}`);
  console.log(`  Players > 0:                       ${players > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Matches > 0:                       ${matches > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  H2H > 0:                           ${headToHead > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Venue Mastery > 0:                 ${venueMastery > 0 ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n' + '='.repeat(70));
  console.log('🎉 Validation Report Complete!');
  console.log('='.repeat(70));

  await prisma.$disconnect();
}

validate().catch(e => { console.error(e); process.exit(1); });
