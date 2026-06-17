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

  if (loading) return <PageLoader />;

  const {
    definingMoment,
    shockTimeline,
    eras,
    mostChaoticEra,
    categoryBreakdown,
  } = analytics;

  const areaData = shockTimeline.map((stat) => ({
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
      sx={{
        py: 4,
        px: { xs: 2, md: 4, lg: 6 },
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <PageHeader
        title="The Legendary Archive"
        subtitle="Cricket's Most Comprehensive Knowledge Graph of Scandals & Flashpoints"
      />

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 4, height: 480, borderRadius: 4 }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>
              Category Evolution
            </Typography>
            <Box sx={{ width: "100%", height: 380, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
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
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="BettingFixing"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                  />
                  <Area
                    type="monotone"
                    dataKey="Governance"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                  />
                  <Area
                    type="monotone"
                    dataKey="Ownership"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                  />
                  <Area
                    type="monotone"
                    dataKey="PlayerConflicts"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                  />
                  <Area
                    type="monotone"
                    dataKey="TeamManagement"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                  />
                  <Area
                    type="monotone"
                    dataKey="FranchiseStructure"
                    stackId="1"
                    stroke="#ec4899"
                    fill="#ec4899"
                  />
                  <Area
                    type="monotone"
                    dataKey="RuleChanges"
                    stackId="1"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                  />
                  <Area
                    type="monotone"
                    dataKey="Triumphs"
                    stackId="1"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                  />
                  <Area
                    type="monotone"
                    dataKey="BusinessBroadcasting"
                    stackId="1"
                    stroke="#84cc16"
                    fill="#84cc16"
                  />
                  <Area
                    type="monotone"
                    dataKey="Legal"
                    stackId="1"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                  />
                  <Area
                    type="monotone"
                    dataKey="Umpiring"
                    stackId="1"
                    stroke="#ec4899"
                    fill="#ec4899"
                  />
                  <Area
                    type="monotone"
                    dataKey="SpiritOfCricket"
                    stackId="1"
                    stroke="#eab308"
                    fill="#eab308"
                  />
                  <Area
                    type="monotone"
                    dataKey="CovidBioBubble"
                    stackId="1"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                  />
                  <Area
                    type="monotone"
                    dataKey="Franchise"
                    stackId="1"
                    stroke="#6366f1"
                    fill="#6366f1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4 }}>
        Curated Collections
      </Typography>
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {collections.map((coll, i) => (
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
                bgcolor:
                  selectedCollection === coll.theme
                    ? "rgba(229,46,113,0.15)"
                    : "rgba(255,255,255,0.02)",
                border: "1px solid",
                borderColor:
                  selectedCollection === coll.theme
                    ? "#e52e71"
                    : "rgba(255,255,255,0.05)",
                cursor: "pointer",
                "&:hover": {
                  bgcolor:
                    selectedCollection === coll.theme
                      ? "rgba(229,46,113,0.2)"
                      : "rgba(255,255,255,0.05)",
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
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
                      fontSize: "0.65rem",
                      maxWidth: "100%",
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
        ))}
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
        {flashpoints
          .filter(
            (fp) =>
              !selectedCollection ||
              collections
                .find((c) => c.theme === selectedCollection)
                ?.events.some((e) => e.id === fp.id),
          )
          .filter((fp) => selectedTier === "All" || fp.tier === selectedTier)
          .map((fp, idx) => {
            const { label, color } = getSeverityLabel(fp);
            return (
              <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4, xl: 4 }} key={fp.id}>
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
          })}
      </Grid>
    </Box>
  );
};

export default Flashpoints;
