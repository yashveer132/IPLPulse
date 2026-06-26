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
  KKR: "#a78bfa",
  DC: "#004C93",
  PBKS: "#ED1B24",
  RR: "#EA1A85",
  SRH: "#FF822A",
  GT: "#60a5fa",
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
      width: "100%",
      maxWidth: { xs: 360, sm: "100%" },
      mx: "auto",
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
        width: 24,
        height: 24,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: isChampion ? "#FFD700" : bg,
        color: position <= 3 ? "#000" : "text.primary",
        fontWeight: 900,
        fontSize: 11,
        boxShadow: isChampion ? "0 0 8px rgba(255, 215, 0, 0.5)" : "none",
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
      <Box sx={{ maxWidth: "100%", mx: "auto", px: 2 }}>
        <Skeleton
          variant="rectangular"
          height={80}
          sx={{ borderRadius: 4, mb: 3 }}
        />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
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

  const renderChampionCard = (year, seasonData, isCompare = false) => {
    if (!seasonData?.champion) return null;
    const isChampColor = getFranchiseColor(
      seasonData.champion.franchise.shortName,
    );
    return (
      <GlassCard
        sx={{
          p: 0,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${isChampColor}22 0%, rgba(17,24,39,0.9) 60%)`,
          borderLeft: `4px solid ${isChampColor}`,
          height: "100%",
        }}
      >
        <Box
          sx={{
            p: { xs: 2.5, md: isCompare ? 3 : 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
            flexWrap: "wrap",
            gap: 2,
            height: "100%",
            boxSizing: "border-box",
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
                bgcolor: isChampColor,
                boxShadow: `0 0 24px ${isChampColor}66`,
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 32, color: "#FFD700" }} />
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
                🏆 IPL {year} CHAMPION
              </Typography>
              <Typography
                fontWeight={900}
                sx={{
                  lineHeight: 1.1,
                  fontSize: {
                    xs: isCompare ? "1.2rem" : "1.5rem",
                    sm: isCompare ? "1.4rem" : "1.9rem",
                    md: isCompare ? "1.8rem" : "2.2rem",
                  },
                }}
              >
                {seasonData.champion.franchise.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: isCompare ? "0.75rem" : "0.85rem",
                    sm: "0.875rem",
                  },
                  wordBreak: "break-word",
                }}
              >
                Won {seasonData.champion.matchesWon} of{" "}
                {seasonData.champion.matchesPlayed} matches{" "}
                {seasonData.runnerUp &&
                  ` • Defeated ${seasonData.runnerUp.franchise.name} in the Final`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </GlassCard>
    );
  };

  const renderRunScorersTable = (d, year) => {
    return (
      <GlassCard
        sx={{
          p: 0,
          overflow: "hidden",
          alignItems: "stretch",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            p: 2.5,
            pb: 1.5,
            borderBottom: "1px solid rgba(148,163,184,0.08)",
          }}
        >
          <SectionHeader
            icon={SportsCricketIcon}
            title={`Top Run Scorers ${year ? `(${year})` : ""}`}
            color="#f59e0b"
          />
        </Box>
        <TableContainer sx={{ maxHeight: 440, overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {["#", "Player", "Team", "Runs", "Avg", "SR"].map((h) => (
                  <TableCell
                    key={h}
                    align="center"
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
                  onClick={() => navigate(`/players/${b.player.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={900}>
                      {b.rank}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700}>
                      {b.player.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
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
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      color="primary.main"
                    >
                      {b.runs}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {b.average?.toFixed(1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
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
    );
  };

  const renderWicketTakersTable = (d, year) => {
    return (
      <GlassCard
        sx={{
          p: 0,
          overflow: "hidden",
          alignItems: "stretch",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            p: 2.5,
            pb: 1.5,
            borderBottom: "1px solid rgba(148,163,184,0.08)",
          }}
        >
          <SectionHeader
            icon={WhatshotIcon}
            title={`Top Wicket Takers ${year ? `(${year})` : ""}`}
            color="#9c27b0"
          />
        </Box>
        <TableContainer sx={{ maxHeight: 440, overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {["#", "Player", "Team", "Wkts", "Econ", "Avg"].map((h) => (
                  <TableCell
                    key={h}
                    align="center"
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
                  onClick={() => navigate(`/players/${b.player.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={900}>
                      {b.rank}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700}>
                      {b.player.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
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
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      color="#9c27b0"
                    >
                      {b.wickets}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {b.economyRate?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
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
    );
  };

  return (
    <Box
      sx={{
        maxWidth: "100%",
        mx: "auto",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        width: "100%",
        overflowX: "hidden",
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ width: "100%" }}>
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
              mb: { xs: 0.5, md: 3 },
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
            {compareMode && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              p: 1.5,
              borderRadius: 3,
              bgcolor: "rgba(17, 24, 39, 0.5)",
              border: "1px solid rgba(148, 163, 184, 0.08)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
                width: { xs: "100%", md: "auto" },
              }}
            >
              <FormControlLabel
                labelPlacement="bottom"
                control={
                  <Switch
                    checked={compareMode}
                    onChange={(e) => {
                      setCompareMode(e.target.checked);
                      if (!compareYear && seasons)
                        setCompareYear(seasons.find((y) => y !== selectedYear));
                    }}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{ mt: -0.5, fontSize: "0.75rem" }}
                  >
                    Compare
                  </Typography>
                }
                sx={{
                  bgcolor: "rgba(99,102,241,0.1)",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  m: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: { xs: "100%", sm: "auto" },
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                flexGrow: 1,
                flexShrink: 1,
                width: { xs: "100%", md: 0 },
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  flexWrap: "nowrap",
                  overflowX: "auto",
                  justifyContent: "flex-start",
                  px: 2,
                  width: "100%",
                  py: 0.5,
                  "&::-webkit-scrollbar": { display: "none" },
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {seasons?.slice(0, 10).map((year) => (
                  <Chip
                    key={year}
                    label={year}
                    onClick={() => setSelectedYear(year)}
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      px: 1.5,
                      height: 38,
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
              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  flexWrap: "nowrap",
                  overflowX: "auto",
                  justifyContent: "flex-start",
                  px: 2,
                  width: "100%",
                  py: 0.5,
                  "&::-webkit-scrollbar": { display: "none" },
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {seasons?.slice(10).map((year) => (
                  <Chip
                    key={year}
                    label={year}
                    onClick={() => setSelectedYear(year)}
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      px: 1.5,
                      height: 38,
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
          </Box>
        </Box>

        {data && (
          <Box
            sx={{
              width: "100%",
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
                          align="center"
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
                            <TableCell align="center" sx={{ fontWeight: 700 }}>
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
              <Box sx={{ mb: 4, width: "100%" }}>
                {compareMode && compareData?.champion ? (
                  <Grid
                    container
                    spacing={3}
                    justifyContent="center"
                    alignItems="stretch"
                    sx={{ width: "100%", m: 0 }}
                  >
                    <Grid
                      size={{ xs: 6 }}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Box sx={{ width: "100%", height: "100%" }}>
                        {renderChampionCard(selectedYear, data, true)}
                      </Box>
                    </Grid>
                    <Grid
                      size={{ xs: 6 }}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Box sx={{ width: "100%", height: "100%" }}>
                        {renderChampionCard(compareYear, compareData, true)}
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: compareMode ? "50%" : "100%",
                      }}
                    >
                      {renderChampionCard(selectedYear, data, false)}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            <Grid
              container
              spacing={{ xs: 2, md: 4 }}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  const aw = d.seasonAwards;
                  if (!d) return null;

                  return (
                    <Grid
                      item
                      xs={12}
                      md={compareMode && compareData ? 6 : 12}
                      key={`awards-${d.year}`}
                    ></Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={{ xs: 2, md: 4 }}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {(() => {
                const hasData1 =
                  data.recordsCheck && data.recordsCheck.length > 0;
                const hasData2 =
                  compareMode &&
                  compareData &&
                  compareData.recordsCheck &&
                  compareData.recordsCheck.length > 0;

                if (!hasData1 && !hasData2) return null;

                if (compareMode && compareData) {
                  const totalBroken1 = data.recordsCheck
                    ? data.recordsCheck.filter((r) => r.isBroken).length
                    : 0;
                  const totalBroken2 = compareData.recordsCheck
                    ? compareData.recordsCheck.filter((r) => r.isBroken).length
                    : 0;

                  return (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ width: "100%", pl: { xs: 3, sm: 0 } }}>
                        <SectionHeader
                          icon={CampaignIcon}
                          title={`Records Check (${selectedYear} vs ${compareYear})`}
                          subtitle={`${totalBroken1} broken in ${selectedYear} • ${totalBroken2} broken in ${compareYear}`}
                          color="#ef4444"
                        />
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "repeat(2, 1fr)",
                              md: "repeat(4, 1fr)",
                            },
                            justifyContent: "center",
                            justifyItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          {hasData1 &&
                            data.recordsCheck.map((rec, i) => (
                              <GlassCard
                                key={`sel-${i}`}
                                sx={{
                                  borderTop: `4px solid ${rec.isBroken ? "#ef4444" : "#3b82f6"}`,
                                  p: 2,
                                  opacity: rec.isBroken ? 1 : 0.95,
                                  minHeight: 250,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  maxWidth: { xs: 360, sm: "100%" },
                                  mx: "auto",
                                  boxSizing: "border-box",
                                  bgcolor: rec.isBroken
                                    ? "rgba(239, 68, 68, 0.12)"
                                    : "rgba(30, 41, 59, 0.75)",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Box>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 1,
                                      }}
                                    >
                                      <Chip
                                        label={selectedYear}
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: "0.65rem",
                                          fontWeight: 800,
                                          bgcolor: "primary.main",
                                          color: "white",
                                        }}
                                      />
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
                                    </Box>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        textAlign: "center",
                                        gap: 0.5,
                                        mb: 1.5,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color={
                                          rec.isBroken
                                            ? "text.primary"
                                            : "text.secondary"
                                        }
                                        fontWeight={800}
                                        textTransform="uppercase"
                                        sx={{
                                          fontSize: "0.85rem",
                                          lineHeight: 1.2,
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {rec.title}
                                      </Typography>
                                    </Box>

                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.25,
                                        mt: 0.5,
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight={900}
                                        sx={{
                                          color: rec.isBroken
                                            ? "#ef4444"
                                            : "text.primary",
                                          fontSize: "1.3rem",
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        {rec.new}{" "}
                                        {rec.isBroken && (
                                          <Typography
                                            component="span"
                                            variant="caption"
                                            sx={{
                                              ml: 0.5,
                                              color: "#ef4444",
                                              fontWeight: 850,
                                              fontSize: "0.75rem",
                                            }}
                                          >
                                            (New)
                                          </Typography>
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          fontSize: "0.88rem",
                                          textDecoration: "none",
                                        }}
                                      >
                                        {rec.isBroken
                                          ? `was ${rec.old} ${rec.oldPlayer ? `(${rec.oldPlayer})` : ""}`
                                          : `(Record: ${rec.old} ${rec.oldPlayer ? `by ${rec.oldPlayer}` : ""})`}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  {rec.player && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 0.75,
                                        mt: 1.5,
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        navigate(`/players/${rec.player.id}`)
                                      }
                                    >
                                      <Avatar
                                        src={rec.player.imageUrl}
                                        sx={{ width: 22, height: 22 }}
                                      >
                                        {rec.player.name?.[0]}
                                      </Avatar>
                                      <Typography
                                        variant="caption"
                                        fontWeight={700}
                                        color="text.primary"
                                        sx={{ fontSize: "0.8rem" }}
                                      >
                                        {rec.player.name}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </GlassCard>
                            ))}

                          {hasData2 &&
                            compareData.recordsCheck.map((rec, i) => (
                              <GlassCard
                                key={`comp-${i}`}
                                sx={{
                                  borderTop: `4px solid ${rec.isBroken ? "#ef4444" : "#3b82f6"}`,
                                  p: 2,
                                  opacity: rec.isBroken ? 1 : 0.95,
                                  minHeight: 250,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  maxWidth: { xs: 360, sm: "100%" },
                                  mx: "auto",
                                  boxSizing: "border-box",
                                  bgcolor: rec.isBroken
                                    ? "rgba(239, 68, 68, 0.12)"
                                    : "rgba(30, 41, 59, 0.75)",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Box>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 1,
                                      }}
                                    >
                                      <Chip
                                        label={compareYear}
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: "0.65rem",
                                          fontWeight: 800,
                                          bgcolor: "#f59e0b",
                                          color: "white",
                                        }}
                                      />
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
                                    </Box>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        textAlign: "center",
                                        gap: 0.5,
                                        mb: 1.5,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color={
                                          rec.isBroken
                                            ? "text.primary"
                                            : "text.secondary"
                                        }
                                        fontWeight={800}
                                        textTransform="uppercase"
                                        sx={{
                                          fontSize: "0.85rem",
                                          lineHeight: 1.2,
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {rec.title}
                                      </Typography>
                                    </Box>

                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.25,
                                        mt: 0.5,
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight={900}
                                        sx={{
                                          color: rec.isBroken
                                            ? "#ef4444"
                                            : "text.primary",
                                          fontSize: "1.3rem",
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        {rec.new}{" "}
                                        {rec.isBroken && (
                                          <Typography
                                            component="span"
                                            variant="caption"
                                            sx={{
                                              ml: 0.5,
                                              color: "#ef4444",
                                              fontWeight: 850,
                                              fontSize: "0.75rem",
                                            }}
                                          >
                                            (New)
                                          </Typography>
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          fontSize: "0.88rem",
                                          textDecoration: "none",
                                        }}
                                      >
                                        {rec.isBroken
                                          ? `was ${rec.old} ${rec.oldPlayer ? `(${rec.oldPlayer})` : ""}`
                                          : `(Record: ${rec.old} ${rec.oldPlayer ? `by ${rec.oldPlayer}` : ""})`}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  {rec.player && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 0.75,
                                        mt: 1.5,
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        navigate(`/players/${rec.player.id}`)
                                      }
                                    >
                                      <Avatar
                                        src={rec.player.imageUrl}
                                        sx={{ width: 22, height: 22 }}
                                      >
                                        {rec.player.name?.[0]}
                                      </Avatar>
                                      <Typography
                                        variant="caption"
                                        fontWeight={700}
                                        color="text.primary"
                                        sx={{ fontSize: "0.8rem" }}
                                      >
                                        {rec.player.name}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </GlassCard>
                            ))}
                        </Box>
                      </Box>
                    </Grid>
                  );
                }

                const d = data;
                return (
                  <Grid size={{ xs: 12 }} key={`records-${d.year}`}>
                    <Box sx={{ width: "100%", pl: { xs: 3, sm: 0 } }}>
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
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                            lg: "repeat(5, 1fr)",
                          },
                          justifyContent: "center",
                          justifyItems: "center",
                          gap: 2,
                          width: "100%",
                        }}
                      >
                        {d.recordsCheck.map((rec, i) => (
                          <GlassCard
                            key={i}
                            sx={{
                              borderTop: `4px solid ${rec.isBroken ? "#ef4444" : "#3b82f6"}`,
                              p: 2,
                              opacity: rec.isBroken ? 1 : 0.95,
                              minHeight: 230,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              width: "100%",
                              maxWidth: { xs: 360, sm: "100%" },
                              mx: "auto",
                              boxSizing: "border-box",
                              bgcolor: rec.isBroken
                                ? "rgba(239, 68, 68, 0.12)"
                                : "rgba(30, 41, 59, 0.75)",
                            }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    gap: 0.75,
                                    mb: 1.5,
                                  }}
                                >
                                  {rec.isBroken ? (
                                    <CheckCircleIcon
                                      sx={{ color: "#ef4444", fontSize: 18 }}
                                    />
                                  ) : (
                                    <CancelIcon
                                      sx={{
                                        color: "text.secondary",
                                        fontSize: 18,
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
                                    sx={{
                                      fontSize: "0.85rem",
                                      lineHeight: 1.2,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {rec.title}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.25,
                                    mt: 0.5,
                                    textAlign: "center",
                                  }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={900}
                                    sx={{
                                      color: rec.isBroken
                                        ? "#ef4444"
                                        : "text.primary",
                                      fontSize: "1.3rem",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {rec.new}{" "}
                                    {rec.isBroken && (
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        sx={{
                                          ml: 0.5,
                                          color: "#ef4444",
                                          fontWeight: 850,
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        (New)
                                      </Typography>
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      fontSize: "0.88rem",
                                      textDecoration: "none",
                                    }}
                                  >
                                    {rec.isBroken
                                      ? `was ${rec.old} ${rec.oldPlayer ? `(${rec.oldPlayer})` : ""}`
                                      : `(Record: ${rec.old} ${rec.oldPlayer ? `by ${rec.oldPlayer}` : ""})`}
                                  </Typography>
                                </Box>
                              </Box>
                              {rec.player && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 0.75,
                                    mt: 1.5,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    navigate(`/players/${rec.player.id}`)
                                  }
                                >
                                  <Avatar
                                    src={rec.player.imageUrl}
                                    sx={{ width: 22, height: 22 }}
                                  >
                                    {rec.player.name?.[0]}
                                  </Avatar>
                                  <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    color="text.primary"
                                    sx={{ fontSize: "0.8rem" }}
                                  >
                                    {rec.player.name}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </GlassCard>
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                );
              })()}
            </Grid>

            <Grid
              container
              spacing={{ xs: 2, md: 4 }}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  if (!d.storyline) return null;
                  return (
                    <Grid size={{ xs: 12, md: 12 }} key={`storyline-${d.year}`}>
                      <Box sx={{ width: "100%" }}>
                        <SectionHeader
                          icon={MenuBookIcon}
                          title={`Season Storyline (${d.year})`}
                          subtitle="The defining extremes and moments of the year"
                          color="#f59e0b"
                        />
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "repeat(2, 1fr)",
                              md: "repeat(3, 1fr)",
                              lg: "repeat(4, 1fr)",
                            },
                            justifyContent: "center",
                            justifyItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <GlassCard
                            sx={{
                              borderTop: "3px solid #f59e0b",
                              py: 2.5,
                              px: 2,
                              minHeight: 150,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #10b981",
                              py: 2.5,
                              px: 2,
                              minHeight: 150,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #ef4444",
                              py: 2.5,
                              px: 2,
                              minHeight: 150,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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
                                variant="h6"
                                fontWeight={900}
                                sx={{
                                  mt: 0.5,
                                  color: "#8b5cf6",
                                  lineHeight: 1.2,
                                }}
                              >
                                Match Tied
                                <br />
                                (Super Over)
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #3b82f6",
                              py: 2.5,
                              px: 2,
                              minHeight: 150,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #8b5cf6",
                              py: 2.5,
                              px: 2,
                              cursor: "pointer",
                              minHeight: 150,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #d946ef",
                              py: 2.5,
                              px: 2,
                              cursor: "pointer",
                              minHeight: 150,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #a855f7",
                              py: 2.5,
                              px: 2,
                              minHeight: 150,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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
                              variant="h5"
                              fontWeight={900}
                              sx={{ mt: 0.5, color: "#a855f7" }}
                            >
                              {d.seasonMilestones?.superOvers?.length || 0}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {d.seasonMilestones?.superOvers?.length > 0 ? (
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
                                  No Super Overs
                                </Typography>
                              )}
                            </Box>
                          </GlassCard>

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #0ea5e9",
                              py: 2.5,
                              px: 2,
                              minHeight: 150,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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
                              variant="h5"
                              fontWeight={900}
                              sx={{ mt: 0.5, color: "#0ea5e9" }}
                            >
                              {d.seasonMilestones?.abandonedMatches || 0}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={700}
                              sx={{ mt: 0.5 }}
                            >
                              No Result / Washed out
                            </Typography>
                          </GlassCard>
                        </Box>

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
                                      justifyContent: "center",
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
                      </Box>
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={{ xs: 2, md: 4 }}
              sx={{ mb: 4 }}
              justifyContent="stretch"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  if (!d.trends) return null;
                  return (
                    <Grid size={{ xs: 12, md: 12 }} key={`trends-${d.year}`}>
                      <Box sx={{ width: "100%", pl: { xs: 3, sm: 0 } }}>
                        <SectionHeader
                          icon={TimelineIcon}
                          title={`Season Meta & Trends (${d.year})`}
                          subtitle="Analyzing the winning formulas"
                          color="#10b981"
                        />
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "repeat(2, 1fr)",
                              md: "repeat(4, 1fr)",
                              lg: "repeat(4, 1fr)",
                            },
                            justifyContent: "center",
                            justifyItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2.5,
                              px: 3,
                              bgcolor: "rgba(16,185,129,0.05)",
                              borderTop: "2px solid #10b981",
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: 140,
                              height: "100%",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                            >
                              AT FIRST WIN %
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#10b981"
                              sx={{ my: 0.5 }}
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

                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2.5,
                              px: 3,
                              bgcolor: "rgba(59,130,246,0.05)",
                              borderTop: "2px solid #3b82f6",
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: 140,
                              height: "100%",
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
                              sx={{ my: 0.5 }}
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

                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2.5,
                              px: 3,
                              bgcolor: "rgba(245,158,11,0.05)",
                              borderTop: "2px solid #f59e0b",
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: 140,
                              height: "100%",
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
                              sx={{ my: 0.5 }}
                            >
                              {d.trends.avgFirstInningsScore}
                            </Typography>
                            <Box />
                          </GlassCard>

                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2.5,
                              px: 3,
                              bgcolor: "rgba(139,92,246,0.05)",
                              borderTop: "2px solid #8b5cf6",
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: 140,
                              height: "100%",
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
                              sx={{ my: 0.5 }}
                            >
                              {d.trends.avgWinningScore}
                            </Typography>
                            <Box />
                          </GlassCard>

                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2.5,
                              px: 3,
                              bgcolor: "rgba(14,165,233,0.05)",
                              borderTop: "2px solid #0ea5e9",
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: 140,
                              height: "100%",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                            >
                              AVG RUNS / MATCH
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#0ea5e9"
                              sx={{ my: 0.5 }}
                            >
                              {d.overview?.totalMatches
                                ? Math.round(
                                    d.overview.totalRuns /
                                      d.overview.totalMatches,
                                  )
                                : 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {d.overview?.totalRuns?.toLocaleString()} total
                              runs
                            </Typography>
                          </GlassCard>

                          <GlassCard
                            sx={{
                              textAlign: "center",
                              py: 2.5,
                              px: 3,
                              bgcolor: "rgba(236,72,153,0.05)",
                              borderTop: "2px solid #ec4899",
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: 140,
                              height: "100%",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                            >
                              AVG SIXES / MATCH
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#ec4899"
                              sx={{ my: 0.5 }}
                            >
                              {d.overview?.totalMatches
                                ? (
                                    d.overview.totalSixes /
                                    d.overview.totalMatches
                                  ).toFixed(1)
                                : 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {d.overview?.totalSixes?.toLocaleString()} total
                              sixes
                            </Typography>
                          </GlassCard>

                          <GlassCard
                            sx={{
                              py: 2.5,
                              px: 3,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              textAlign: "center",
                              bgcolor: "rgba(16,185,129,0.05)",
                              borderTop: "2px solid #10b981",
                              gridColumn: "span 1",
                              minHeight: 140,
                              height: "100%",
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
                              sx={{ wordBreak: "break-word" }}
                            >
                              {d.trends.lowestScoringVenue?.venue}
                            </Typography>
                          </GlassCard>

                          <GlassCard
                            sx={{
                              py: 2.5,
                              px: 3,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              textAlign: "center",
                              bgcolor: "rgba(239,68,68,0.05)",
                              borderTop: "2px solid #ef4444",
                              gridColumn: "span 1",
                              minHeight: 140,
                              height: "100%",
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
                              sx={{ wordBreak: "break-word" }}
                            >
                              {d.trends.highestScoringVenue?.venue}
                            </Typography>
                          </GlassCard>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={{ xs: 2, md: 4 }}
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
                    <Grid item xs={12} md={12} key={`clutch-${d.year}`}>
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
              spacing={{ xs: 2, md: 4 }}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  if (!d.seasonMilestones) return null;
                  return (
                    <Grid item xs={12} md={12} key={`milestones-${d.year}`}>
                      <Box sx={{ width: "100%", pl: { xs: 3, sm: 0 } }}>
                        <SectionHeader
                          icon={EmojiEventsIcon}
                          title={`Season Milestones (${d.year})`}
                          subtitle="Shareable moments from the season"
                          color="#f43f5e"
                        />
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "repeat(2, 1fr)",
                              md: "repeat(4, 1fr)",
                              lg: "repeat(4, 1fr)",
                            },
                            justifyContent: "center",
                            justifyItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <GlassCard
                            sx={{
                              borderTop: "3px solid #f43f5e",
                              py: 2,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #f59e0b",
                              py: 2,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #14b8a6",
                              py: 2,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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

                          <GlassCard
                            sx={{
                              borderTop: "3px solid #d946ef",
                              py: 2,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
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
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
            </Grid>

            <Grid
              container
              spacing={{ xs: 2, md: 4 }}
              sx={{ mb: 4 }}
              justifyContent="stretch"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => {
                  return (
                    <Grid
                      size={{ xs: 12, md: 6 }}
                      key={`bestxi-${d.year}`}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      <SectionHeader
                        icon={StarIcon}
                        title={`Dominant XI of IPL ${d.year}`}
                        subtitle="Algorithmic selection based on role constraints and performance"
                        color="#FFD700"
                      />
                      <GlassCard
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          p: 0,
                          overflow: "hidden",
                          background:
                            "linear-gradient(180deg, rgba(16,185,129,0.05) 0%, rgba(17,24,39,0.9) 100%)",
                          borderTop: "4px solid #FFD700",
                        }}
                      >
                        <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
                          <Table
                            size="medium"
                            sx={{
                              "& .MuiTableCell-root": {
                                px: { xs: 0.4, sm: 0.6, md: 0.8 },
                                py: { xs: 2, sm: 2.5, md: 3 },
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.75rem",
                                  md: "0.78rem",
                                },
                              },
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: 800,
                                    color: "text.secondary",
                                  }}
                                >
                                  Role
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: 800,
                                    color: "text.secondary",
                                  }}
                                >
                                  Player
                                </TableCell>
                                <TableCell
                                  align="center"
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
                                  align="center"
                                  sx={{
                                    fontWeight: 800,
                                    color: "text.secondary",
                                  }}
                                >
                                  Key Stat
                                </TableCell>
                                <TableCell
                                  align="center"
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
                                  <TableCell align="center">
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Chip
                                        size="small"
                                        label={
                                          p.role === "Wicket-Keeper"
                                            ? "WK"
                                            : p.role
                                        }
                                        sx={{
                                          fontWeight: 800,
                                          fontSize: "0.7rem",
                                          height: 24,
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
                                    </Box>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography
                                      sx={{
                                        fontSize: "inherit",
                                        fontWeight: 800,
                                      }}
                                    >
                                      {p.player.name}
                                      {p.isCaptain && (
                                        <Typography
                                          component="span"
                                          sx={{
                                            ml: 0.5,
                                            color: "#FFD700",
                                            fontWeight: 900,
                                            fontSize: "0.75rem",
                                          }}
                                        >
                                          (C)
                                        </Typography>
                                      )}
                                      {p.isViceCaptain && (
                                        <Typography
                                          component="span"
                                          sx={{
                                            ml: 0.5,
                                            color: "#C0C0C0",
                                            fontWeight: 900,
                                            fontSize: "0.75rem",
                                          }}
                                        >
                                          (VC)
                                        </Typography>
                                      )}
                                    </Typography>
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      display: {
                                        xs: "none",
                                        sm: "table-cell",
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Chip
                                        label={p.team}
                                        size="small"
                                        sx={{
                                          height: 24,
                                          fontSize: "0.7rem",
                                          fontWeight: 800,
                                          bgcolor: `${getFranchiseColor(p.team)}33`,
                                          color: getFranchiseColor(p.team),
                                        }}
                                      />
                                    </Box>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography
                                      sx={{
                                        fontSize: "inherit",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {p.role === "Batter" ||
                                      p.role === "Wicket-Keeper"
                                        ? `${p.totalRuns} runs`
                                        : p.role === "Bowler"
                                          ? `${p.totalWickets} wkts`
                                          : `${p.totalRuns}r / ${p.totalWickets}w`}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography
                                      sx={{
                                        fontSize: "inherit",
                                        fontWeight: 900,
                                      }}
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
                    <Grid
                      size={{ xs: 12, md: 6 }}
                      key={`standings-${d.year}`}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      <SectionHeader
                        icon={GroupIcon}
                        title={`Franchise Standings (${d.year})`}
                        subtitle="Final positions, match statistics, and ROI rankings"
                        color="#FFD700"
                      />
                      <GlassCard
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          p: 0,
                          overflow: "hidden",
                          borderTop: "4px solid #FFD700",
                        }}
                      >
                        <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
                          <Table
                            size="medium"
                            sx={{
                              "& .MuiTableCell-root": {
                                px: { xs: 0.25, sm: 0.5, md: 0.75 },
                                py: { xs: 1.5, sm: 1.75, md: 2 },
                                fontSize: {
                                  xs: "0.68rem",
                                  sm: "0.72rem",
                                  md: "0.76rem",
                                },
                              },
                            }}
                          >
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
                                    align="center"
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
                                    <TableCell align="center">
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <PositionBadge
                                          position={i + 1}
                                          isChampion={f.isChampion}
                                        />
                                      </Box>
                                    </TableCell>
                                    <TableCell align="left">
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
                                          sx={{
                                            fontSize: "inherit",
                                            fontWeight: 800,
                                          }}
                                        >
                                          {f.franchise.name}{" "}
                                          {f.isChampion && (
                                            <Typography
                                              component="span"
                                              sx={{
                                                ml: 0.5,
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
                                    <TableCell align="center">
                                      <Typography sx={{ fontSize: "inherit" }}>
                                        {f.matchesPlayed}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography
                                        sx={{
                                          fontSize: "inherit",
                                          fontWeight: 700,
                                        }}
                                        color="success.main"
                                      >
                                        {f.matchesWon}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography
                                        sx={{ fontSize: "inherit" }}
                                        color="error.main"
                                      >
                                        {f.matchesLost}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            fontSize: "inherit",
                                            fontWeight: 800,
                                          }}
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
                                          <TableCell align="center">
                                            <Typography
                                              sx={{ fontSize: "inherit" }}
                                            >
                                              ₹{Math.round(f.totalSpent)}L
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="center">
                                            <Typography
                                              sx={{
                                                fontSize: "inherit",
                                                fontWeight: 700,
                                              }}
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
              spacing={{ xs: 2, md: 4 }}
              sx={{ mb: 4 }}
              justifyContent="stretch"
              alignItems="stretch"
            >
              {[data, compareMode && compareData ? compareData : null]
                .filter(Boolean)
                .map((d, dIdx) => (
                  <Grid
                    size={{ xs: 12, md: compareMode && compareData ? 6 : 12 }}
                    key={`elite-clutch-${d.year}`}
                  >
                    <Box sx={{ width: "100%" }}>
                      {!compareMode || !compareData ? (
                        <SectionHeader
                          icon={EmojiEventsIcon}
                          title={`Elite Awards & Playoff Heroes (${d.year})`}
                          subtitle="Season MVP, Cap Winners, and Top Playoff Performers"
                          color="#FFD700"
                        />
                      ) : (
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{
                            mb: 2,
                            color: "text.secondary",
                            textAlign: "center",
                          }}
                        >
                          IPL {d.year} Elite Awards & Playoff Heroes
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            compareMode && compareData
                              ? { xs: "1fr", md: "repeat(2, 1fr)" }
                              : {
                                  xs: "1fr",
                                  sm: "repeat(2, 1fr)",
                                  md: "repeat(6, 1fr)",
                                  lg: "repeat(6, 1fr)",
                                },
                          justifyContent: "center",
                          justifyItems: "center",
                          gap: 2,
                          width: "100%",
                        }}
                      >
                        {d.clutchPerformers?.playoffBatter && (
                          <GlassCard
                            sx={{
                              borderLeft: "4px solid #ef4444",
                              cursor: "pointer",
                              height: { xs: 220, sm: 280 },
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              p: { xs: 1.5, sm: 2 },
                            }}
                            onClick={() =>
                              navigate(
                                `/players/${d.clutchPerformers.playoffBatter.player.id}`,
                              )
                            }
                          >
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 1,
                                  mb: 1.5,
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#ef4444",
                                    fontWeight: 900,
                                    letterSpacing: 1.5,
                                    fontSize: "0.8rem",
                                    lineHeight: 1,
                                    textAlign: "center",
                                  }}
                                >
                                  Playoff Batter
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight={900}
                                sx={{
                                  mb: 0.5,
                                  fontSize: "1.1rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.clutchPerformers.playoffBatter.player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mb: 1.5,
                                  display: "block",
                                  fontSize: "0.8rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.clutchPerformers.playoffBatter.team}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: "100%",
                                textAlign: "center",
                                bgcolor: "rgba(239,68,68,0.1)",
                                p: 1.25,
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="h4"
                                fontWeight={900}
                                sx={{ color: "#ef4444", fontSize: "1.6rem" }}
                              >
                                {d.clutchPerformers.playoffBatter.runs}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={700}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                Runs in Playoffs
                              </Typography>
                            </Box>
                          </GlassCard>
                        )}

                        {d.clutchPerformers?.playoffBowler && (
                          <GlassCard
                            sx={{
                              borderLeft: "4px solid #f59e0b",
                              cursor: "pointer",
                              height: { xs: 220, sm: 280 },
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              p: { xs: 1.5, sm: 2 },
                            }}
                            onClick={() =>
                              navigate(
                                `/players/${d.clutchPerformers.playoffBowler.player.id}`,
                              )
                            }
                          >
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 1,
                                  mb: 1.5,
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#f59e0b",
                                    fontWeight: 900,
                                    letterSpacing: 1.5,
                                    fontSize: "0.8rem",
                                    lineHeight: 1,
                                    textAlign: "center",
                                  }}
                                >
                                  Playoff Bowler
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight={900}
                                sx={{
                                  mb: 0.5,
                                  fontSize: "1.1rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.clutchPerformers.playoffBowler.player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mb: 1.5,
                                  display: "block",
                                  fontSize: "0.8rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.clutchPerformers.playoffBowler.team}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: "100%",
                                textAlign: "center",
                                bgcolor: "rgba(245,158,11,0.1)",
                                p: 1.25,
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="h4"
                                fontWeight={900}
                                sx={{ color: "#f59e0b", fontSize: "1.6rem" }}
                              >
                                {d.clutchPerformers.playoffBowler.wickets}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={700}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                Wickets in Playoffs
                              </Typography>
                            </Box>
                          </GlassCard>
                        )}

                        {d.seasonMvp && (
                          <GlassCard
                            sx={{
                              cursor: "pointer",
                              background:
                                "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(17,24,39,0.8) 70%)",
                              borderLeft: "4px solid #3b82f6",
                              "&:hover": {
                                boxShadow: "0 0 32px rgba(59,130,246,0.2)",
                              },
                              height: { xs: 220, sm: 280 },
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              p: { xs: 1.5, sm: 2 },
                            }}
                            onClick={() =>
                              navigate(`/players/${d.seasonMvp.player.id}`)
                            }
                          >
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 1,
                                  mb: 1.5,
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#3b82f6",
                                    fontWeight: 900,
                                    letterSpacing: 1.5,
                                    fontSize: "0.8rem",
                                    lineHeight: 1,
                                    textAlign: "center",
                                  }}
                                >
                                  Season MVP
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight={900}
                                sx={{
                                  mb: 0.5,
                                  fontSize: "1.1rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.seasonMvp.player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mb: 1.5,
                                  display: "block",
                                  fontSize: "0.8rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.seasonMvp.team} • {d.seasonMvp.matches}{" "}
                                matches
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: "100%",
                                textAlign: "center",
                                bgcolor: "rgba(59,130,246,0.1)",
                                p: 1.25,
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="h4"
                                fontWeight={900}
                                sx={{ color: "#3b82f6", fontSize: "1.6rem" }}
                              >
                                {d.seasonMvp.performanceScore}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={700}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                Performance Score
                              </Typography>
                            </Box>
                          </GlassCard>
                        )}

                        {d.orangeCap && (
                          <GlassCard
                            sx={{
                              cursor: "pointer",
                              height: { xs: 220, sm: 280 },
                              width: "100%",
                              background:
                                "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(17,24,39,0.8) 70%)",
                              borderLeft: "4px solid #f59e0b",
                              "&:hover": {
                                boxShadow: "0 0 32px rgba(245,158,11,0.2)",
                              },
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              p: { xs: 1.5, sm: 2 },
                            }}
                            onClick={() =>
                              navigate(`/players/${d.orangeCap.player.id}`)
                            }
                          >
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 1,
                                  mb: 1.5,
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#f59e0b",
                                    fontWeight: 900,
                                    letterSpacing: 1.5,
                                    fontSize: "0.8rem",
                                    lineHeight: 1,
                                    textAlign: "center",
                                  }}
                                >
                                  Orange Cap
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight={900}
                                sx={{
                                  mb: 0.5,
                                  fontSize: "1.1rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.orangeCap.player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mb: 1.5,
                                  display: "block",
                                  fontSize: "0.8rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.orangeCap.team} • {d.orangeCap.innings} inn
                              </Typography>
                            </Box>
                            <Box
                              sx={{ display: "flex", gap: 1, width: "100%" }}
                            >
                              {[
                                {
                                  label: "Runs",
                                  value: d.orangeCap.runs,
                                  color: "#f59e0b",
                                },
                                {
                                  label: "Avg",
                                  value: d.orangeCap.average?.toFixed(1),
                                  color: "#10b981",
                                },
                              ].map((s, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    flex: 1,
                                    textAlign: "center",
                                    bgcolor: `${s.color}15`,
                                    borderRadius: 1,
                                    p: 0.75,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={900}
                                    sx={{ color: s.color, fontSize: "0.95rem" }}
                                  >
                                    {s.value}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                    sx={{ fontSize: "0.7rem" }}
                                  >
                                    {s.label}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </GlassCard>
                        )}

                        {d.purpleCap && (
                          <GlassCard
                            sx={{
                              cursor: "pointer",
                              height: { xs: 220, sm: 280 },
                              width: "100%",
                              background:
                                "linear-gradient(135deg, rgba(156,39,176,0.15) 0%, rgba(17,24,39,0.8) 70%)",
                              borderLeft: "4px solid #9c27b0",
                              "&:hover": {
                                boxShadow: "0 0 32px rgba(156,39,176,0.2)",
                              },
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              p: { xs: 1.5, sm: 2 },
                            }}
                            onClick={() =>
                              navigate(`/players/${d.purpleCap.player.id}`)
                            }
                          >
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 1,
                                  mb: 1.5,
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: "#9c27b0",
                                    fontWeight: 900,
                                    letterSpacing: 1.5,
                                    fontSize: "0.8rem",
                                    lineHeight: 1,
                                    textAlign: "center",
                                  }}
                                >
                                  Purple Cap
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight={900}
                                sx={{
                                  mb: 0.5,
                                  fontSize: "1.1rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.purpleCap.player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mb: 1.5,
                                  display: "block",
                                  fontSize: "0.8rem",
                                  textAlign: "center",
                                }}
                                noWrap
                              >
                                {d.purpleCap.team} • {d.purpleCap.matches}{" "}
                                matches
                              </Typography>
                            </Box>
                            <Box
                              sx={{ display: "flex", gap: 1, width: "100%" }}
                            >
                              {[
                                {
                                  label: "Wkts",
                                  value: d.purpleCap.wickets,
                                  color: "#9c27b0",
                                },
                                {
                                  label: "Econ",
                                  value: d.purpleCap.economyRate?.toFixed(2),
                                  color: "#10b981",
                                },
                              ].map((s, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    flex: 1,
                                    textAlign: "center",
                                    bgcolor: `${s.color}15`,
                                    borderRadius: 1,
                                    p: 0.75,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={900}
                                    sx={{ color: s.color, fontSize: "0.95rem" }}
                                  >
                                    {s.value}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={700}
                                    sx={{ fontSize: "0.7rem" }}
                                  >
                                    {s.label}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </GlassCard>
                        )}

                        {(() => {
                          const award =
                            d.seasonAwards?.finisher ||
                            d.seasonAwards?.economyKing ||
                            d.seasonAwards?.enforcer;
                          if (!award) return null;
                          const isFinisher = award === d.seasonAwards?.finisher;
                          const isEconomy =
                            award === d.seasonAwards?.economyKing;

                          return (
                            <GlassCard
                              sx={{
                                cursor: "pointer",
                                height: { xs: 220, sm: 280 },
                                width: "100%",
                                background: isFinisher
                                  ? "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(17,24,39,0.8) 70%)"
                                  : isEconomy
                                    ? "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(17,24,39,0.8) 70%)"
                                    : "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(17,24,39,0.8) 70%)",
                                borderLeft: isFinisher
                                  ? "4px solid #10b981"
                                  : isEconomy
                                    ? "4px solid #0ea5e9"
                                    : "4px solid #ec4899",
                                "&:hover": {
                                  boxShadow: isFinisher
                                    ? "0 0 32px rgba(16,185,129,0.2)"
                                    : isEconomy
                                      ? "0 0 32px rgba(14,165,233,0.2)"
                                      : "0 0 32px rgba(236,72,153,0.2)",
                                },
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                p: { xs: 1.5, sm: 2 },
                              }}
                              onClick={() =>
                                navigate(`/players/${award.player.id}`)
                              }
                            >
                              <Box sx={{ width: "100%", textAlign: "center" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                    mb: 1.5,
                                    width: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="overline"
                                    sx={{
                                      color: isFinisher
                                        ? "#10b981"
                                        : isEconomy
                                          ? "#0ea5e9"
                                          : "#ec4899",
                                      fontWeight: 900,
                                      letterSpacing: 1.5,
                                      fontSize: "0.8rem",
                                      lineHeight: 1,
                                      textAlign: "center",
                                    }}
                                  >
                                    {isFinisher
                                      ? "Finisher Award"
                                      : isEconomy
                                        ? "Economy King"
                                        : "Enforcer Award"}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={900}
                                  sx={{
                                    mb: 0.5,
                                    fontSize: "1.1rem",
                                    textAlign: "center",
                                  }}
                                  noWrap
                                >
                                  {award.player.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    mb: 1.5,
                                    display: "block",
                                    fontSize: "0.8rem",
                                    textAlign: "center",
                                  }}
                                  noWrap
                                >
                                  {award.team ||
                                    (isFinisher ? "Finisher" : "Bowler")}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  width: "100%",
                                  textAlign: "center",
                                  bgcolor: isFinisher
                                    ? "rgba(16,185,129,0.1)"
                                    : isEconomy
                                      ? "rgba(14,165,233,0.1)"
                                      : "rgba(236,72,153,0.1)",
                                  p: 1.25,
                                  borderRadius: 2,
                                }}
                              >
                                <Typography
                                  variant="h4"
                                  fontWeight={900}
                                  sx={{
                                    color: isFinisher
                                      ? "#10b981"
                                      : isEconomy
                                        ? "#0ea5e9"
                                        : "#ec4899",
                                    fontSize: "1.6rem",
                                  }}
                                >
                                  {isFinisher
                                    ? `${award.strikeRate}% SR`
                                    : isEconomy
                                      ? `${award.economyRate?.toFixed(2)} Econ`
                                      : `${award.topOrderWickets} Wkts`}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={700}
                                  sx={{ fontSize: "0.75rem" }}
                                >
                                  {isFinisher
                                    ? `${award.deathRuns} Death Runs`
                                    : isEconomy
                                      ? `${award.totalWickets || award.wickets || 0} Season Wkts`
                                      : "Top Order Wickets"}
                                </Typography>
                              </Box>
                            </GlassCard>
                          );
                        })()}
                      </Box>
                    </Box>
                  </Grid>
                ))}
            </Grid>

            <Box sx={{ mb: 4, width: "100%" }}>
              {compareMode && compareData ? (
                <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    {renderRunScorersTable(data, selectedYear)}
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    {renderRunScorersTable(compareData, compareYear)}
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    {renderWicketTakersTable(data, selectedYear)}
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    {renderWicketTakersTable(compareData, compareYear)}
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    {renderRunScorersTable(data, selectedYear)}
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    {renderWicketTakersTable(data, selectedYear)}
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SeasonIntelligence;
