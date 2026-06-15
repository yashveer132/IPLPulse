import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllEntities = async (req, res) => {
  try {
    const entities = await prisma.archiveEntity.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { flashpoints: true },
        },
      },
    });
    res.json({ success: true, data: entities });
  } catch (error) {
    console.error("Error fetching entities:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getEntityById = async (req, res) => {
  try {
    const entity = await prisma.archiveEntity.findUnique({
      where: { id: req.params.id },
      include: {
        flashpoints: {
          include: {
            flashpoint: {
              select: {
                id: true,
                title: true,
                year: true,
                tier: true,
                category: true,
                legacyScore: true,
                historicalSignificance: true,
              },
            },
          },
        },
      },
    });
    if (!entity)
      return res
        .status(404)
        .json({ success: false, message: "Entity not found" });

    entity.flashpoints.sort((a, b) => a.flashpoint.year - b.flashpoint.year);

    res.json({ success: true, data: entity });
  } catch (error) {
    console.error("Error fetching entity:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
