import { getPrisma } from "../config/index.js";
import { buildSearchCondition } from "../utils/searchHelpers.js";

export async function getAuctionEntries({
  season,
  team,
  role,
  nationality: reqNationality,
  status,
  minPrice,
  maxPrice,
  search,
  quickFilter,
  page = 1,
  limit = 25,
  sortBy = "soldPrice",
  sortOrder = "desc",
}) {
  const prisma = await getPrisma();
  const parsedLimit = parseInt(limit, 10) || 25;
  const parsedPage = parseInt(page, 10) || 1;
  const skip = (parsedPage - 1) * parsedLimit;

  const where = {};

  if (season) where.season = parseInt(season, 10);
  if (team) {
    where.franchise = { shortName: team };
  }
  if (status) where.status = status;

  if (role) {
    where.role = role;
  }

  if (search || reqNationality) {
    where.player = {};
    if (reqNationality) where.player.nationality = reqNationality;

    if (search) {
      Object.assign(where.player, buildSearchCondition(search));
    }
  }

  if (minPrice || maxPrice) {
    where.soldPrice = {};
    if (minPrice) where.soldPrice.gte = parseFloat(minPrice);
    if (maxPrice) where.soldPrice.lte = parseFloat(maxPrice);
  }

  if (quickFilter) {
    if (quickFilter === "multiple_appearances") {
      const grouped = await prisma.auctionEntry.groupBy({
        by: ["playerId"],
        having: { playerId: { _count: { gt: 1 } } },
      });
      where.playerId = { in: grouped.map((g) => g.playerId) };
    } else if (quickFilter === "counts>2") {
      const grouped = await prisma.auctionEntry.groupBy({
        by: ["playerId"],
        having: { playerId: { _count: { gt: 2 } } },
      });
      where.playerId = { in: grouped.map((g) => g.playerId) };
    } else if (quickFilter === "counts>3") {
      const grouped = await prisma.auctionEntry.groupBy({
        by: ["playerId"],
        having: { playerId: { _count: { gt: 3 } } },
      });
      where.playerId = { in: grouped.map((g) => g.playerId) };
    } else if (quickFilter === "high_rollers") {
      where.soldPrice = { ...where.soldPrice, gt: 1000 };
    }
  }

  const validSortFields = ["soldPrice", "basePrice", "season"];
  const orderField = validSortFields.includes(sortBy) ? sortBy : "soldPrice";
  const orderDir = sortOrder === "asc" ? "asc" : "desc";

  const [entries, total] = await Promise.all([
    prisma.auctionEntry.findMany({
      where,
      skip,
      take: parsedLimit,
      orderBy: { [orderField]: orderDir },
      include: {
        player: {
          select: { id: true, name: true, role: true, nationality: true },
        },
        franchise: {
          select: { id: true, name: true, shortName: true, color: true },
        },
      },
    }),
    prisma.auctionEntry.count({ where }),
  ]);

  return {
    entries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAuctionSeasons() {
  const prisma = await getPrisma();
  const seasons = await prisma.auctionEntry.findMany({
    select: { season: true },
    distinct: ["season"],
    orderBy: { season: "desc" },
  });

  return seasons.map((s) => s.season);
}

export async function getSearchSuggestions(query) {
  if (!query || query.length < 2) return [];
  const prisma = await getPrisma();

  const suggestions = await prisma.player.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      auctionEntries: { some: {} },
    },
    select: { name: true },
    distinct: ["name"],
    take: 10,
    orderBy: { name: "asc" },
  });

  return suggestions.map((s) => s.name);
}
