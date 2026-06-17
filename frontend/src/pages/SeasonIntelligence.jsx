import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Avatar,
  Tooltip as MuiTooltip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSeasons, useSeasonIntelligence } from "../hooks/useSeason.js";
import EmptyState from "../components/common/EmptyState.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GavelIcon from "@mui/icons-material/Gavel";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TimelineIcon from "@mui/icons-material/Timeline";
import StarIcon from "@mui/icons-material/Star";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import GroupIcon from "@mui/icons-material/Group";
import CampaignIcon from "@mui/icons-material/Campaign";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PsychologyIcon from "@mui/icons-material/Psychology";
import StarsIcon from "@mui/icons-material/Stars";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const FRANCHISE_COLORS = {
  MI: "#004BA0",
  CSK: "#F9CD05",
  RCB: "#EC1C24",
  KKR: "#3A225D",
  DC: "#004C93",
  PBKS: "#ED1B24",
  RR: "#EA1A85",
  SRH: "#FF822A",
  GT: "#1B2133",
  LSG: "#A72056",
  KTK: "#6F1D45",
  PWI: "#2F9BE3",
  GL: "#E04F16",
  RPS: "#6F61AC",
  DD: "#004C93",
  KXIP: "#ED1B24",
  SH: "#FF822A",
  DEC: "#004C93",
  PW: "#2F9BE3",
};

const getFranchiseColor = (shortName) =>
  FRANCHISE_COLORS[shortName] || "#6366f1";

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === undefined || value === null) return;
    const target = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(target)) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <>{typeof value === "number" ? display.toLocaleString() : value}</>;
}

const GlassCard = ({ children, sx = {}, ...props }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      border: "1px solid rgba(148, 163, 184, 0.08)",
      bgcolor: "rgba(17, 24, 39, 0.6)",
      backdropFilter: "blur(20px)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      "&:hover": {
        border: "1px solid rgba(148, 163, 184, 0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        transform: "translateY(-2px)",
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Paper>
);

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  color = "primary.main",
  action,
}) => (
  <Box
    sx={{
      mb: 3,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 1,
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      {Icon && (
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: `${color}20`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon sx={{ color, fontSize: 22 }} />
        </Box>
      )}
      <Box>
        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {action && <Box>{action}</Box>}
  </Box>
);

const PositionBadge = ({ position, isChampion }) => {
  const colors = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  const bg = colors[position] || "rgba(255,255,255,0.1)";
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: isChampion ? "#FFD700" : bg,
        color: position <= 3 ? "#000" : "text.primary",
        fontWeight: 900,
        fontSize: 14,
        boxShadow: isChampion ? "0 0 12px rgba(255, 215, 0, 0.5)" : "none",
      }}
    >
      {position || "-"}
    </Box>
  );
};

