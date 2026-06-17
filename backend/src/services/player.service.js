import { getPrisma } from "../config/index.js";
import { buildSearchCondition } from "../utils/searchHelpers.js";

export async function getPlayers({
  search,
  role,
  nationality,
  page = 1,
  limit = 20,
}) {
  const prisma = await getPrisma();
  const skip = (page - 1) * limit;

  const where = {};
  if (search) {
    Object.assign(where, buildSearchCondition(search));
  }
  if (role) {
    where.role = role;
  }
  if (nationality) {
    where.nationality = nationality;
  }

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { auctionEntries: true, matchStats: true },
        },
      },
    }),
    prisma.player.count({ where }),
  ]);

  return {
    players,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPlayerById(id) {
  const prisma = await getPrisma();

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      seasonStats: {
        orderBy: { season: "asc" },
      },
      auctionEntries: {
        orderBy: { season: "asc" },
        include: {
          franchise: {
            select: { name: true, shortName: true, color: true },
          },
        },
      },
    },
  });

  if (!player) return null;

  const career = {
    totalMatches: player.seasonStats.reduce((s, st) => s + st.matches, 0),
    totalRuns: player.seasonStats.reduce((s, st) => s + st.totalRuns, 0),
    totalWickets: player.seasonStats.reduce((s, st) => s + st.totalWickets, 0),
    totalCatches: player.seasonStats.reduce((s, st) => s + st.catches, 0),
    totalStumpings: player.seasonStats.reduce((s, st) => s + st.stumpings, 0),
    totalPom: player.seasonStats.reduce((s, st) => s + st.playerOfMatch, 0),
    totalFifties: player.seasonStats.reduce((s, st) => s + st.fifties, 0),
    totalHundreds: player.seasonStats.reduce((s, st) => s + st.hundreds, 0),
    totalFours: player.seasonStats.reduce((s, st) => s + st.fours, 0),
    totalSixes: player.seasonStats.reduce((s, st) => s + st.sixes, 0),
    seasonsPlayed: player.seasonStats.length,
    teamsPlayedFor: [...new Set(player.seasonStats.map((s) => s.team))],
    highestScore: Math.max(...player.seasonStats.map((s) => s.highestScore), 0),
    bestBowling:
      player.seasonStats
        .map((s) => s.bestBowling)
        .filter(Boolean)
        .sort((a, b) => {
          const [wA] = a.split("/").map(Number);
          const [wB] = b.split("/").map(Number);
          return wB - wA;
        })[0] || null,
  };

  return { ...player, career };
}

export async function getPlayerStats(playerId) {
  const prisma = await getPrisma();
  return prisma.playerSeasonStats.findMany({
    where: { playerId },
    orderBy: { season: "desc" },
  });
}

export async function getPlayerAuctionHistory(playerId) {
  const prisma = await getPrisma();
  return prisma.auctionEntry.findMany({
    where: { playerId },
    orderBy: { season: "asc" },
    include: {
      franchise: {
        select: { name: true, shortName: true, color: true },
      },
    },
  });
}
