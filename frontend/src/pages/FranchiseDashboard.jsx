import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";
import IntelligenceTab from "../components/franchise/IntelligenceTab.jsx";
import { motion } from "framer-motion";
import {
  useFranchiseById,
  useFranchiseSeasons,
  useFranchiseSquad,
} from "../hooks/useFranchise.js";
import { useAuctionSeasons } from "../hooks/useAuction.js";
import { CardSkeleton } from "../components/common/LoadingSkeleton.jsx";
import StatCard from "../components/common/StatCard.jsx";
import SpendingChart from "../components/charts/SpendingChart.jsx";
import DataTable from "../components/common/DataTable.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`franchise-tabpanel-${index}`}
      aria-labelledby={`franchise-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function FranchiseDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: franchise, isLoading: loadingFranchise } = useFranchiseById(id);
  const { data: seasons, isLoading: loadingSeasons } = useFranchiseSeasons(id, {
    enabled: !!id,
  });

  const filteredSeasons = useMemo(
    () => seasons?.filter((s) => s.season >= 2008 && s.season <= 2026) || [],
    [seasons],
  );

  const { data: auctionSeasons } = useAuctionSeasons();
  const [selectedSeason, setSelectedSeason] = useState("");

  useEffect(() => {
    if (!selectedSeason) {
      setSelectedSeason(2026);
    }
  }, [selectedSeason]);

  const { data: squad, isLoading: loadingSquad } = useFranchiseSquad(
    id,
    selectedSeason,
    {
      enabled: !!id && !!selectedSeason,
    },
  );

  const roleData = useMemo(() => {
    if (!squad) return [];
    const roles = {
      Batter: 0,
      Bowler: 0,
      "All-Rounder": 0,
      "Wicket-Keeper": 0,
    };
    squad.forEach((s) => {
      const r = s.player.role;
      if (roles[r] !== undefined) roles[r] += 1;
      else roles[r] = 1;
    });
    return Object.keys(roles)
      .map((k) => ({ name: k, value: roles[k] }))
      .filter((d) => d.value > 0);
  }, [squad]);

  if (loadingFranchise)
    return (
      <CardSkeleton message="Loading franchise history and analytics..." />
    );
  if (!franchise) return <Typography>Franchise not found.</Typography>;

  const stats = franchise.lifetimeStats || {};

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const seasonColumns = [
    { id: "season", label: "Season", align: "center" },
    { id: "matchesWon", label: "Wins", align: "center" },
    { id: "matchesLost", label: "Losses", align: "center" },
    {
      id: "totalSpent",
      label: "Auction Spend",
      align: "center",
      render: (val, row) => {
        if (row.season < 2013 || row.season > 2022) {
          return "—";
        }
        return `₹${Math.round(val / 100)}Cr`;
      },
    },
    {
      id: "playersBought",
      label: "Players Bought",
      align: "center",
      render: (val, row) => {
        if (row.season < 2013 || row.season > 2022) {
          return "—";
        }
        return val;
      },
    },
    {
      id: "isChampion",
      label: "Result",
      align: "center",
      render: (val) =>
        val ? (
          <Chip
            size="small"
            color="secondary"
            label="Champion"
            icon={<EmojiEventsIcon />}
          />
        ) : (
          "—"
        ),
    },
  ];

  const squadColumns = [
    {
      id: "player",
      label: "Player",
      headerAlign: "center",
      align: "left",
      render: (val, row) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "flex-start",
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: franchise.color }}>
            {row.player.name.charAt(0)}
          </Avatar>
          <Box sx={{ textAlign: "left" }}>
            <Typography variant="body2" fontWeight={800}>
              {row.player.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.player.nationality || "IND"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "role",
      label: "Role",
      align: "center",
      render: (val, row) => row.player.role,
    },
  ];

  const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b"];
  const minAuctionYear = auctionSeasons ? Math.min(...auctionSeasons) : "";
  const maxAuctionYear = auctionSeasons ? Math.max(...auctionSeasons) : "";

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            py: { xs: 2, md: 2 },
            px: { xs: 2, md: 4 },
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${franchise.color || "#6366f1"} 0%, ${franchise.color || "#6366f1"}cc 50%, ${franchise.color || "#6366f1"}99 100%)`,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: 900,
                border: "2px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              {franchise.shortName}
            </Box>
            <Box>
              <Typography
                variant="h2"
                fontWeight={900}
                gutterBottom
                sx={{
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
                }}
              >
                {franchise.name}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  fontSize: { xs: "0.85rem", sm: "1.05rem", md: "1.25rem" },
                }}
              >
                <span>📍 {franchise.city}</span>
                <span>•</span>
                <span>🏟️ {franchise.homeGround || "Home Stadium"}</span>
                <span>•</span>
                <span>Est. {franchise.foundedYear}</span>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : undefined}
          allowScrollButtonsMobile={isMobile}
          centered={!isMobile}
          sx={{ width: "100%" }}
        >
          <Tab
            icon={<MemoryIcon />}
            iconPosition="start"
            label="Intelligence"
            sx={{ fontWeight: 700, px: { xs: 2, sm: 4 } }}
          />
          <Tab
            icon={<PointOfSaleIcon />}
            iconPosition="start"
            label="Overview & History"
            sx={{ fontWeight: 700, px: { xs: 2, sm: 4 } }}
          />
          <Tab
            icon={<GroupsIcon />}
            iconPosition="start"
            label="Squads"
            sx={{ fontWeight: 700, px: { xs: 2, sm: 4 } }}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <IntelligenceTab id={id} franchise={franchise} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid
          container
          spacing={3}
          sx={{ mb: 4 }}
          justifyContent="center"
          alignItems="stretch"
        >
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <StatCard
              title="Total Titles"
              value={franchise.titles}
              icon={EmojiEventsIcon}
              color="#f59e0b"
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <StatCard
              title="Win Rate"
              value={`${stats.winPct || 0}%`}
              icon={TrendingUpIcon}
              color="success.main"
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <StatCard
              title="Total Spend (2013-2022)"
              value={`₹${Math.round(stats.totalSpent / 100 || 0)}Cr`}
              icon={MonetizationOnIcon}
              color="primary.main"
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <StatCard
              title="Matches Played"
              value={stats.totalMatches}
              icon={SportsCricketIcon}
              color="info.main"
            />
          </Grid>
        </Grid>

        {filteredSeasons && filteredSeasons.length > 0 ? (
          <>
            <Grid container spacing={4} sx={{ mb: 4 }} justifyContent="center">
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  align="center"
                  sx={{ mb: 2 }}
                >
                  Auction Spending Over Time
                </Typography>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <SpendingChart
                    data={filteredSeasons}
                    isLoading={loadingSeasons}
                  />
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight={800} align="center">
                Historical Season Breakdown
              </Typography>
              {filteredSeasons && filteredSeasons.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 0.5 }}
                >
                  Showing data from IPL{" "}
                  {filteredSeasons[filteredSeasons.length - 1].season} to IPL{" "}
                  {filteredSeasons[0].season}
                </Typography>
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 2,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Note: Auction spend and players bought are available only for the
              2013–2022 auction dataset. Other seasons display — because auction
              data is not included.
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <DataTable
                columns={seasonColumns}
                data={filteredSeasons}
                isLoading={loadingSeasons}
                limit={20}
              />
            </Box>
          </>
        ) : (
          <Paper
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: "center",
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <EmptyState
              icon={EmojiEventsIcon}
              title="Season Data Not Available"
              description="We don't have full historical match data for this franchise yet. However, auction and squad data might still be available in the 'Squads & Auctions' tab."
            />
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={900}
              align="center"
              sx={{ letterSpacing: "-0.01em" }}
            >
              Squad Details
            </Typography>
          </Box>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Season</InputLabel>
            <Select
              value={selectedSeason}
              label="Select Season"
              onChange={(e) => setSelectedSeason(e.target.value)}
              sx={{ borderRadius: 2, fontWeight: 700, textAlign: "center" }}
            >
              {Array.from({ length: 2026 - 2008 + 1 }, (_, i) => 2026 - i).map(
                (year) => (
                  <MenuItem
                    key={year}
                    value={year}
                    sx={{ fontWeight: 600, justifyContent: "center" }}
                  >
                    IPL {year}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
        </Box>

        {loadingSquad ? (
          <CardSkeleton message="Loading squad roster and purchase data..." />
        ) : squad && squad.length > 0 ? (
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="flex-start"
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
              >
                <Typography variant="h6" fontWeight={800} align="center" mb={3}>
                  Squad Composition
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 8,
                          backgroundColor: "rgba(17, 24, 39, 0.9)",
                          border: "none",
                          color: "#fff",
                        }}
                        itemStyle={{ fontWeight: 800 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: "center",
                    mt: 2,
                  }}
                >
                  {roleData.map((entry, index) => (
                    <Chip
                      key={entry.name}
                      label={`${entry.name}: ${entry.value}`}
                      size="small"
                      sx={{
                        bgcolor: `${COLORS[index % COLORS.length]}20`,
                        color: COLORS[index % COLORS.length],
                        fontWeight: 700,
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid divider",
                    bgcolor: "rgba(255,255,255,0.02)",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={800} align="center">
                    Full Squad List
                  </Typography>
                </Box>
                <Box
                  sx={{ overflowX: "auto", overflowY: "auto", maxHeight: 400 }}
                >
                  <DataTable
                    columns={squadColumns}
                    data={squad}
                    isLoading={loadingSquad}
                    limit={100}
                    minWidth="auto"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Paper
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: "center",
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <EmptyState
              icon={GroupsIcon}
              title="No Squad Data Found"
              description={`We don't have squad data for ${franchise.name} in IPL ${selectedSeason}.`}
            />
          </Paper>
        )}
      </TabPanel>
    </Box>
  );
}

export default FranchiseDashboard;
