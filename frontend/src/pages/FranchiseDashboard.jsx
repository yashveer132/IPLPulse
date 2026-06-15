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

  const { data: franchise, isLoading: loadingFranchise } = useFranchiseById(id);
  const { data: seasons, isLoading: loadingSeasons } = useFranchiseSeasons(id, {
    enabled: !!id,
  });

  const { data: auctionSeasons } = useAuctionSeasons();
  const [selectedSeason, setSelectedSeason] = useState("");

  useEffect(() => {
    if (auctionSeasons && auctionSeasons.length > 0 && !selectedSeason) {
      setSelectedSeason(auctionSeasons[0]);
    }
  }, [auctionSeasons, selectedSeason]);

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

  if (loadingFranchise) return <CardSkeleton />;
  if (!franchise) return <Typography>Franchise not found.</Typography>;

  const stats = franchise.lifetimeStats || {};

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const seasonColumns = [
    { id: "season", label: "Season" },
    { id: "matchesWon", label: "Wins" },
    { id: "matchesLost", label: "Losses" },
    {
      id: "totalSpent",
      label: "Auction Spend",
      render: (val) => `₹${Math.round(val / 100)}Cr`,
    },
    { id: "playersBought", label: "Players Bought" },
    { id: "playersRetained", label: "Retained" },
    {
      id: "isChampion",
      label: "Result",
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
      render: (val, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: franchise.color }}>
            {row.player.name.charAt(0)}
          </Avatar>
          <Box>
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
    { id: "role", label: "Role", render: (val, row) => row.player.role },
    {
      id: "status",
      label: "Status",
      render: (val) => (
        <Chip
          size="small"
          label={val}
          color={val === "Retained" ? "primary" : "default"}
        />
      ),
    },
    {
      id: "soldPrice",
      label: "Price",
      render: (val) => `₹${Math.round(val / 100)}Cr`,
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
            p: { xs: 3, md: 6 },
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${franchise.color || "#6366f1"} 0%, #111827 100%)`,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: 900,
                border: "2px solid rgba(255,255,255,0.2)",
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
                  fontSize: { xs: "2.5rem", md: "3.75rem" },
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
                  gap: 1,
                }}
              >
                📍 {franchise.city} • 🏟️{" "}
                {franchise.homeGround || "Home Stadium"} • Est.{" "}
                {franchise.foundedYear}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<MemoryIcon />}
            iconPosition="start"
            label="Intelligence"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            icon={<PointOfSaleIcon />}
            iconPosition="start"
            label="Overview & History"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            icon={<GroupsIcon />}
            iconPosition="start"
            label="Squads & Auctions"
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <IntelligenceTab id={id} franchise={franchise} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <StatCard
              title="Total Titles"
              value={franchise.titles}
              icon={EmojiEventsIcon}
              color="#f59e0b"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard
              title="Win Rate"
              value={`${stats.winPct || 0}%`}
              color="success.main"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard
              title="Total Spend"
              value={`₹${Math.round(stats.totalSpent / 100 || 0)}Cr`}
              icon={MonetizationOnIcon}
              color="primary.main"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <StatCard title="Matches Played" value={stats.totalMatches} />
          </Grid>
        </Grid>

        {seasons && seasons.length > 0 ? (
          <>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid xs={12} md={12}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
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
                  <SpendingChart data={seasons} isLoading={loadingSeasons} />
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Historical Season Breakdown
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <DataTable
                columns={seasonColumns}
                data={seasons}
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
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ letterSpacing: "-0.01em" }}
            >
              Auction & Squad Details
            </Typography>
            {minAuctionYear && maxAuctionYear && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                We currently track detailed auction data between{" "}
                {minAuctionYear} and {maxAuctionYear}.
              </Typography>
            )}
          </Box>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Season</InputLabel>
            <Select
              value={selectedSeason}
              label="Select Season"
              onChange={(e) => setSelectedSeason(e.target.value)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {auctionSeasons?.map((year) => (
                <MenuItem key={year} value={year} sx={{ fontWeight: 600 }}>
                  IPL {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loadingSquad ? (
          <CardSkeleton />
        ) : squad && squad.length > 0 ? (
          <Grid container spacing={4}>
            <Grid xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
              >
                <Typography variant="h6" fontWeight={800} mb={3}>
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
            <Grid xs={12} md={8}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
              >
                <Typography variant="h6" fontWeight={800} mb={3}>
                  Top Acquisitions ({selectedSeason})
                </Typography>
                <Grid container spacing={2}>
                  {squad.slice(0, 3).map((purchase, idx) => (
                    <Grid xs={12} sm={4} key={purchase.id}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "background.default",
                          border: "1px solid divider",
                          textAlign: "center",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="h4"
                          fontWeight={900}
                          color={idx === 0 ? "primary.main" : "text.primary"}
                        >
                          ₹{Math.round(purchase.soldPrice / 100)}Cr
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={800} mt={1}>
                          {purchase.player.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {purchase.player.role} • {purchase.status}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            <Grid xs={12}>
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
                  }}
                >
                  <Typography variant="h6" fontWeight={800}>
                    Full Squad List
                  </Typography>
                </Box>
                <Box sx={{ overflowX: "auto" }}>
                  <DataTable
                    columns={squadColumns}
                    data={squad}
                    isLoading={loadingSquad}
                    limit={100}
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
              description={`We don't have auction or squad data for ${franchise.name} in IPL ${selectedSeason}.`}
            />
          </Paper>
        )}
      </TabPanel>
    </Box>
  );
}

export default FranchiseDashboard;
