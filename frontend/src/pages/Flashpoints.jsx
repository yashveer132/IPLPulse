import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import api from "../api/apiClient.js";
import PageHeader from "../components/common/PageHeader.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const collectionColors = [
  {
    main: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.02)",
    bgHover: "rgba(139, 92, 246, 0.06)",
    border: "rgba(139, 92, 246, 0.12)",
    selected: "rgba(139, 92, 246, 0.15)",
  },
  {
    main: "#ef4444",
    bg: "rgba(239, 68, 68, 0.02)",
    bgHover: "rgba(239, 68, 68, 0.06)",
    border: "rgba(239, 68, 68, 0.12)",
    selected: "rgba(239, 68, 68, 0.15)",
  },
  {
    main: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.02)",
    bgHover: "rgba(59, 130, 246, 0.06)",
    border: "rgba(59, 130, 246, 0.12)",
    selected: "rgba(59, 130, 246, 0.15)",
  },
  {
    main: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.02)",
    bgHover: "rgba(245, 158, 11, 0.06)",
    border: "rgba(245, 158, 11, 0.12)",
    selected: "rgba(245, 158, 11, 0.15)",
  },
  {
    main: "#10b981",
    bg: "rgba(16, 185, 129, 0.02)",
    bgHover: "rgba(16, 185, 129, 0.06)",
    border: "rgba(16, 185, 129, 0.12)",
    selected: "rgba(16, 185, 129, 0.15)",
  },
  {
    main: "#ec4899",
    bg: "rgba(236, 72, 153, 0.02)",
    bgHover: "rgba(236, 72, 153, 0.06)",
    border: "rgba(236, 72, 153, 0.12)",
    selected: "rgba(236, 72, 153, 0.15)",
  },
  {
    main: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.02)",
    bgHover: "rgba(6, 182, 212, 0.06)",
    border: "rgba(6, 182, 212, 0.12)",
    selected: "rgba(6, 182, 212, 0.15)",
  },
  {
    main: "#14b8a6",
    bg: "rgba(20, 184, 166, 0.02)",
    bgHover: "rgba(20, 184, 166, 0.06)",
    border: "rgba(20, 184, 166, 0.12)",
    selected: "rgba(20, 184, 166, 0.15)",
  },
];

const getSeverityLabel = (fp) => {
  if (fp.tier === "S")
    return { label: "Tier S: Changed IPL History", color: "error" };
  if (fp.tier === "A")
    return { label: "Tier A: Major Event", color: "warning" };
  if (fp.tier === "B")
    return { label: "Tier B: Significant Story", color: "info" };
  return { label: "Tier C: Notable Incident", color: "default" };
};

