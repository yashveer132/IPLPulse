import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getFlashpoints = async (req, res) => {
  try {
    const flashpoints = await prisma.flashpoint.findMany({
      orderBy: { year: "asc" },
      include: {
        outgoingRelationships: {
          include: {
            target: { select: { id: true, title: true, legacyScore: true } },
          },
        },
        incomingRelationships: {
          include: {
            source: { select: { id: true, title: true, legacyScore: true } },
          },
        },
      },
    });
    res.json({ success: true, data: flashpoints });
  } catch (error) {
    console.error("Error fetching flashpoints:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getFlashpointById = async (req, res) => {
  try {
    const flashpoint = await prisma.flashpoint.findUnique({
      where: { id: req.params.id },
      include: {
        outgoingRelationships: {
          include: {
            target: {
              select: { id: true, title: true, legacyScore: true, year: true },
            },
          },
        },
        incomingRelationships: {
          include: {
            source: {
              select: { id: true, title: true, legacyScore: true, year: true },
            },
          },
        },
        entities: {
          include: { entity: true },
        },
      },
    });
    if (!flashpoint)
      return res.status(404).json({ success: false, message: "Not Found" });
    res.json({ success: true, data: flashpoint });
  } catch (error) {
    console.error("Error fetching flashpoint:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getFlashpointGraph = async (req, res) => {
  try {
    const { id } = req.params;

    const allFlashpoints = await prisma.flashpoint.findMany({
      select: {
        id: true,
        title: true,
        legacyScore: true,
        year: true,
        category: true,
        severity: true,
        impactType: true,
      },
    });
    const allRelations = await prisma.flashpointRelationship.findMany();

    const nodes = new Map();
    const edges = [];
    const visited = new Set();
    const queue = [{ id, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      const currentId = current.id;

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const fp = allFlashpoints.find((f) => f.id === currentId);
      if (fp) nodes.set(fp.id, fp);

      if (current.depth >= 2) continue;

      const relatedEdges = allRelations.filter(
        (r) => r.sourceId === currentId || r.targetId === currentId,
      );

      relatedEdges.forEach((rel) => {
        if (!edges.some((e) => e.id === rel.id)) {
          edges.push({
            id: rel.id,
            source: rel.sourceId,
            target: rel.targetId,
            type: rel.relationshipType,
          });
        }
        if (!visited.has(rel.sourceId))
          queue.push({ id: rel.sourceId, depth: current.depth + 1 });
        if (!visited.has(rel.targetId))
          queue.push({ id: rel.targetId, depth: current.depth + 1 });
      });
    }

    const root = allFlashpoints.find((f) => f.id === id);

    const buildDownstream = (currentId, depth) => {
      if (depth >= 2) return [];
      return edges
        .filter((e) => e.source === currentId)
        .map((e) => ({
          ...e,
          node: nodes.get(e.target),
          children: buildDownstream(e.target, depth + 1),
        }));
    };

    const buildUpstream = (currentId, depth) => {
      if (depth >= 2) return [];
      return edges
        .filter((e) => e.target === currentId)
        .map((e) => ({
          ...e,
          node: nodes.get(e.source),
          parents: buildUpstream(e.source, depth + 1),
        }));
    };

    res.json({
      success: true,
      data: {
        root,
        upstream: buildUpstream(id, 0),
        downstream: buildDownstream(id, 0),
        nodes: Array.from(nodes.values()),
        edges,
      },
    });
  } catch (error) {
    console.error("Error fetching flashpoint graph:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getFlashpointAnalytics = async (req, res) => {
  try {
    const flashpoints = await prisma.flashpoint.findMany({
      orderBy: { legacyScore: "desc" },
    });

    const totalIncidents = flashpoints.length;
    const mostInfluentialEvents = flashpoints.slice(0, 10);
    const definingMoment = flashpoints[0];

    const eras = {
      "2008-2012": 0,
      "2013-2017": 0,
      "2018-2022": 0,
      "2023-2026": 0,
    };

    const categoryCounts = {};
    const yearStats = {};

    if (flashpoints.length > 0) {
      const minYear = Math.min(...flashpoints.map((fp) => fp.year));
      const maxYear = Math.max(...flashpoints.map((fp) => fp.year));
      for (let y = minYear; y <= maxYear; y++) {
        yearStats[y] = { year: y, totalShock: 0, categories: {} };
      }
    }

    flashpoints.forEach((fp) => {
      if (fp.year <= 2012) eras["2008-2012"] += fp.legacyScore;
      else if (fp.year <= 2017) eras["2013-2017"] += fp.legacyScore;
      else if (fp.year <= 2022) eras["2018-2022"] += fp.legacyScore;
      else eras["2023-2026"] += fp.legacyScore;

      yearStats[fp.year].totalShock += fp.legacyScore;
      yearStats[fp.year].categories[fp.category] =
        (yearStats[fp.year].categories[fp.category] || 0) + 1;

      categoryCounts[fp.category] = (categoryCounts[fp.category] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalIncidents) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const shockTimeline = Object.values(yearStats).sort(
      (a, b) => a.year - b.year,
    );

    let mostChaoticEra = { name: "", score: 0 };
    Object.entries(eras).forEach(([name, score]) => {
      if (score > mostChaoticEra.score) mostChaoticEra = { name, score };
    });

    const teamCounts = {};
    flashpoints.forEach((fp) => {
      fp.affectedTeams.forEach((team) => {
        if (!teamCounts[team])
          teamCounts[team] = { count: 0, legacyScore: 0, peakYear: fp.year };
        teamCounts[team].count += 1;
        teamCounts[team].legacyScore += fp.legacyScore;
      });
    });
    const topTeams = Object.entries(teamCounts)
      .map(([team, data]) => ({ team, ...data }))
      .sort((a, b) => b.legacyScore - a.legacyScore);

    const playerCounts = {};
    flashpoints.forEach((fp) => {
      fp.affectedPlayers.forEach((player) => {
        if (!playerCounts[player])
          playerCounts[player] = { count: 0, legacyScore: 0 };
        playerCounts[player].count += 1;
        playerCounts[player].legacyScore += fp.legacyScore;
      });
    });
    const topPlayers = Object.entries(playerCounts)
      .map(([player, data]) => ({ player, ...data }))
      .sort((a, b) => b.legacyScore - a.legacyScore);

    res.json({
      success: true,
      data: {
        definingMoment,
        mostInfluentialEvents,
        mostChaoticEra,
        eras,
        shockTimeline,
        categoryBreakdown,
        topTeams,
        topPlayers,
        totalIncidents,
      },
    });
  } catch (error) {
    console.error("Error fetching flashpoint analytics:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const searchFlashpoints = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const results = await prisma.flashpoint.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortSummary: { contains: q, mode: "insensitive" } },
          { fullStory: { contains: q, mode: "insensitive" } },
          { affectedPlayers: { has: q } },
          { affectedTeams: { has: q } },
          { category: { contains: q, mode: "insensitive" } },
          { outcome: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { legacyScore: "desc" },
      include: {
        outgoingRelationships: {
          include: {
            target: { select: { id: true, title: true, legacyScore: true } },
          },
        },
        incomingRelationships: {
          include: {
            source: { select: { id: true, title: true, legacyScore: true } },
          },
        },
      },
    });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error searching flashpoints:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getFlashpointCollections = async (req, res) => {
  try {
    const flashpoints = await prisma.flashpoint.findMany({
      orderBy: { legacyScore: "desc" },
      select: {
        id: true,
        title: true,
        year: true,
        category: true,
        legacyScore: true,
        coverImage: true,
      },
    });

    const collections = {};
    flashpoints.forEach((fp) => {
      if (!collections[fp.category]) {
        collections[fp.category] = {
          theme: fp.category,
          totalScore: 0,
          events: [],
        };
      }
      collections[fp.category].totalScore += fp.legacyScore;
      collections[fp.category].events.push(fp);
    });

    const sortedCollections = Object.values(collections).sort(
      (a, b) => b.totalScore - a.totalScore,
    );

    res.json({ success: true, data: sortedCollections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getPowerNetwork = async (req, res) => {
  try {
    const { filter } = req.query;
    const allowedCategories = filter
      ? filter.split(",")
      : ["Governance", "Corruption"];

    const flashpoints = await prisma.flashpoint.findMany({
      where: filter ? { category: { in: allowedCategories } } : undefined,
      select: { id: true, title: true, tier: true, category: true, year: true },
    });

    const fpIds = flashpoints.map((f) => f.id);

    const fpRels = await prisma.flashpointRelationship.findMany({
      where: {
        sourceId: { in: fpIds },
        targetId: { in: fpIds },
      },
    });

    const entityRels = await prisma.flashpointEntity.findMany({
      where: { flashpointId: { in: fpIds } },
      include: { entity: true },
    });

    const nodesMap = new Map();
    const links = [];

    flashpoints.forEach((fp) => {
      nodesMap.set(fp.id, {
        id: fp.id,
        name: fp.title,
        group: "Event",
        tier: fp.tier,
        category: fp.category,
        year: fp.year,
      });
    });

    fpRels.forEach((rel) => {
      links.push({
        source: rel.sourceId,
        target: rel.targetId,
        label: rel.relationshipType,
      });
    });

    entityRels.forEach((rel) => {
      if (!nodesMap.has(rel.entityId)) {
        nodesMap.set(rel.entityId, {
          id: rel.entityId,
          name: rel.entity.name,
          group: "Entity",
          type: rel.entity.type,
        });
      }

      links.push({
        source: rel.flashpointId,
        target: rel.entityId,
        label: rel.role,
      });
    });

    res.json({
      success: true,
      data: {
        nodes: Array.from(nodesMap.values()),
        links,
      },
    });
  } catch (error) {
    console.error("Error fetching power network:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
