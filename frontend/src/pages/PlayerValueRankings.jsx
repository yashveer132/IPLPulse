import { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePlayerValueRankings } from "../hooks/useAnalytics.js";
import DataTable from "../components/common/DataTable.jsx";

const ROLES = ["all", "batters", "bowlers", "all-rounders"];

function PlayerValueRankings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [params, setParams] = useState({ page: 1, limit: 50 });

  const role = ROLES[tab];
  const { data, isLoading } = usePlayerValueRankings({ role, ...params });

  const columns = [
    {
      id: "rank",
      label: "Rank",
      render: (val) => <Typography fontWeight={700}>#{val}</Typography>,
    },
    {
      id: "player",
      label: "Player",
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.player.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.player.role}
          </Typography>
        </Box>
      ),
    },
    {
      id: "bat",
      label: "Batting",
      render: (_, row) => Math.round(row.battingValueScore),
    },
    {
      id: "bowl",
      label: "Bowling",
      render: (_, row) => Math.round(row.bowlingValueScore),
    },
    {
      id: "cons",
      label: "Consistency",
      render: (_, row) => Math.round(row.consistencyScore),
    },
    {
      id: "total",
      label: "Value Score",
      render: (_, row) => (
        <Chip
          label={Math.round(row.lifetimeValueScore)}
          color="primary"
          sx={{ fontWeight: 800 }}
        />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Player Value Rankings
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Proprietary ranking of IPL players based on batting impact, bowling
        economy, match participation, and consistency.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => {
            setTab(v);
            setParams({ ...params, page: 1 });
          }}
        >
          <Tab label="Overall" />
          <Tab label="Batters" />
          <Tab label="Bowlers" />
          <Tab label="All-Rounders" />
        </Tabs>
      </Paper>

      <DataTable
        columns={columns}
        data={data?.players}
        isLoading={isLoading}
        onRowClick={(row) =>
          navigate(`/analytics/player-value/${row.playerId}`)
        }
        total={data?.pagination?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(p) => setParams({ ...params, page: p })}
        onLimitChange={(l) => setParams({ ...params, limit: l, page: 1 })}
      />
    </Box>
  );
}

export default PlayerValueRankings;
