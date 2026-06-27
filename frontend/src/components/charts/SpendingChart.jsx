import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { ChartSkeleton } from "../common/LoadingSkeleton.jsx";

function SpendingChart({ data, isLoading }) {
  const theme = useTheme();

  if (isLoading)
    return (
      <ChartSkeleton message="Generating franchise spending distribution charts..." />
    );

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
          No spending data available
        </Typography>
      </Box>
    );
  }

  const sortedData = [...data].sort((a, b) => a.season - b.season);

  const chartData = sortedData
    .filter((d) => d.season >= 2013 && d.season <= 2022)
    .map((d) => ({
      season: d.season,
      spent: Math.round(d.totalSpent / 100),
    }));

  return (
    <Box sx={{ height: 300, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
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
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
            tickFormatter={(value) => `₹${value}Cr`}
          />
          <Tooltip
            cursor={{ fill: theme.palette.action.hover }}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              borderRadius: 8,
            }}
            formatter={(value) => [`₹${value} Crores`, "Total Spent"]}
          />
          <Bar
            dataKey="spent"
            fill={theme.palette.primary.main}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default SpendingChart;