function SeasonIntelligence() {
  const navigate = useNavigate();
  const { data: seasons, isLoading: loadingSeasons } = useSeasons();
  const [selectedYear, setSelectedYear] = useState("");

  const [compareMode, setCompareMode] = useState(false);
  const [compareYear, setCompareYear] = useState("");

  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedYear) {
      setSelectedYear(seasons[0]);
    }
  }, [seasons, selectedYear]);

  const { data, isLoading, isFetching, isPlaceholderData } =
    useSeasonIntelligence(selectedYear);
  const { data: compareData, isFetching: compareFetching } =
    useSeasonIntelligence(compareYear, {
      enabled: compareMode && !!compareYear,
    });

  const topBattersChartData = useMemo(() => {
    if (!data?.topBatters) return [];
    return data.topBatters.map((b) => ({
      name: b.player.name.split(" ").pop(),
      fullName: b.player.name,
      runs: b.runs,
      team: b.team,
    }));
  }, [data?.topBatters]);

  const topBowlersChartData = useMemo(() => {
    if (!data?.topBowlers) return [];
    return data.topBowlers.map((b) => ({
      name: b.player.name.split(" ").pop(),
      fullName: b.player.name,
      wickets: b.wickets,
      team: b.team,
    }));
  }, [data?.topBowlers]);

  if (loadingSeasons || (isLoading && !isPlaceholderData)) {
    return (
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 2 }}>
        <Skeleton
          variant="rectangular"
          height={80}
          sx={{ borderRadius: 4, mb: 3 }}
        />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        {(isFetching || compareFetching) && (
          <LinearProgress
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              height: 3,
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #6366f1, #f59e0b, #6366f1)",
              },
            }}
          />
        )}

        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              gap: 2,
              textAlign: "center",
            }}
          >
            <Box>
              <PageHeader
                title="Season Intelligence"
                subtitle="Elite analytics and storylines for every IPL season"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {compareMode && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Compare With</InputLabel>
                  <Select
                    value={compareYear}
                    label="Compare With"
                    onChange={(e) => setCompareYear(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {seasons
                      ?.filter((y) => y !== selectedYear)
                      .map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={compareMode}
                    onChange={(e) => {
                      setCompareMode(e.target.checked);
                      if (!compareYear && seasons)
                        setCompareYear(seasons.find((y) => y !== selectedYear));
                    }}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={700}>
                    Compare Mode
                  </Typography>
                }
                sx={{
                  bgcolor: "rgba(99,102,241,0.1)",
                  pr: 2,
                  pl: 1,
                  py: 0.5,
                  borderRadius: 8,
                  m: 0,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 0.75,
              flexWrap: "wrap",
              p: 1.5,
              borderRadius: 3,
              bgcolor: "rgba(17, 24, 39, 0.5)",
              border: "1px solid rgba(148, 163, 184, 0.08)",
            }}
          >
            {seasons?.map((year) => (
              <Chip
                key={year}
                label={year}
                onClick={() => setSelectedYear(year)}
                sx={{
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  px: 1,
                  height: 36,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  bgcolor:
                    selectedYear === year ? "primary.main" : "transparent",
                  color: selectedYear === year ? "white" : "text.secondary",
                  border:
                    selectedYear === year
                      ? "none"
                      : "1px solid rgba(148, 163, 184, 0.1)",
                  "&:hover": {
                    bgcolor:
                      selectedYear === year
                        ? "primary.dark"
                        : "rgba(99, 102, 241, 0.15)",
                    color: "white",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {data && (
          <Box
            sx={{
              opacity: isPlaceholderData ? 0.6 : 1,
              transition: "opacity 0.3s",
            }}
          >
            {compareMode && compareData && (
              <GlassCard sx={{ mb: 4, borderTop: "4px solid #6366f1" }}>
                <SectionHeader
                  icon={CompareArrowsIcon}
                  title="Tale of Two Seasons"
                  subtitle={`Comparing IPL ${selectedYear} vs IPL ${compareYear}`}
                  color="#6366f1"
                />
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: 800, color: "text.secondary" }}
                        >
                          Metric
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 900,
                            color: "primary.main",
                            fontSize: "1.1rem",
                          }}
                        >
                          IPL {selectedYear}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 900,
                            color: "#f59e0b",
                            fontSize: "1.1rem",
                          }}
                        >
                          IPL {compareYear}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>
                          Diff
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        {
                          label: "Total Matches",
                          key: "totalMatches",
                          d1: data.overview.totalMatches,
                          d2: compareData.overview.totalMatches,
                          unit: "",
                        },
                        {
                          label: "Total Runs",
                          key: "totalRuns",
                          d1: data.overview.totalRuns,
                          d2: compareData.overview.totalRuns,
                          unit: "",
                        },
                        {
                          label: "Total Wickets",
                          key: "totalWickets",
                          d1: data.overview.totalWickets,
                          d2: compareData.overview.totalWickets,
                          unit: "",
                        },
                        {
                          label: "Total Sixes",
                          key: "totalSixes",
                          d1: data.overview.totalSixes,
                          d2: compareData.overview.totalSixes,
                          unit: "",
                        },
                        {
                          label: "Average Score / Match",
                          key: "avgScore",
                          d1: data.overview.avgScorePerMatch,
                          d2: compareData.overview.avgScorePerMatch,
                          unit: "",
                        },
                        {
                          label: "Bat First Win %",
                          key: "batFirst",
                          d1: data.trends.batFirstWinPct,
                          d2: compareData.trends.batFirstWinPct,
                          unit: "%",
                        },
                        {
                          label: "Chase Win %",
                          key: "chase",
                          d1: data.trends.chaseWinPct,
                          d2: compareData.trends.chaseWinPct,
                          unit: "%",
                        },
                      ].map((row) => {
                        const diff = row.d1 - row.d2;
                        const diffColor =
                          diff > 0
                            ? "success.main"
                            : diff < 0
                              ? "error.main"
                              : "text.secondary";
                        return (
                          <TableRow key={row.key} hover>
                            <TableCell sx={{ fontWeight: 700 }}>
                              {row.label}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {row.d1.toLocaleString()}
                              {row.unit}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {row.d2.toLocaleString()}
                              {row.unit}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: 900, color: diffColor }}
                            >
                              {diff > 0 ? "+" : ""}
                              {diff.toLocaleString()}
                              {row.unit}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </GlassCard>
            )}

            {data.champion && (
              <GlassCard
                sx={{
                  mb: 4,
                  p: 0,
                  overflow: "hidden",
                  background: `linear-gradient(135deg, ${getFranchiseColor(data.champion.franchise.shortName)}22 0%, rgba(17,24,39,0.9) 60%)`,
                  borderLeft: `4px solid ${getFranchiseColor(data.champion.franchise.shortName)}`,
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2.5, md: 4 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    textAlign: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: getFranchiseColor(
                          data.champion.franchise.shortName,
                        ),
                        boxShadow: `0 0 24px ${getFranchiseColor(data.champion.franchise.shortName)}66`,
                      }}
                    >
                      <EmojiEventsIcon
                        sx={{ fontSize: 32, color: "#FFD700" }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "#FFD700",
                          fontWeight: 800,
                          letterSpacing: 2,
                        }}
                      >
                        🏆 IPL {selectedYear} CHAMPION
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={900}
                        sx={{ lineHeight: 1.1 }}
                      >
                        {data.champion.franchise.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Won {data.champion.matchesWon} of{" "}
                        {data.champion.matchesPlayed} matches{" "}
                        {data.runnerUp &&
                          ` • Defeated ${data.runnerUp.franchise.name} in the Final`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </GlassCard>
            )}

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  const aw = d.seasonAwards;
                  if (!d.seasonMvp && !aw?.finisher && !aw?.economyKing)
                    return null;

                  return (
                    <Grid item xs={12} md={6} key={`awards-${d.year}`}>
                      <SectionHeader
                        icon={EmojiEventsIcon}
                        title={`Season Awards (${d.year})`}
                        color="#f59e0b"
                      />
                      <Grid container spacing={2}>
                        {d.seasonMvp && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={compareMode && compareData ? 6 : 4}
                          >
                            <GlassCard
                              sx={{
                                borderTop: "3px solid #f59e0b",
                                p: 2,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(`/players/${d.seasonMvp.player.id}`)
                              }
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                                textTransform="uppercase"
                              >
                                MVP
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  textAlign: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Avatar src={d.seasonMvp.player.imageUrl}>
                                  {d.seasonMvp.player.name?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                    sx={{ lineHeight: 1.2 }}
                                  >
                                    {d.seasonMvp.player.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                  >
                                    Performance: {d.seasonMvp.performanceScore}
                                  </Typography>
                                </Box>
                              </Box>
                            </GlassCard>
                          </Grid>
                        )}
                        {d.pressureIndex?.clutchBatter && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={compareMode && compareData ? 6 : 4}
                          >
                            <GlassCard
                              sx={{
                                borderTop: "3px solid #ec4899",
                                p: 2,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(
                                  `/players/${d.pressureIndex.clutchBatter.player.id}`,
                                )
                              }
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                                textTransform="uppercase"
                              >
                                Clutch King
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  textAlign: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Avatar
                                  src={
                                    d.pressureIndex.clutchBatter.player.imageUrl
                                  }
                                >
                                  {
                                    d.pressureIndex.clutchBatter.player
                                      .name?.[0]
                                  }
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                    sx={{ lineHeight: 1.2 }}
                                  >
                                    {d.pressureIndex.clutchBatter.player.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                  >
                                    {d.pressureIndex.clutchBatter.runs}{" "}
                                    death/pressure runs
                                  </Typography>
                                </Box>
                              </Box>
                            </GlassCard>
                          </Grid>
                        )}
                        {d.mostImprovedPlayer && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={compareMode && compareData ? 6 : 4}
                          >
                            <GlassCard
                              sx={{
                                borderTop: "3px solid #10b981",
                                p: 2,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(
                                  `/players/${d.mostImprovedPlayer.player.id}`,
                                )
                              }
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                                textTransform="uppercase"
                              >
                                Breakthrough Star
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  textAlign: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Avatar
                                  src={d.mostImprovedPlayer.player.imageUrl}
                                >
                                  {d.mostImprovedPlayer.player.name?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                    sx={{ lineHeight: 1.2 }}
                                  >
                                    {d.mostImprovedPlayer.player.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                  >
                                    + {d.mostImprovedPlayer.improvementScore}{" "}
                                    impact pts
                                  </Typography>
                                </Box>
                              </Box>
                            </GlassCard>
                          </Grid>
                        )}
                        {aw?.economyKing && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={compareMode && compareData ? 6 : 4}
                          >
                            <GlassCard
                              sx={{
                                borderTop: "3px solid #3b82f6",
                                p: 2,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(`/players/${aw.economyKing.playerId}`)
                              }
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                                textTransform="uppercase"
                              >
                                Economy King
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  textAlign: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Avatar>
                                  {aw.economyKing.player?.name?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                    sx={{ lineHeight: 1.2 }}
                                  >
                                    {aw.economyKing.player?.name ||
                                      "Top Bowler"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                  >
                                    {aw.economyKing.economyRate} Econ (min 10
                                    wkts)
                                  </Typography>
                                </Box>
                              </Box>
                            </GlassCard>
                          </Grid>
                        )}
                        {aw?.finisher && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={compareMode && compareData ? 6 : 4}
                          >
                            <GlassCard
                              sx={{
                                borderTop: "3px solid #f97316",
                                p: 2,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(`/players/${aw.finisher.player.id}`)
                              }
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                                textTransform="uppercase"
                              >
                                Finisher of the Season
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  textAlign: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Avatar src={aw.finisher.player.imageUrl}>
                                  {aw.finisher.player.name?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                    sx={{ lineHeight: 1.2 }}
                                  >
                                    {aw.finisher.player.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                  >
                                    {aw.finisher.strikeRate} SR in Death Overs
                                  </Typography>
                                </Box>
                              </Box>
                            </GlassCard>
                          </Grid>
                        )}
                        {aw?.enforcer && (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={compareMode && compareData ? 6 : 4}
                          >
                            <GlassCard
                              sx={{
                                borderTop: "3px solid #8b5cf6",
                                p: 2,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(`/players/${aw.enforcer.player.id}`)
                              }
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                                textTransform="uppercase"
                              >
                                The Enforcer
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  textAlign: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Avatar src={aw.enforcer.player.imageUrl}>
                                  {aw.enforcer.player.name?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                    sx={{ lineHeight: 1.2 }}
                                  >
                                    {aw.enforcer.player.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                  >
                                    {aw.enforcer.topOrderWickets} Top-Order Wkts
                                  </Typography>
                                </Box>
                              </Box>
                            </GlassCard>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  );
                })}
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  const aw = d.seasonAwards;
                  if (!d.seasonMvp && !aw?.finisher && !aw?.economyKing)
                    return null;

                  return (
                    <Grid item xs={12} md={6} key={`narrative-${d.year}`}>
                      {d.seasonNarrative && (
                        <GlassCard
                          sx={{
                            mb: 3,
                            borderLeft: "4px solid #6366f1",
                            background:
                              "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(17, 24, 39, 0.9) 100%)",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.5,
                              alignItems: "center",
                              textAlign: "center",
                            }}
                          >
                            <AutoGraphIcon
                              sx={{ color: "#6366f1", fontSize: 32, mt: 0.5 }}
                            />
                            <Box>
                              <Typography
                                variant="overline"
                                sx={{
                                  color: "#6366f1",
                                  fontWeight: 800,
                                  letterSpacing: 1.5,
                                }}
                              >
                                SEASON NARRATIVE ({d.year})
                              </Typography>
                              <Typography
                                variant="h6"
                                fontWeight={500}
                                sx={{
                                  mt: 0.5,
                                  fontStyle: "italic",
                                  color: "text.primary",
                                  lineHeight: 1.4,
                                }}
                              >
                                "{d.seasonNarrative}"
                              </Typography>
                            </Box>
                          </Box>
                        </GlassCard>
                      )}
                      {d.recordsCheck && d.recordsCheck.length > 0 && (
                        <Box>
                          <SectionHeader
                            icon={CampaignIcon}
                            title={`Records Check (${d.year})`}
                            subtitle={`${d.recordsCheck.filter((r) => r.isBroken).length} Records Broken this season`}
                            color={
                              d.recordsCheck.some((r) => r.isBroken)
                                ? "#ef4444"
                                : "#94a3b8"
                            }
                          />
                          <Grid container spacing={2}>
                            {d.recordsCheck.map((rec, i) => (
                              <Grid
                                item
                                xs={12}
                                sm={compareMode && compareData ? 12 : 6}
                                md={compareMode && compareData ? 12 : 4}
                                key={i}
                              >
                                <GlassCard
                                  sx={{
                                    borderTop: `3px solid ${rec.isBroken ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                                    p: 2,
                                    opacity: rec.isBroken ? 1 : 0.7,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      textAlign: "center",
                                      gap: 1,
                                    }}
                                  >
                                    {rec.isBroken ? (
                                      <CheckCircleIcon
                                        sx={{
                                          color: "#ef4444",
                                          fontSize: 16,
                                        }}
                                      />
                                    ) : (
                                      <CancelIcon
                                        sx={{
                                          color: "text.secondary",
                                          fontSize: 16,
                                        }}
                                      />
                                    )}
                                    <Typography
                                      variant="caption"
                                      color={
                                        rec.isBroken
                                          ? "text.primary"
                                          : "text.secondary"
                                      }
                                      fontWeight={800}
                                      textTransform="uppercase"
                                    >
                                      {rec.title}
                                    </Typography>
                                  </Box>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "baseline",
                                      gap: 1,
                                      mt: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="h5"
                                      fontWeight={900}
                                      sx={{
                                        color: rec.isBroken
                                          ? "#ef4444"
                                          : "text.primary",
                                      }}
                                    >
                                      {rec.new}{" "}
                                      {rec.isBroken && (
                                        <Typography
                                          component="span"
                                          variant="caption"
                                          sx={{ ml: 0.5 }}
                                        >
                                          (New Record)
                                        </Typography>
                                      )}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        textDecoration: rec.isBroken
                                          ? "line-through"
                                          : "none",
                                      }}
                                    >
                                      {rec.isBroken
                                        ? `was ${rec.old} ${rec.oldPlayer ? `(${rec.oldPlayer})` : ""}`
                                        : `(Record: ${rec.old} ${rec.oldPlayer ? `by ${rec.oldPlayer}` : ""})`}
                                    </Typography>
                                  </Box>
                                  {rec.player && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        mt: 1.5,
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        navigate(`/players/${rec.player.id}`)
                                      }
                                    >
                                      <Avatar
                                        src={rec.player.imageUrl}
                                        sx={{ width: 28, height: 28 }}
                                      >
                                        {rec.player.name?.[0]}
                                      </Avatar>
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color="text.primary"
                                      >
                                        {rec.player.name}
                                      </Typography>
                                    </Box>
                                  )}
                                </GlassCard>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  if (!d.storyline) return null;
                  return (
                    <Grid
                      item
                      xs={12}
                      md={compareMode && compareData ? 6 : 12}
                      key={`storyline-${d.year}`}
                    >
                      <SectionHeader
                        icon={MenuBookIcon}
                        title={`Season Storyline (${d.year})`}
                        subtitle="The defining extremes and moments of the year"
                        color="#f59e0b"
                      />
                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={compareMode && compareData ? 6 : 3}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #f59e0b", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Highest Team Total (Est.)
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{
                                mt: 0.5,
                                color: getFranchiseColor(
                                  d.storyline.highestTeamTotal?.team,
                                ),
                              }}
                            >
                              {d.storyline.highestTeamTotal?.team} —{" "}
                              {d.storyline.highestTeamTotal?.score}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              vs {d.storyline.highestTeamTotal?.opponent}
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={compareMode && compareData ? 6 : 3}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #10b981", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Biggest Successful Chase
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{
                                mt: 0.5,
                                color: getFranchiseColor(
                                  d.storyline.biggestChase?.team,
                                ),
                              }}
                            >
                              {d.storyline.biggestChase?.team} chased{" "}
                              {d.storyline.biggestChase?.target}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              vs {d.storyline.biggestChase?.opponent}
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={compareMode && compareData ? 6 : 3}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #ef4444", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Closest Finish
                            </Typography>
                            {d.storyline.closestMatch?.isSuperOver ? (
                              <Typography
                                variant="h5"
                                fontWeight={900}
                                sx={{ mt: 0.5, color: "#8b5cf6" }}
                              >
                                Match Tied (Super Over)
                              </Typography>
                            ) : (
                              <Typography
                                variant="h5"
                                fontWeight={900}
                                sx={{
                                  mt: 0.5,
                                  color: getFranchiseColor(
                                    d.storyline.closestMatch?.winner,
                                  ),
                                }}
                              >
                                {d.storyline.closestMatch?.winner} won by{" "}
                                {d.storyline.closestMatch?.margin} runs
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {d.storyline.closestMatch?.match?.team1} vs{" "}
                              {d.storyline.closestMatch?.match?.team2}
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #3b82f6", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Lowest Total (Bat 1st, Est.)
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{
                                mt: 0.5,
                                color: getFranchiseColor(
                                  d.storyline.lowestTeamTotalBatFirst?.team,
                                ),
                              }}
                            >
                              {d.storyline.lowestTeamTotalBatFirst?.team} —{" "}
                              {d.storyline.lowestTeamTotalBatFirst?.score}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              vs {d.storyline.lowestTeamTotalBatFirst?.opponent}
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{
                              borderTop: "3px solid #8b5cf6",
                              py: 2,
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate(
                                `/players/${d.storyline.highestIndividualScore?.player?.id}`,
                              )
                            }
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Highest Individual Score
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{ mt: 0.5, color: "#8b5cf6" }}
                            >
                              {d.storyline.highestIndividualScore?.score}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {d.storyline.highestIndividualScore?.player?.name}
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{
                              borderTop: "3px solid #d946ef",
                              py: 2,
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate(
                                `/players/${d.storyline.bestBowlingSpell?.player?.id}`,
                              )
                            }
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Best Bowling Spell
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{ mt: 0.5, color: "#d946ef" }}
                            >
                              {d.storyline.bestBowlingSpell?.bestBowling}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {d.storyline.bestBowlingSpell?.player?.name}
                            </Typography>
                          </GlassCard>
                        </Grid>
                      </Grid>

                      {d.hallOfFameMatch && (
                        <Box sx={{ mt: 3 }}>
                          <GlassCard
                            sx={{
                              borderLeft: "4px solid #f59e0b",
                              background:
                                "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(17, 24, 39, 0.8) 100%)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                flexWrap: "wrap",
                                gap: 2,
                              }}
                            >
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1.5,
                                    mb: 1,
                                  }}
                                >
                                  <StarsIcon sx={{ color: "#f59e0b" }} />
                                  <Typography
                                    variant="overline"
                                    sx={{
                                      color: "#f59e0b",
                                      fontWeight: 800,
                                      letterSpacing: 1,
                                    }}
                                  >
                                    HALL OF FAME MATCH
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="h5"
                                  fontWeight={900}
                                  sx={{ mb: 0.5 }}
                                >
                                  {d.hallOfFameMatch.match.team1} vs{" "}
                                  {d.hallOfFameMatch.match.team2}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 2 }}
                                >
                                  {new Date(
                                    d.hallOfFameMatch.match.date,
                                  ).toLocaleDateString()}{" "}
                                  • {d.hallOfFameMatch.match.venue}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {d.hallOfFameMatch.summary.map((tag, i) => (
                                    <Chip
                                      key={i}
                                      label={tag}
                                      size="small"
                                      sx={{
                                        bgcolor: "rgba(245, 158, 11, 0.1)",
                                        color: "#f59e0b",
                                        fontWeight: 700,
                                        borderRadius: 1,
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                          </GlassCard>
                        </Box>
                      )}
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  if (!d.trends) return null;
                  return (
                    <Grid
                      item
                      xs={12}
                      md={compareMode && compareData ? 6 : 12}
                      key={`trends-${d.year}`}
                    >
                      <SectionHeader
                        icon={TimelineIcon}
                        title={`Season Meta & Trends (${d.year})`}
                        subtitle="Analyzing the winning formulas"
                        color="#10b981"
                      />
                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={6}
                          md={compareMode && compareData ? 6 : 3}
                        >
                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2,
                              px: 1,
                              bgcolor: "rgba(16,185,129,0.05)",
                              borderTop: "2px solid #10b981",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                            >
                              BAT FIRST WIN %
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#10b981"
                            >
                              {d.trends.batFirstWinPct}%
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {d.trends.batFirstWins} wins
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          md={compareMode && compareData ? 6 : 3}
                        >
                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2,
                              px: 1,
                              bgcolor: "rgba(59,130,246,0.05)",
                              borderTop: "2px solid #3b82f6",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                            >
                              CHASING WIN %
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#3b82f6"
                            >
                              {d.trends.chaseWinPct}%
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {d.trends.chaseWins} wins
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          md={compareMode && compareData ? 6 : 3}
                        >
                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2,
                              px: 1,
                              bgcolor: "rgba(245,158,11,0.05)",
                              borderTop: "2px solid #f59e0b",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                            >
                              AVG 1ST INNS
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#f59e0b"
                            >
                              {d.trends.avgFirstInningsScore}
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          md={compareMode && compareData ? 6 : 3}
                        >
                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2,
                              px: 1,
                              bgcolor: "rgba(139,92,246,0.05)",
                              borderTop: "2px solid #8b5cf6",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                            >
                              AVG WIN SCORE
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#8b5cf6"
                            >
                              {d.trends.avgWinningScore}
                            </Typography>
                          </GlassCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <GlassCard
                            sx={{
                              py: 2,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              textAlign: "center",
                              bgcolor: "rgba(16,185,129,0.05)",
                              borderTop: "2px solid #10b981",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                              >
                                LOWEST SCORING VENUE
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={900}
                                color="error.main"
                              >
                                Avg Match Aggregate:{" "}
                                {d.trends.lowestScoringVenue?.avg}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              noWrap
                              sx={{ mb: 2 }}
                            >
                              {d.trends.lowestScoringVenue?.venue}
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <GlassCard
                            sx={{
                              py: 2,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              textAlign: "center",
                              bgcolor: "rgba(239,68,68,0.05)",
                              borderTop: "2px solid #ef4444",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                              >
                                HIGHEST SCORING VENUE
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={900}
                                color="success.main"
                              >
                                Avg Match Aggregate:{" "}
                                {d.trends.highestScoringVenue?.avg}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              noWrap
                              sx={{ mb: 2 }}
                            >
                              {d.trends.highestScoringVenue?.venue}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                              >
                                TOUGHEST VENUE
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={900}
                                color="error.main"
                              >
                                Avg Match Aggregate:{" "}
                                {d.trends.lowestScoringVenue?.avg}
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={700} noWrap>
                              {d.trends.lowestScoringVenue?.venue}
                            </Typography>
                          </GlassCard>
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  const hasPressure =
                    d.pressureIndex?.clutchBatter ||
                    d.pressureIndex?.clutchBowler;
                  if (
                    !hasPressure &&
                    !d.mostImprovedPlayer &&
                    (!d.seasonRivalries || d.seasonRivalries.length === 0)
                  )
                    return null;
                  return (
                    <Grid
                      item
                      xs={12}
                      md={compareMode && compareData ? 6 : 12}
                      key={`clutch-${d.year}`}
                    >
                      {hasPressure && (
                        <Box sx={{ mb: 4 }}>
                          <SectionHeader
                            icon={PsychologyIcon}
                            title={`Pressure Index (${d.year})`}
                            subtitle="Most clutch performers in high-stakes situations"
                            color="#ec4899"
                          />
                          <Grid container spacing={2}>
                            {d.pressureIndex.clutchBatter && (
                              <Grid item xs={12} sm={6}>
                                <GlassCard
                                  sx={{
                                    borderTop: "3px solid #ec4899",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    navigate(
                                      `/players/${d.pressureIndex.clutchBatter.player.id}`,
                                    )
                                  }
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={800}
                                    textTransform="uppercase"
                                  >
                                    Most Clutch Batter
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      textAlign: "center",
                                      mt: 1,
                                    }}
                                  >
                                    <Typography variant="h6" fontWeight={800}>
                                      {d.pressureIndex.clutchBatter.player.name}
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      fontWeight={900}
                                      color="#ec4899"
                                    >
                                      {d.pressureIndex.clutchBatter.runs}{" "}
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        runs
                                      </Typography>
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1, fontSize: "0.75rem" }}
                                  >
                                    *In Death Overs or 3+ wickets down
                                  </Typography>
                                </GlassCard>
                              </Grid>
                            )}
                            {d.pressureIndex.clutchBowler && (
                              <Grid item xs={12} sm={6}>
                                <GlassCard
                                  sx={{
                                    borderTop: "3px solid #ec4899",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    navigate(
                                      `/players/${d.pressureIndex.clutchBowler.player.id}`,
                                    )
                                  }
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={800}
                                    textTransform="uppercase"
                                  >
                                    Most Clutch Bowler
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      textAlign: "center",
                                      mt: 1,
                                    }}
                                  >
                                    <Typography variant="h6" fontWeight={800}>
                                      {d.pressureIndex.clutchBowler.player.name}
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      fontWeight={900}
                                      color="#ec4899"
                                    >
                                      {d.pressureIndex.clutchBowler.wickets}{" "}
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        wkts
                                      </Typography>
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1, fontSize: "0.75rem" }}
                                  >
                                    *In Death Overs or Playoffs
                                  </Typography>
                                </GlassCard>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      )}

                      {d.mostImprovedPlayer && (
                        <Box sx={{ mb: 4 }}>
                          <SectionHeader
                            icon={TrendingUpIcon}
                            title={`Most Improved Player (${d.year})`}
                            subtitle={`Compared to IPL ${d.year - 1}`}
                            color="#10b981"
                          />
                          <GlassCard
                            sx={{
                              borderLeft: "4px solid #10b981",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate(
                                `/players/${d.mostImprovedPlayer.player.id}`,
                              )
                            }
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                flexWrap: "wrap",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  src={d.mostImprovedPlayer.player.imageUrl}
                                  sx={{ width: 48, height: 48 }}
                                />
                                <Box>
                                  <Typography variant="h6" fontWeight={900}>
                                    {d.mostImprovedPlayer.player.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {d.mostImprovedPlayer.player.role}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 3,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={800}
                                    sx={{ display: "block" }}
                                  >
                                    IPL {d.year - 1}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight={800}
                                    color="text.secondary"
                                  >
                                    {d.mostImprovedPlayer.player.role ===
                                    "Bowler"
                                      ? `${d.mostImprovedPlayer.prevWickets} wkts`
                                      : `${d.mostImprovedPlayer.prevRuns} runs`}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <TrendingUpIcon
                                    sx={{ color: "#10b981", fontSize: 32 }}
                                  />
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={800}
                                    sx={{ display: "block" }}
                                  >
                                    IPL {d.year}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight={900}
                                    color="#10b981"
                                  >
                                    {d.mostImprovedPlayer.player.role ===
                                    "Bowler"
                                      ? `${d.mostImprovedPlayer.currentWickets} wkts`
                                      : `${d.mostImprovedPlayer.currentRuns} runs`}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </GlassCard>
                        </Box>
                      )}

                      {d.seasonRivalries && d.seasonRivalries.length > 0 && (
                        <Box>
                          <SectionHeader
                            icon={LocalFireDepartmentIcon}
                            title={`Season Rivalries (${d.year})`}
                            subtitle="Highest intensity H2H battles"
                            color="#f97316"
                          />
                          <Grid container spacing={2}>
                            {d.seasonRivalries.map((riv, i) => (
                              <Grid item xs={12} key={i}>
                                <GlassCard
                                  sx={{
                                    py: 1.5,
                                    px: 2,
                                    borderLeft:
                                      i === 0
                                        ? "4px solid #f97316"
                                        : "1px solid rgba(148, 163, 184, 0.08)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      textAlign: "center",
                                      flexWrap: "wrap",
                                      gap: 2,
                                    }}
                                  >
                                    <Box sx={{ flex: 1, minWidth: 150 }}>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        fontWeight={700}
                                      >
                                        Batter
                                      </Typography>
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight={800}
                                      >
                                        {riv.batter}
                                      </Typography>
                                    </Box>
                                    <Box
                                      sx={{
                                        px: 2,
                                        textAlign: "center",
                                        borderRight:
                                          "1px solid rgba(255,255,255,0.1)",
                                        borderLeft:
                                          "1px solid rgba(255,255,255,0.1)",
                                      }}
                                    >
                                      <Typography
                                        variant="h6"
                                        fontWeight={900}
                                        color="#f97316"
                                      >
                                        {riv.runs}{" "}
                                        <Typography
                                          component="span"
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          runs
                                        </Typography>
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontWeight={700}
                                      >
                                        {riv.balls} balls • {riv.strikeRate} SR
                                      </Typography>
                                    </Box>
                                    <Box
                                      sx={{
                                        flex: 1,
                                        textAlign: "center",
                                        minWidth: 150,
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        fontWeight={700}
                                      >
                                        Bowler
                                      </Typography>
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight={800}
                                      >
                                        {riv.bowler}
                                      </Typography>
                                      {riv.dismissals > 0 && (
                                        <Typography
                                          variant="caption"
                                          color="error.main"
                                          fontWeight={800}
                                        >
                                          {riv.dismissals} dismissals
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                </GlassCard>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  if (!d.seasonMilestones) return null;
                  return (
                    <Grid
                      item
                      xs={12}
                      md={compareMode && compareData ? 6 : 12}
                      key={`milestones-${d.year}`}
                    >
                      <SectionHeader
                        icon={EmojiEventsIcon}
                        title={`Season Milestones (${d.year})`}
                        subtitle="Shareable moments from the season"
                        color="#f43f5e"
                      />
                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={12}
                          sm={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #f43f5e", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Most Sixes in an Innings
                            </Typography>
                            {d.seasonMilestones.mostSixesInnings ? (
                              <>
                                <Typography
                                  variant="h4"
                                  fontWeight={900}
                                  sx={{ mt: 0.5, color: "#f43f5e" }}
                                >
                                  {d.seasonMilestones.mostSixesInnings.sixes}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={700}
                                  sx={{ mt: 0.5 }}
                                >
                                  {
                                    d.seasonMilestones.mostSixesInnings.player
                                      .name
                                  }{" "}
                                  ({d.seasonMilestones.mostSixesInnings.runs}{" "}
                                  runs)
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                -
                              </Typography>
                            )}
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #f59e0b", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Most Explosive Innings (min 50)
                            </Typography>
                            {d.seasonMilestones.fastestFifty ? (
                              <>
                                <Typography
                                  variant="h4"
                                  fontWeight={900}
                                  sx={{ mt: 0.5, color: "#f59e0b" }}
                                >
                                  {d.seasonMilestones.fastestFifty.sr} SR
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={700}
                                  sx={{ mt: 0.5 }}
                                >
                                  {d.seasonMilestones.fastestFifty.player.name}{" "}
                                  ({d.seasonMilestones.fastestFifty.runs} off{" "}
                                  {d.seasonMilestones.fastestFifty.balls})
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                -
                              </Typography>
                            )}
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #8b5cf6", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Super Over Matches
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              sx={{ mt: 0.5, color: "#8b5cf6" }}
                            >
                              {d.seasonMilestones.superOvers.length}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {d.seasonMilestones.superOvers.length > 0 ? (
                                d.seasonMilestones.superOvers.map((so, i) => (
                                  <Typography
                                    key={i}
                                    variant="body2"
                                    color="text.secondary"
                                    fontWeight={700}
                                    sx={{ display: "block" }}
                                  >
                                    {so.matchInfo} ({so.winner} won)
                                  </Typography>
                                ))
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={700}
                                >
                                  No Super Overs this season
                                </Typography>
                              )}
                            </Box>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #0ea5e9", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Matches Abandoned
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              sx={{ mt: 0.5, color: "#0ea5e9" }}
                            >
                              {d.seasonMilestones.abandonedMatches}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={700}
                              sx={{ mt: 0.5 }}
                            >
                              No Result / Washed out due to rain
                            </Typography>
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #14b8a6", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Most Economical Spell (min 4 overs)
                            </Typography>
                            {d.seasonMilestones.mostEconomicalSpell ? (
                              <>
                                <Typography
                                  variant="h4"
                                  fontWeight={900}
                                  sx={{ mt: 0.5, color: "#14b8a6" }}
                                >
                                  {d.seasonMilestones.mostEconomicalSpell.econ}{" "}
                                  Econ
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={700}
                                  sx={{ mt: 0.5 }}
                                >
                                  {
                                    d.seasonMilestones.mostEconomicalSpell
                                      .player.name
                                  }{" "}
                                  (
                                  {
                                    d.seasonMilestones.mostEconomicalSpell
                                      .figures
                                  }{" "}
                                  in 4 ovs)
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                -
                              </Typography>
                            )}
                          </GlassCard>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={compareMode && compareData ? 6 : 4}
                        >
                          <GlassCard
                            sx={{ borderTop: "3px solid #d946ef", py: 2 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              textTransform="uppercase"
                            >
                              Most Dot Balls in an Innings
                            </Typography>
                            {d.seasonMilestones.mostDotsInnings ? (
                              <>
                                <Typography
                                  variant="h4"
                                  fontWeight={900}
                                  sx={{ mt: 0.5, color: "#d946ef" }}
                                >
                                  {d.seasonMilestones.mostDotsInnings.dotBalls}{" "}
                                  Dots
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={700}
                                  sx={{ mt: 0.5 }}
                                >
                                  {
                                    d.seasonMilestones.mostDotsInnings.player
                                      .name
                                  }{" "}
                                  ({d.seasonMilestones.mostDotsInnings.figures})
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                -
                              </Typography>
                            )}
                          </GlassCard>
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  return (
                    <Grid item xs={12} md={6} key={`bestxi-${d.year}`}>
                      <SectionHeader
                        icon={StarIcon}
                        title={`Dominant XI of IPL ${d.year}`}
                        subtitle="Algorithmic selection based on role constraints and performance"
                        color="#FFD700"
                      />
                      <GlassCard
                        sx={{
                          p: 0,
                          overflow: "hidden",
                          background:
                            "linear-gradient(180deg, rgba(16,185,129,0.05) 0%, rgba(17,24,39,0.9) 100%)",
                          borderTop: "4px solid #FFD700",
                        }}
                      >
                        <TableContainer sx={{ overflowX: "auto" }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{
                                    fontWeight: 800,
                                    color: "text.secondary",
                                  }}
                                >
                                  Role
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 800,
                                    color: "text.secondary",
                                  }}
                                >
                                  Player
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 800,
                                    color: "text.secondary",
                                    display: {
                                      xs: "none",
                                      sm: "table-cell",
                                    },
                                  }}
                                >
                                  Team
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{
                                    fontWeight: 800,
                                    color: "text.secondary",
                                  }}
                                >
                                  Key Stat
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{
                                    fontWeight: 800,
                                    color: "text.secondary",
                                  }}
                                >
                                  Score
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {d.bestXI.map((p, i) => (
                                <TableRow
                                  key={i}
                                  hover
                                  onClick={() =>
                                    navigate(`/players/${p.player.id}`)
                                  }
                                  sx={{ cursor: "pointer" }}
                                >
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      label={
                                        p.role === "Wicket-Keeper"
                                          ? "WK"
                                          : p.role
                                      }
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: "0.65rem",
                                        height: 20,
                                        bgcolor:
                                          p.role === "Batter"
                                            ? "rgba(59,130,246,0.1)"
                                            : p.role === "Bowler"
                                              ? "rgba(239,68,68,0.1)"
                                              : p.role === "All-Rounder"
                                                ? "rgba(16,185,129,0.1)"
                                                : "rgba(245,158,11,0.1)",
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      fontWeight={800}
                                    >
                                      {p.player.name}
                                      {p.isCaptain && (
                                        <Typography
                                          component="span"
                                          sx={{
                                            ml: 1,
                                            color: "#FFD700",
                                            fontWeight: 900,
                                            fontSize: "0.7rem",
                                          }}
                                        >
                                          (C)
                                        </Typography>
                                      )}
                                      {p.isViceCaptain && (
                                        <Typography
                                          component="span"
                                          sx={{
                                            ml: 1,
                                            color: "#C0C0C0",
                                            fontWeight: 900,
                                            fontSize: "0.7rem",
                                          }}
                                        >
                                          (VC)
                                        </Typography>
                                      )}
                                    </Typography>
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      display: {
                                        xs: "none",
                                        sm: "table-cell",
                                      },
                                    }}
                                  >
                                    <Chip
                                      label={p.team}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        fontWeight: 800,
                                        bgcolor: `${getFranchiseColor(p.team)}33`,
                                        color: getFranchiseColor(p.team),
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                    >
                                      {p.role === "Batter" ||
                                      p.role === "Wicket-Keeper"
                                        ? `${p.totalRuns} runs`
                                        : p.role === "Bowler"
                                          ? `${p.totalWickets} wkts`
                                          : `${p.totalRuns}r / ${p.totalWickets}w`}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      variant="body2"
                                      fontWeight={900}
                                      color="primary.main"
                                    >
                                      {p.performanceScore}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </GlassCard>
                    </Grid>
                  );
                })}
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  return (
                    <Grid item xs={12} md={6} key={`standings-${d.year}`}>
                      <SectionHeader
                        icon={GroupIcon}
                        title={`Franchise Standings (${d.year})`}
                        color="#FFD700"
                      />
                      <GlassCard sx={{ p: 0, overflow: "hidden" }}>
                        <TableContainer sx={{ overflowX: "auto" }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {[
                                  "Pos",
                                  "Franchise",
                                  "P",
                                  "W",
                                  "L",
                                  "Win %",
                                  ...(d.hasAuctionData &&
                                  (!compareMode || !compareData)
                                    ? ["Spent", "ROI"]
                                    : []),
                                ].map((h) => (
                                  <TableCell
                                    key={h}
                                    sx={{
                                      fontWeight: 800,
                                      fontSize: "0.7rem",
                                      textTransform: "uppercase",
                                      bgcolor: "rgba(17,24,39,0.95)",
                                    }}
                                  >
                                    {h}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {[...d.franchiseStandings]
                                .sort((a, b) => {
                                  const posA = a.finalPosition || 99;
                                  const posB = b.finalPosition || 99;
                                  if (posA !== posB) return posA - posB;
                                  return b.matchesWon - a.matchesWon;
                                })
                                .map((f, i) => (
                                  <TableRow
                                    key={f.franchise.id}
                                    sx={{
                                      bgcolor: f.isChampion
                                        ? "rgba(255,215,0,0.08)"
                                        : "transparent",
                                      "&:hover": {
                                        bgcolor: "rgba(99,102,241,0.08)",
                                      },
                                    }}
                                  >
                                    <TableCell>
                                      <PositionBadge
                                        position={f.finalPosition}
                                        isChampion={f.isChampion}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1.5,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 4,
                                            height: 28,
                                            borderRadius: 4,
                                            bgcolor: getFranchiseColor(
                                              f.franchise.shortName,
                                            ),
                                          }}
                                        />
                                        <Typography
                                          variant="body2"
                                          fontWeight={800}
                                        >
                                          {f.franchise.name}{" "}
                                          {f.isChampion && (
                                            <Typography
                                              component="span"
                                              sx={{
                                                ml: 1,
                                                fontSize: "0.7rem",
                                                color: "#FFD700",
                                                fontWeight: 900,
                                              }}
                                            >
                                              🏆
                                            </Typography>
                                          )}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {f.matchesPlayed}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={700}
                                        color="success.main"
                                      >
                                        {f.matchesWon}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        color="error.main"
                                      >
                                        {f.matchesLost}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          fontWeight={800}
                                        >
                                          {f.winPercentage}%
                                        </Typography>
                                        <LinearProgress
                                          variant="determinate"
                                          value={f.winPercentage}
                                          sx={{
                                            width: 40,
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: "rgba(255,255,255,0.06)",
                                            "& .MuiLinearProgress-bar": {
                                              bgcolor: getFranchiseColor(
                                                f.franchise.shortName,
                                              ),
                                              borderRadius: 3,
                                            },
                                          }}
                                        />
                                      </Box>
                                    </TableCell>
                                    {d.hasAuctionData &&
                                      (!compareMode || !compareData) && (
                                        <>
                                          <TableCell>
                                            <Typography variant="body2">
                                              ₹{Math.round(f.totalSpent)}L
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography
                                              variant="body2"
                                              fontWeight={700}
                                            >
                                              {f.roiScore?.toFixed(2)}
                                            </Typography>
                                          </TableCell>
                                        </>
                                      )}
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </GlassCard>
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  if (
                    !d.clutchPerformers ||
                    (!d.clutchPerformers.playoffBatter &&
                      !d.clutchPerformers.playoffBowler)
                  )
                    return null;
                  return (
                    <Grid
                      item
                      xs={12}
                      md={compareMode && compareData ? 6 : 12}
                      key={`clutch-${d.year}`}
                    >
                      <SectionHeader
                        icon={FlashOnIcon}
                        title={`Playoff Heroes (${d.year})`}
                        subtitle="Stepped up under the highest pressure"
                        color="#ef4444"
                      />
                      <Grid container spacing={3}>
                        {d.clutchPerformers.playoffBatter && (
                          <Grid
                            item
                            xs={12}
                            md={compareMode && compareData ? 6 : 12}
                          >
                            <GlassCard
                              sx={{
                                borderLeft: "4px solid #ef4444",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(
                                  `/players/${d.clutchPerformers.playoffBatter.player.id}`,
                                )
                              }
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                                textTransform="uppercase"
                              >
                                Playoff Run Machine
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexDirection: "column",
                                  textAlign: "center",
                                  mt: 1,
                                }}
                              >
                                <Box>
                                  <Typography variant="h5" fontWeight={900}>
                                    {
                                      d.clutchPerformers.playoffBatter.player
                                        .name
                                    }
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {d.clutchPerformers.playoffBatter.team}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography
                                    variant="h4"
                                    fontWeight={900}
                                    color="#ef4444"
                                  >
                                    {d.clutchPerformers.playoffBatter.runs}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    fontWeight={700}
                                  >
                                    Runs in Playoffs
                                  </Typography>
                                </Box>
                              </Box>
                            </GlassCard>
                          </Grid>
                        )}
                        {d.clutchPerformers.playoffBowler && (
                          <Grid
                            item
                            xs={12}
                            md={compareMode && compareData ? 6 : 12}
                          >
                            <GlassCard
                              sx={{
                                borderLeft: "4px solid #f59e0b",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(
                                  `/players/${d.clutchPerformers.playoffBowler.player.id}`,
                                )
                              }
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                                textTransform="uppercase"
                              >
                                Playoff Wicket Taker
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexDirection: "column",
                                  textAlign: "center",
                                  mt: 1,
                                }}
                              >
                                <Box>
                                  <Typography variant="h5" fontWeight={900}>
                                    {
                                      d.clutchPerformers.playoffBowler.player
                                        .name
                                    }
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {d.clutchPerformers.playoffBowler.team}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography
                                    variant="h4"
                                    fontWeight={900}
                                    color="#f59e0b"
                                  >
                                    {d.clutchPerformers.playoffBowler.wickets}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    fontWeight={700}
                                  >
                                    Wickets in Playoffs
                                  </Typography>
                                </Box>
                              </Box>
                            </GlassCard>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => (
                  <Grid
                    item
                    xs={12}
                    md={compareMode && compareData ? 6 : 12}
                    key={`awards-${d.year}`}
                  >
                    {compareMode && compareData && (
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{ mb: 2, color: "text.secondary" }}
                      >
                        IPL {d.year} Elite Awards
                      </Typography>
                    )}
                    <Grid container spacing={3}>
                      {d.seasonMvp && (
                        <Grid
                          item
                          xs={12}
                          md={compareMode && compareData ? 12 : 4}
                        >
                          <GlassCard
                            sx={{
                              cursor: "pointer",
                              background:
                                "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(17,24,39,0.8) 70%)",
                              borderLeft: "4px solid #3b82f6",
                              "&:hover": {
                                boxShadow: "0 0 32px rgba(59,130,246,0.2)",
                              },
                            }}
                            onClick={() =>
                              navigate(`/players/${d.seasonMvp.player.id}`)
                            }
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: "50%",
                                  bgcolor: "rgba(59,130,246,0.2)",
                                }}
                              >
                                <StarIcon
                                  sx={{ color: "#3b82f6", fontSize: 28 }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#3b82f6",
                                    fontWeight: 900,
                                    letterSpacing: 2,
                                  }}
                                >
                                  🌟 Season MVP
                                </Typography>
                              </Box>
                            </Box>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{ mb: 0.5 }}
                            >
                              {d.seasonMvp.player.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {d.seasonMvp.team} • {d.seasonMvp.matches} matches
                            </Typography>
                            <Box
                              sx={{
                                textAlign: "center",
                                bgcolor: "rgba(59,130,246,0.1)",
                                p: 1.5,
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="h4"
                                fontWeight={900}
                                sx={{ color: "#3b82f6" }}
                              >
                                {d.seasonMvp.performanceScore}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={700}
                              >
                                Performance Score
                              </Typography>
                            </Box>
                          </GlassCard>
                        </Grid>
                      )}

                      {d.orangeCap && (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={compareMode && compareData ? 6 : 2}
                        >
                          <GlassCard
                            sx={{
                              cursor: "pointer",
                              height: "100%",
                              background:
                                "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(17,24,39,0.8) 70%)",
                              borderLeft: "4px solid #f59e0b",
                              "&:hover": {
                                boxShadow: "0 0 32px rgba(245,158,11,0.2)",
                              },
                            }}
                            onClick={() =>
                              navigate(`/players/${d.orangeCap.player.id}`)
                            }
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: "50%",
                                  bgcolor: "rgba(245,158,11,0.2)",
                                }}
                              >
                                <EmojiEventsIcon
                                  sx={{ color: "#f59e0b", fontSize: 28 }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#f59e0b",
                                    fontWeight: 900,
                                    letterSpacing: 2,
                                  }}
                                >
                                  🧡 Orange Cap
                                </Typography>
                              </Box>
                            </Box>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{ mb: 0.5 }}
                            >
                              {d.orangeCap.player.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {d.orangeCap.team} • {d.orangeCap.innings} innings
                            </Typography>
                            <Grid container spacing={2}>
                              {[
                                {
                                  label: "Runs",
                                  value: d.orangeCap.runs,
                                  color: "#f59e0b",
                                },
                                {
                                  label: "Average",
                                  value: d.orangeCap.average?.toFixed(2),
                                  color: "#10b981",
                                },
                              ].map((s, i) => (
                                <Grid item xs={6} key={i}>
                                  <Box sx={{ textAlign: "center" }}>
                                    <Typography
                                      variant="h6"
                                      fontWeight={900}
                                      sx={{ color: s.color }}
                                    >
                                      {s.value}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      fontWeight={700}
                                    >
                                      {s.label}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </GlassCard>
                        </Grid>
                      )}

                      {d.purpleCap && (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={compareMode && compareData ? 6 : 2}
                        >
                          <GlassCard
                            sx={{
                              cursor: "pointer",
                              height: "100%",
                              background:
                                "linear-gradient(135deg, rgba(156,39,176,0.15) 0%, rgba(17,24,39,0.8) 70%)",
                              borderLeft: "4px solid #9c27b0",
                              "&:hover": {
                                boxShadow: "0 0 32px rgba(156,39,176,0.2)",
                              },
                            }}
                            onClick={() =>
                              navigate(`/players/${d.purpleCap.player.id}`)
                            }
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: "50%",
                                  bgcolor: "rgba(156,39,176,0.2)",
                                }}
                              >
                                <EmojiEventsIcon
                                  sx={{ color: "#9c27b0", fontSize: 28 }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#9c27b0",
                                    fontWeight: 900,
                                    letterSpacing: 2,
                                  }}
                                >
                                  💜 Purple Cap
                                </Typography>
                              </Box>
                            </Box>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{ mb: 0.5 }}
                            >
                              {d.purpleCap.player.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {d.purpleCap.team} • {d.purpleCap.matches} matches
                            </Typography>
                            <Grid container spacing={2}>
                              {[
                                {
                                  label: "Wickets",
                                  value: d.purpleCap.wickets,
                                  color: "#9c27b0",
                                },
                                {
                                  label: "Economy",
                                  value: d.purpleCap.economyRate?.toFixed(2),
                                  color: "#10b981",
                                },
                              ].map((s, i) => (
                                <Grid item xs={6} key={i}>
                                  <Box sx={{ textAlign: "center" }}>
                                    <Typography
                                      variant="h6"
                                      fontWeight={900}
                                      sx={{ color: s.color }}
                                    >
                                      {s.value}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      fontWeight={700}
                                    >
                                      {s.label}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </GlassCard>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                ))}
            </Grid>

            <Grid
              container
              spacing={4}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => (
                  <Grid
                    item
                    xs={12}
                    md={compareMode && compareData ? 6 : 12}
                    key={`leaderboards-${d.year}`}
                  >
                    {compareMode && compareData && (
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{ mb: 2, color: "text.secondary" }}
                      >
                        IPL {d.year} Leaderboards
                      </Typography>
                    )}
                    <Grid container spacing={3}>
                      <Grid
                        item
                        xs={12}
                        lg={compareMode && compareData ? 12 : 6}
                      >
                        <GlassCard sx={{ p: 0, overflow: "hidden" }}>
                          <Box
                            sx={{
                              p: 2.5,
                              pb: 1.5,
                              borderBottom: "1px solid rgba(148,163,184,0.08)",
                            }}
                          >
                            <SectionHeader
                              icon={SportsCricketIcon}
                              title="Top Run Scorers"
                              color="#f59e0b"
                            />
                          </Box>
                          <TableContainer sx={{ maxHeight: 440 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  {[
                                    "#",
                                    "Player",
                                    "Team",
                                    "Runs",
                                    "Avg",
                                    "SR",
                                  ].map((h) => (
                                    <TableCell
                                      key={h}
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: "0.7rem",
                                        textTransform: "uppercase",
                                        bgcolor: "rgba(17,24,39,0.95)",
                                      }}
                                    >
                                      {h}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {d.topBatters?.map((b, i) => (
                                  <TableRow
                                    key={b.player.id}
                                    hover
                                    onClick={() =>
                                      navigate(`/players/${b.player.id}`)
                                    }
                                    sx={{ cursor: "pointer" }}
                                  >
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={900}
                                      >
                                        {b.rank}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={700}
                                      >
                                        {b.player.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={b.team}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          fontWeight: 800,
                                          bgcolor: `${getFranchiseColor(b.team)}33`,
                                          color: getFranchiseColor(b.team),
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={800}
                                        color="primary.main"
                                      >
                                        {b.runs}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {b.average?.toFixed(1)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {b.strikeRate?.toFixed(1)}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </GlassCard>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        lg={compareMode && compareData ? 12 : 6}
                      >
                        <GlassCard sx={{ p: 0, overflow: "hidden" }}>
                          <Box
                            sx={{
                              p: 2.5,
                              pb: 1.5,
                              borderBottom: "1px solid rgba(148,163,184,0.08)",
                            }}
                          >
                            <SectionHeader
                              icon={WhatshotIcon}
                              title="Top Wicket Takers"
                              color="#9c27b0"
                            />
                          </Box>
                          <TableContainer sx={{ maxHeight: 440 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  {[
                                    "#",
                                    "Player",
                                    "Team",
                                    "Wkts",
                                    "Econ",
                                    "Avg",
                                  ].map((h) => (
                                    <TableCell
                                      key={h}
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: "0.7rem",
                                        textTransform: "uppercase",
                                        bgcolor: "rgba(17,24,39,0.95)",
                                      }}
                                    >
                                      {h}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {d.topBowlers?.map((b, i) => (
                                  <TableRow
                                    key={b.player.id}
                                    hover
                                    onClick={() =>
                                      navigate(`/players/${b.player.id}`)
                                    }
                                    sx={{ cursor: "pointer" }}
                                  >
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={900}
                                      >
                                        {b.rank}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={700}
                                      >
                                        {b.player.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={b.team}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          fontWeight: 800,
                                          bgcolor: `${getFranchiseColor(b.team)}33`,
                                          color: getFranchiseColor(b.team),
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={800}
                                        color="#9c27b0"
                                      >
                                        {b.wickets}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {b.economyRate?.toFixed(2)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {b.bowlingAvg?.toFixed(1)}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </GlassCard>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SeasonIntelligence;
