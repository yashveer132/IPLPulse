import { useParams } from "react-router-dom";
import { Box, Typography, Grid, Chip, Paper } from "@mui/material";
import { usePlayerById, usePlayerStats } from "../hooks/usePlayer.js";
import { CardSkeleton } from "../components/common/LoadingSkeleton.jsx";
import PerformanceChart from "../components/charts/PerformanceChart.jsx";
import DataTable from "../components/common/DataTable.jsx";
import { useState, useEffect } from "react";
import { apiClient } from "../api/index.js";

function PlayerProfile() {
  const { id } = useParams();
  const { data: player, isLoading: loadingPlayer } = usePlayerById(id);
  const { data: stats, isLoading: loadingStats } = usePlayerStats(id);

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
  if (!player) return <Typography align="center">Player not found.</Typography>;

  const isBowler = player.role.includes("Bowl");

  const formatPrice = (price, isBase = false) => {
    if (price === undefined || price === null) return "-";
    const suffix = isBase ? " (Base)" : "";
    if (price >= 100) {
      const crValue = (price / 100).toFixed(2).replace(/\.?0+$/, "");
      return `₹${crValue} Cr${suffix}`;
    }
    return `₹${price}L${suffix}`;
  };

  const historyColumns = [
    { id: "season", label: "Season", align: "center" },
    {
      id: "team",
      label: "Team",
      align: "center",
      render: (_, row) => row.franchise?.name || "Unsold",
    },
    {
      id: "price",
      label: "Price",
      align: "center",
      render: (_, row) =>
        row.soldPrice
          ? formatPrice(row.soldPrice)
          : formatPrice(row.basePrice, true),
    },
  ];

  const statsColumns = [
    { id: "season", label: "Season", align: "center" },
    { id: "team", label: "Team", align: "center" },
    { id: "matches", label: "Mat", align: "center" },
    { id: "totalRuns", label: "Runs", align: "center" },
    { id: "highestScore", label: "HS", align: "center" },
    { id: "average", label: "Avg", align: "center" },
    { id: "strikeRate", label: "SR", align: "center" },
    { id: "totalWickets", label: "Wkts", align: "center" },
    { id: "economyRate", label: "Econ", align: "center" },
    { id: "bestBowling", label: "BBI", align: "center" },
    { id: "performanceScore", label: "Perf Score", align: "center" },
  ];

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
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
            flexDirection: "column",
            gap: 1.5,
            alignItems: "center",
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h3"
            fontWeight={900}
            gutterBottom
            sx={{ letterSpacing: "-0.02em", mb: 0.5 }}
          >
            {player.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              justifyContent: "center",
              alignItems: "center",
              mx: "auto",
              width: "fit-content",
            }}
          >
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 3,
            width: "100%",
          }}
        >
          <Paper
            sx={{
              p: 2,
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
            <Typography variant="h4" fontWeight={800} color="primary.main">
              {player.career?.totalMatches || 0}
            </Typography>
          </Paper>
          <Paper
            sx={{
              p: 2,
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
            <Typography variant="h4" fontWeight={800} color="secondary.main">
              {player.career?.totalRuns || 0}
            </Typography>
          </Paper>
          <Paper
            sx={{
              p: 2,
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
            <Typography variant="h4" fontWeight={800} color="success.main">
              {player.career?.totalWickets || 0}
            </Typography>
          </Paper>
        </Box>
      </Paper>

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 2, textAlign: "center" }}
      >
        Career Highlights & Records
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(6, 1fr)",
          },
          gap: 2,
          mb: 5,
          width: "100%",
        }}
      >
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
            sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem" }, lineHeight: 1.2 }}
          >
            Highest Score
          </Typography>
          <Typography variant="h5" fontWeight={800} color="primary.main">
            {player.career?.highestScore || "-"}
          </Typography>
        </Paper>
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
            sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem" }, lineHeight: 1.2 }}
          >
            50s / 100s
          </Typography>
          <Typography variant="h5" fontWeight={800} color="secondary.main">
            {player.career?.totalFifties || 0} /{" "}
            {player.career?.totalHundreds || 0}
          </Typography>
        </Paper>
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
            sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem" }, lineHeight: 1.2 }}
          >
            Boundaries (4s/6s)
          </Typography>
          <Typography variant="h5" fontWeight={800} color="warning.main">
            {player.career?.totalFours || 0} / {player.career?.totalSixes || 0}
          </Typography>
        </Paper>
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
            sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem" }, lineHeight: 1.2 }}
          >
            Best Bowling
          </Typography>
          <Typography variant="h5" fontWeight={800} color="success.main">
            {player.career?.bestBowling || "-"}
          </Typography>
        </Paper>
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
            sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem" }, lineHeight: 1.2 }}
          >
            Catches / Stumpings
          </Typography>
          <Typography variant="h5" fontWeight={800} color="info.main">
            {player.career?.totalCatches || 0} /{" "}
            {player.career?.totalStumpings || 0}
          </Typography>
        </Paper>
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
            sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem" }, lineHeight: 1.2 }}
          >
            Player of Match
          </Typography>
          <Typography variant="h5" fontWeight={800} color="error.main">
            {player.career?.totalPom || 0}
          </Typography>
        </Paper>
      </Box>

      {crazyStats && (
        <>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2, textAlign: "center" }}
          >
            Pressure Index & Advanced Metrics
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 5,
              width: "100%",
            }}
          >
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
              <Typography variant="h5" fontWeight={800} color="secondary.main">
                {crazyStats.deathOversWickets || 0}
              </Typography>
            </Paper>
          </Box>
        </>
      )}

      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2, textAlign: "center" }}
        >
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
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2, textAlign: "center" }}
        >
          Auction History
        </Typography>
        <DataTable
          columns={historyColumns}
          data={player.auctionEntries}
          isLoading={loadingPlayer}
          limit={10}
        />
      </Box>

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 2, textAlign: "center" }}
      >
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
