import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { ChartSkeleton } from "../common/LoadingSkeleton.jsx";

function PerformanceChart({ data, isLoading, isBowler = false }) {
  const theme = useTheme();

  if (isLoading) return <ChartSkeleton />;

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          No performance data available
        </Typography>
      </Box>
    );
  }

  const sortedData = [...data].sort((a, b) => a.season - b.season);

  return (
    <Box sx={{ height: 300, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.divider}
            vertical={false}
          />
          <XAxis
            dataKey="season"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis
            yAxisId="left"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          {!isBowler && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary }}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              borderRadius: 8,
            }}
          />
          <Legend />

          {isBowler ? (
            <>
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalWickets"
                name="Wickets"
                stroke={theme.palette.secondary.main}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="economyRate"
                name="Economy"
                stroke={theme.palette.info.main}
                strokeWidth={2}
              />
            </>
          ) : (
            <>
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalRuns"
                name="Runs"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="strikeRate"
                name="Strike Rate"
                stroke={theme.palette.warning.main}
                strokeWidth={2}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default PerformanceChart;
