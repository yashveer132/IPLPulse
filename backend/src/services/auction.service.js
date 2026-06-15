import { getPrisma } from '../config/index.js';

export async function getAuctionEntries({
  season,
  team,
  role,
  nationality: reqNationality,
  status,
  minPrice,
  maxPrice,
  search,
  page = 1,
  limit = 25,
  sortBy = 'soldPrice',
  sortOrder = 'desc',
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

  if (role || search || reqNationality) {
    where.player = {};
    if (role) where.player.role = role;
    if (reqNationality) where.player.nationality = reqNationality;
    
    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      if (searchTerms.length > 0) {
        where.player.AND = searchTerms.map(term => ({
          name: { contains: term, mode: 'insensitive' }
        }));
      }
    }
  }

  if (minPrice || maxPrice) {
    where.soldPrice = {};
    if (minPrice) where.soldPrice.gte = parseFloat(minPrice);
    if (maxPrice) where.soldPrice.lte = parseFloat(maxPrice);
  }

  const validSortFields = ['soldPrice', 'basePrice', 'season'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'soldPrice';
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

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
    distinct: ['season'],
    orderBy: { season: 'desc' },
  });

  return seasons.map((s) => s.season);
}
