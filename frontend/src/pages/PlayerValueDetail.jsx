import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, Chip, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { usePlayerValueBreakdown } from "../hooks/useAnalytics.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { PageSkeleton } from "../components/common/LoadingSkeleton.jsx";
import DataTable from "../components/common/DataTable.jsx";

function PlayerValueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data, isLoading } = usePlayerValueBreakdown(id);

  if (isLoading) return <PageSkeleton />;
  if (!data) return <Typography>Player not found</Typography>;

  const { player, lifetimeAnalytics, seasons } = data;

  const chartData = seasons.map((s) => ({
    season: s.season,
    score: Math.round(s.valueScore),
  }));

  const columns = [
    {
      id: "season",
      label: "Season",
      render: (val, row) => `${val} (${row.team})`,
    },
    {
      id: "battingContribution",
      label: "Batting Value",
      render: (val) => Math.round(val),
    },
    {
      id: "bowlingContribution",
      label: "Bowling Value",
      render: (val) => Math.round(val),
    },
    {
      id: "consistencyContribution",
      label: "Consistency",
      render: (val) => Math.round(val),
    },
    {
      id: "awardContribution",
      label: "Awards",
      render: (val) => Math.round(val),
    },
    {
      id: "valueScore",
      label: "Total Value",
      render: (val) => (
        <Typography fontWeight={700} color="primary">
          {Math.round(val)}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {player.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {player.role} • {player.nationality}
          </Typography>
        </Box>
        <Box sx={{ ml: "auto", textAlign: "right" }}>
          <Typography variant="overline" color="text.secondary">
            Lifetime Value
          </Typography>
          <Typography variant="h3" fontWeight={800} color="primary.main">
            {Math.round(lifetimeAnalytics?.lifetimeValueScore || 0)}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
              Value Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="season"
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 8,
                    }}
                    formatter={(value) => [`${value} IQ`, "Value Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Season Breakdown
      </Typography>
      <DataTable columns={columns} data={seasons} onRowClick={(row) => {}} />
    </Box>
  );
}

export default PlayerValueDetail;
