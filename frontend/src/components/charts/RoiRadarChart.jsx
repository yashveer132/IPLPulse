import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

function RoiRadarChart({ franchises }) {
  const theme = useTheme();

  if (!franchises || franchises.length < 2) {
    return (
      <Box
        sx={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          Select at least two franchises to compare.
        </Typography>
      </Box>
    );
  }

  const maxSpend = Math.max(
    ...franchises.map((f) => f.lifetimeStats.totalSpent),
    1,
  );
  const maxTitles = Math.max(...franchises.map((f) => f.titles), 1);

  const metrics = [
    { name: "Win %", key: "winPct", norm: (f) => f.lifetimeStats.winPct },
    { name: "ROI Score", key: "roi", norm: (f) => f.lifetimeStats.avgRoiScore },
    {
      name: "Spend Efficiency",
      key: "spend",
      norm: (f) => f.lifetimeStats.avgSpendEfficiency,
    },
    {
      name: "Titles",
      key: "titles",
      norm: (f) => (f.titles / maxTitles) * 100,
    },
    {
      name: "Auction Spend",
      key: "auction",
      norm: (f) => (f.lifetimeStats.totalSpent / maxSpend) * 100,
    },
  ];

  const data = metrics.map((metric) => {
    const row = { subject: metric.name };
    franchises.forEach((f) => {
      row[f.shortName] = Math.round(metric.norm(f));
    });
    return row;
  });

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke={theme.palette.divider} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: theme.palette.text.primary,
              fontSize: window.innerWidth < 600 ? 10 : 12,
              fontWeight: 600,
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />

          {franchises.map((f, i) => (
            <Radar
              key={f.id}
              name={f.shortName}
              dataKey={f.shortName}
              stroke={
                f.color ||
                (i === 0
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main)
              }
              fill={
                f.color ||
                (i === 0
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main)
              }
              fillOpacity={0.4}
            />
          ))}

          <Legend />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              borderRadius: 8,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default RoiRadarChart;