const Flashpoints = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [flashpoints, setFlashpoints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedTier, setSelectedTier] = useState("All");
  const archiveRef = useRef(null);

  const handleCollectionClick = (theme) => {
    setSelectedCollection(selectedCollection === theme ? null : theme);
    setTimeout(() => {
      archiveRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fpRes, analyticsRes, collRes] = await Promise.all([
          api.get("/flashpoints"),
          api.get("/flashpoints/analytics"),
          api.get("/flashpoints/collections"),
        ]);
        setFlashpoints(fpRes || []);
        setAnalytics(analyticsRes || {});
        setCollections(collRes || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load flashpoints", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <PageLoader
        fullscreen={false}
        title="Historical Archive"
        message="Retrieving key milestones, eras, and defining moments..."
      />
    );

  const {
    definingMoment = null,
    shockTimeline = [],
    eras = {},
    mostChaoticEra = null,
    categoryBreakdown = [],
  } = analytics || {};

  const areaData = (shockTimeline || []).map((stat) => ({
    year: stat.year,
    Governance: stat.categories["Governance"] || 0,
    Ownership: stat.categories["Ownership"] || 0,
    PlayerConflicts:
      (stat.categories["Player Conflicts"] || 0) +
      (stat.categories["Player Conduct"] || 0),
    BettingFixing: stat.categories["Betting & Fixing"] || 0,
    TeamManagement: stat.categories["Team Management"] || 0,
    FranchiseStructure: stat.categories["Franchise Structure"] || 0,
    RuleChanges:
      (stat.categories["Rule Changes"] || 0) +
      (stat.categories["League Rules"] || 0),
    Triumphs: stat.categories["Triumphs"] || 0,
    BusinessBroadcasting:
      (stat.categories["Business & Broadcasting"] || 0) +
      (stat.categories["Business"] || 0),
    Legal: stat.categories["Legal"] || 0,
    Umpiring: stat.categories["Umpiring"] || 0,
    SpiritOfCricket: stat.categories["Spirit of Cricket"] || 0,
    CovidBioBubble: stat.categories["Covid/Bio Bubble"] || 0,
    Franchise: stat.categories["Franchise"] || 0,
  }));

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        pt: 0,
        pb: 4,
        px: { xs: 0, sm: 1, md: 2 },
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <PageHeader
        title="Historical Archive"
        subtitle="Chronology of key events and milestone moments in IPL history"
      />

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              minHeight: 520,
              borderRadius: 4,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{ mb: 2, fontWeight: 700 }}
            >
              Category Evolution
            </Typography>
            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                pb: 1,
                "&::-webkit-scrollbar": { height: 6 },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "rgba(255,255,255,0.02)",
                  borderRadius: 3,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(255,255,255,0.12)",
                  borderRadius: 3,
                },
              }}
            >
              <Box sx={{ minWidth: { xs: 750, md: "100%" }, height: 420 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={areaData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="year"
                      interval={isMobile ? "preserveStartEnd" : 0}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 50 : 30}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e1e1e",
                        border: "none",
                        borderRadius: 8,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="BettingFixing"
                      name="Betting & Fixing"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                    />
                    <Area
                      type="monotone"
                      dataKey="Governance"
                      name="Governance"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                    />
                    <Area
                      type="monotone"
                      dataKey="Ownership"
                      name="Ownership"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                    />
                    <Area
                      type="monotone"
                      dataKey="PlayerConflicts"
                      name="Player Conflicts & Conduct"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                    />
                    <Area
                      type="monotone"
                      dataKey="TeamManagement"
                      name="Team Management"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                    />
                    <Area
                      type="monotone"
                      dataKey="FranchiseStructure"
                      name="Franchise Structure"
                      stackId="1"
                      stroke="#ec4899"
                      fill="#ec4899"
                    />
                    <Area
                      type="monotone"
                      dataKey="RuleChanges"
                      name="Rule Changes & League Rules"
                      stackId="1"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                    />
                    <Area
                      type="monotone"
                      dataKey="Triumphs"
                      name="Triumphs"
                      stackId="1"
                      stroke="#f43f5e"
                      fill="#f43f5e"
                    />
                    <Area
                      type="monotone"
                      dataKey="BusinessBroadcasting"
                      name="Business & Broadcasting"
                      stackId="1"
                      stroke="#84cc16"
                      fill="#84cc16"
                    />
                    <Area
                      type="monotone"
                      dataKey="Legal"
                      name="Legal"
                      stackId="1"
                      stroke="#00acc1"
                      fill="#00acc1"
                    />
                    <Area
                      type="monotone"
                      dataKey="Umpiring"
                      name="Umpiring"
                      stackId="1"
                      stroke="#d81b60"
                      fill="#d81b60"
                    />
                    <Area
                      type="monotone"
                      dataKey="SpiritOfCricket"
                      name="Spirit of Cricket"
                      stackId="1"
                      stroke="#ffb300"
                      fill="#ffb300"
                    />
                    <Area
                      type="monotone"
                      dataKey="CovidBioBubble"
                      name="Covid / Bio Bubble"
                      stackId="1"
                      stroke="#00b0ff"
                      fill="#00b0ff"
                    />
                    <Area
                      type="monotone"
                      dataKey="Franchise"
                      name="Franchise"
                      stackId="1"
                      stroke="#3f51b5"
                      fill="#3f51b5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4 }}>
        Curated Collections
      </Typography>
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {collections.map((coll, i) => {
          const colors = collectionColors[i % collectionColors.length];
          const isSelected = selectedCollection === coll.theme;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Paper
                onClick={() => handleCollectionClick(coll.theme)}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  bgcolor: isSelected
                    ? "rgba(255,255,255,0.08)"
                    : "background.paper",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderTop: `6px solid ${colors.main}`,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: colors.main,
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px ${colors.main}22`,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    color: isSelected ? colors.main : "inherit",
                  }}
                >
                  {coll.theme}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {coll.events.length} Events
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                    justifyContent: "center",
                    maxWidth: "100%",
                    width: "100%",
                  }}
                >
                  {coll.events.slice(0, 3).map((e, idx) => (
                    <Chip
                      key={idx}
                      label={e.title}
                      size="small"
                      sx={{
                        fontSize: "0.78rem",
                        maxWidth: "100%",
                        bgcolor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        "& .MuiChip-label": {
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Box
        ref={archiveRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
          gap: 2,
        }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 800 }}>
          {selectedCollection
            ? `The Archive: ${selectedCollection}`
            : "The Archive Timeline"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["All", "S", "A", "B", "C"].map((tier) => (
            <Button
              key={tier}
              variant={selectedTier === tier ? "contained" : "outlined"}
              color={
                tier === "S"
                  ? "error"
                  : tier === "A"
                    ? "warning"
                    : tier === "B"
                      ? "info"
                      : "primary"
              }
              onClick={() => setSelectedTier(tier)}
              size="small"
              sx={{ fontWeight: "bold" }}
            >
              {tier === "All" ? "All Tiers" : `Tier ${tier}`}
            </Button>
          ))}
          {selectedCollection && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setSelectedCollection(null)}
              size="small"
              sx={{ ml: 2 }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>
      <Grid container spacing={3}>
        {(() => {
          const filtered = (flashpoints || [])
            .filter(
              (fp) =>
                !selectedCollection ||
                collections
                  .find((c) => c.theme === selectedCollection)
                  ?.events?.some((e) => e.id === fp.id),
            )
            .filter((fp) => selectedTier === "All" || fp.tier === selectedTier);

          if (filtered.length === 0) {
            return (
              <Grid size={{ xs: 12 }}>
                <Paper
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: 4,
                    border: "1px dashed rgba(255, 255, 255, 0.1)",
                    bgcolor: "rgba(255,255,255,0.01)",
                  }}
                >
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    No Records Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    There are no incidents in the database matching your current
                    collection or tier criteria.
                  </Typography>
                </Paper>
              </Grid>
            );
          }

          return filtered.map((fp, idx) => {
            const { label, color } = getSeverityLabel(fp);
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fp.id}>
                <Paper
                  component={Link}
                  to={`/flashpoints/${fp.id}`}
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 2,
                    height: "100%",
                    minHeight: 280,
                    borderRadius: 3,
                    borderTop: "6px solid",
                    borderColor: `${color}.main`,
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "translateY(-4px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 900, color: "text.secondary" }}
                    >
                      {fp.year}
                    </Typography>
                    <Chip label={label} color={color} size="small" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={fp.category}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}
                    >
                      {fp.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {fp.shortSummary}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          });
        })()}
      </Grid>
    </Box>
  );
};

export default Flashpoints;
