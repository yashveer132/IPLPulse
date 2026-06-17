import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { usePlayerById, usePlayerStats } from "../hooks/usePlayer.js";
import { usePlayerPhoto } from "../hooks/usePlayerPhoto.js";
import {
  CardSkeleton,
  TableSkeleton,
} from "../components/common/LoadingSkeleton.jsx";
import PerformanceChart from "../components/charts/PerformanceChart.jsx";
import DataTable from "../components/common/DataTable.jsx";
import { useState, useEffect } from "react";
import { apiClient } from "../api/index.js";

function PlayerProfile() {
  const { id } = useParams();
  const { data: player, isLoading: loadingPlayer } = usePlayerById(id);
  const { data: stats, isLoading: loadingStats } = usePlayerStats(id);

  const { photoUrl, loading: photoLoading } = usePlayerPhoto(player?.name);

  const [crazyStats, setCrazyStats] = useState(null);
  useEffect(() => {
    if (id) {
      apiClient
        .get(`/analytics/crazy-stats/${id}`)
        .then((res) => setCrazyStats(res))
        .catch((err) => console.error(err));
    }
  }, [id]);

  if (loadingPlayer) return <CardSkeleton />;
  if (!player) return <Typography>Player not found.</Typography>;

  const isBowler = player.role.includes("Bowl");

  const historyColumns = [
    { id: "season", label: "Season" },
    {
      id: "team",
      label: "Team",
      render: (_, row) => row.franchise?.name || "Unsold",
    },
    { id: "status", label: "Status" },
    {
      id: "price",
      label: "Price (Lakhs)",
      render: (_, row) =>
        row.soldPrice ? `₹${row.soldPrice}L` : `₹${row.basePrice}L (Base)`,
    },
  ];

  const statsColumns = [
    { id: "season", label: "Season" },
    { id: "team", label: "Team" },
    { id: "matches", label: "Mat" },
    { id: "totalRuns", label: "Runs" },
    { id: "highestScore", label: "HS" },
    { id: "average", label: "Avg" },
    { id: "strikeRate", label: "SR" },
    { id: "totalWickets", label: "Wkts" },
    { id: "economyRate", label: "Econ" },
    { id: "bestBowling", label: "BBI" },
    { id: "performanceScore", label: "Perf Score" },
  ];

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff&size=256&font-size=0.33&bold=true`;

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 4,
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 5,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={photoUrl || fallbackAvatar}
              alt={player.name}
              sx={{
                width: 140,
                height: 140,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                border: "4px solid #fff",
              }}
            />
            {photoLoading && (
              <CircularProgress
                size={148}
                thickness={2}
                sx={{
                  position: "absolute",
                  top: -4,
                  left: -4,
                  color: "primary.light",
                  zIndex: 1,
                }}
              />
            )}
          </Box>
          <Box>
            <Typography
              variant="h2"
              fontWeight={900}
              gutterBottom
              sx={{ letterSpacing: "-0.02em", mb: 1 }}
            >
              {player.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Chip
                label={player.role}
                color="primary"
                sx={{ fontWeight: 700, px: 1 }}
              />
              <Chip
                label={player.nationality}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: "center",
                bgcolor: "background.default",
                borderRadius: 3,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing={1}
                mb={0.5}
              >
                Matches Played
              </Typography>
              <Typography variant="h3" fontWeight={800} color="primary.main">
                {player.career?.totalMatches || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: "center",
                bgcolor: "background.default",
                borderRadius: 3,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing={1}
                mb={0.5}
              >
                Career Runs
              </Typography>
              <Typography variant="h3" fontWeight={800} color="secondary.main">
                {player.career?.totalRuns || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: "center",
                bgcolor: "background.default",
                borderRadius: 3,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing={1}
                mb={0.5}
              >
                Career Wickets
              </Typography>
              <Typography variant="h3" fontWeight={800} color="success.main">
                {player.career?.totalWickets || 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Career Highlights & Records
      </Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Highest Score
            </Typography>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {player.career?.highestScore || "-"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              50s / 100s
            </Typography>
            <Typography variant="h5" fontWeight={800} color="secondary.main">
              {player.career?.totalFifties || 0} /{" "}
              {player.career?.totalHundreds || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Boundaries (4s/6s)
            </Typography>
            <Typography variant="h5" fontWeight={800} color="warning.main">
              {player.career?.totalFours || 0} /{" "}
              {player.career?.totalSixes || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Best Bowling
            </Typography>
            <Typography variant="h5" fontWeight={800} color="success.main">
              {player.career?.bestBowling || "-"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Catches / Stumpings
            </Typography>
            <Typography variant="h5" fontWeight={800} color="info.main">
              {player.career?.totalCatches || 0} /{" "}
              {player.career?.totalStumpings || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Player of Match
            </Typography>
            <Typography variant="h5" fontWeight={800} color="error.main">
              {player.career?.totalPom || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {crazyStats && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Pressure Index & Advanced Metrics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 5 }}>
            <Grid item xs={6} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Death Overs SR (16-20)
                </Typography>
                <Typography variant="h5" fontWeight={800} color="error.main">
                  {crazyStats.deathOversBallsFaced > 0
                    ? (
                        (crazyStats.deathOversRunsScored /
                          crazyStats.deathOversBallsFaced) *
                        100
                      ).toFixed(1)
                    : "-"}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Death Overs Econ
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {crazyStats.deathOversBallsBowled > 0
                    ? (
                        (crazyStats.deathOversRunsConceded /
                          crazyStats.deathOversBallsBowled) *
                        6
                      ).toFixed(1)
                    : "-"}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Powerplay Wickets
                </Typography>
                <Typography variant="h5" fontWeight={800} color="success.main">
                  {crazyStats.powerplayWickets || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Death Overs Wickets
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="secondary.main"
                >
                  {crazyStats.deathOversWickets || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Career Performance
          </Typography>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <PerformanceChart
              data={stats}
              isLoading={loadingStats}
              isBowler={isBowler}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Auction History
          </Typography>
          <DataTable
            columns={historyColumns}
            data={player.auctionEntries}
            isLoading={loadingPlayer}
            limit={10}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Season-by-Season Stats
      </Typography>
      <DataTable
        columns={statsColumns}
        data={stats}
        isLoading={loadingStats}
        limit={20}
      />
    </Box>
  );
}

export default PlayerProfile;
