import { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  useGreatestPurchases,
  useBiggestBargains,
  useBiggestDisasters,
} from "../hooks/useRanking.js";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import StarIcon from "@mui/icons-material/Star";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

function CostDisplay({ cost }) {
  if (cost >= 100) {
    return (
      <Typography fontWeight={600} color="secondary.light">
        ₹{(cost / 100).toFixed(2)} Cr
      </Typography>
    );
  }
  return (
    <Typography fontWeight={600} color="secondary.light">
      ₹{cost}L
    </Typography>
  );
}

function StatusChip({ status }) {
  if (status === "PLAYED")
    return (
      <Chip label="Played" size="small" color="success" variant="outlined" />
    );
  return <Chip label={status} size="small" color="error" variant="filled" />;
}

export default function BestPurchases() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 25,
    season: "",
    team: "",
  });

  const greatestData = useGreatestPurchases(params, { enabled: tab === 0 });
  const eliteBargainData = useBiggestBargains(
    { ...params, type: "elite" },
    { enabled: tab === 1 },
  );
  const breakoutBargainData = useBiggestBargains(
    { ...params, type: "breakout" },
    { enabled: tab === 2 },
  );
  const disasterData = useBiggestDisasters(params, { enabled: tab === 3 });

  const commonColumns = [
    {
      id: "rank",
      label: "Rank",
      render: (val) => (
        <Typography fontWeight={800} color="primary">
          #{val}
        </Typography>
      ),
    },
    {
      id: "player",
      label: "Player",
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={700}>
            {row.playerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.team}
          </Typography>
        </Box>
      ),
    },
    { id: "season", label: "Season" },
    {
      id: "franchise",
      label: "Franchise",
      render: (_, row) => <Typography fontWeight={600}>{row.team}</Typography>,
    },
    {
      id: "cost",
      label: "Cost",
      render: (_, row) => (
        <Box>
          <CostDisplay cost={row.cost} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            {row.costPercentage} of Cap
          </Typography>
        </Box>
      ),
    },
    {
      id: "matches",
      label: "Matches",
      render: (val) => <Typography fontWeight={500}>{val}</Typography>,
    },
    {
      id: "confidence",
      label: "Confidence",
      render: (val) => (
        <Chip
          label={val}
          size="small"
          color={val === "High" ? "success" : "warning"}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: "0.7rem" }}
        />
      ),
    },
    {
      id: "performanceScore",
      label: "Role-Adjusted Perf",
      render: (val, row) => (
        <Tooltip
          title={
            <Box>
              <Typography variant="caption" display="block">
                Batting Impact: {row.battingImpact}
              </Typography>
              <Typography variant="caption" display="block">
                Bowling Impact: {row.bowlingImpact}
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          <Typography
            sx={{
              textDecoration: "underline",
              textDecorationStyle: "dotted",
              cursor: "help",
            }}
          >
            {val}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: "valueScore",
      label: "True Value Score",
      render: (val) => (
        <Typography fontWeight={800} color="success.main">
          {val}
        </Typography>
      ),
    },
  ];

  const greatestCols = [
    ...commonColumns,
    {
      id: "greatestScore",
      label: "Auction Impact Score",
      render: (val, row) => (
        <Tooltip
          title={`Includes ${row.longevityBonus} Longevity Bonus`}
          TransitionComponent={Zoom}
        >
          <Typography fontWeight={900} color="warning.main">
            {val}{" "}
            <StarIcon sx={{ fontSize: 14, verticalAlign: "middle", mb: 0.5 }} />
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: "why",
      label: "Summary",
      render: (val) => (
        <Typography variant="caption" color="text.secondary">
          {val}
        </Typography>
      ),
    },
  ];

  const bargainCols = [
    ...commonColumns,
    {
      id: "why",
      label: "Summary",
      render: (val) => (
        <Typography variant="caption" color="text.secondary">
          {val}
        </Typography>
      ),
    },
  ];

  const disasterCols = [
    {
      id: "rank",
      label: "Rank",
      render: (val) => (
        <Typography fontWeight={800} color="error">
          #{val}
        </Typography>
      ),
    },
    {
      id: "player",
      label: "Player",
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={700}>
            {row.playerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.team}
          </Typography>
        </Box>
      ),
    },
    { id: "season", label: "Season" },
    {
      id: "franchise",
      label: "Franchise",
      render: (_, row) => <Typography fontWeight={600}>{row.team}</Typography>,
    },
    { id: "cost", label: "Cost", render: (val) => <CostDisplay cost={val} /> },
    {
      id: "status",
      label: "Status",
      render: (val) => <StatusChip status={val} />,
    },
    {
      id: "matches",
      label: "Matches",
      render: (val) => <Typography fontWeight={500}>{val}</Typography>,
    },
    { id: "performanceScore", label: "Role-Adjusted Perf" },
    {
      id: "valueScore",
      label: "True Value Score",
      render: (val) => (
        <Typography fontWeight={800} color="error.main">
          {val}
        </Typography>
      ),
    },
    {
      id: "why",
      label: "Summary",
      render: (val) => (
        <Typography variant="caption" color="text.secondary">
          {val}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <Box mb={4}>
        <PageHeader title="FranchiseIQ Auction Analytics" />

        <Alert
          severity="success"
          sx={{
            mb: 2,
            "& .MuiAlert-message": { width: "100%" },
            borderRadius: 2,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" fontWeight={700}>
              True Auction Value Engine v2.0
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              Data Scope: 2013–2022
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ mt: 0.5, display: "block", color: "text.secondary" }}
          >
            Powered by the True Value Score algorithm. Costs are strictly
            inflation-adjusted to 2022 equivalence. Performance is normalized
            against era-specific Role Baselines. Multipliers applied for
            Championship-winning seasons and Longevity retention. Retentions and
            direct signings are excluded.
          </Typography>
        </Alert>
      </Box>

      <Paper sx={{ mb: 4, borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => {
            setTab(v);
            setParams({ ...params, page: 1, limit: 25 });
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { py: 2, fontWeight: 700, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "primary.main" },
          }}
        >
          <Tab
            icon={<EmojiEventsIcon />}
            label="Greatest Purchases"
            iconPosition="start"
          />
          <Tab
            icon={<TrendingUpIcon />}
            label="Elite Bargains"
            iconPosition="start"
          />
          <Tab
            icon={<TrendingUpIcon />}
            label="Breakout Values"
            iconPosition="start"
          />
          <Tab
            icon={<TrendingDownIcon />}
            label="Biggest Disasters"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <FilterListIcon fontSize="small" /> Filters:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Season</InputLabel>
          <Select
            value={params.season || ""}
            label="Season"
            onChange={(e) =>
              setParams({ ...params, season: e.target.value, page: 1 })
            }
          >
            <MenuItem value="">All Seasons</MenuItem>
            {[2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].map(
              (y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Franchise</InputLabel>
          <Select
            value={params.team || ""}
            label="Franchise"
            onChange={(e) =>
              setParams({ ...params, team: e.target.value, page: 1 })
            }
          >
            <MenuItem value="">All Franchises</MenuItem>
            {[
              "CSK",
              "MI",
              "RCB",
              "KKR",
              "DC",
              "PBKS",
              "RR",
              "SRH",
              "GT",
              "LSG",
              "RPSG",
              "GL",
            ].map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {(params.season || params.team) && (
          <IconButton
            size="small"
            onClick={() =>
              setParams({ ...params, season: "", team: "", page: 1 })
            }
            title="Clear Filters"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Box
        sx={{
          animation: "fadeIn 0.5s ease-in",
          "@keyframes fadeIn": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {tab === 0 && (
          <DataTable
            columns={greatestCols}
            data={greatestData.data?.rankings}
            isLoading={greatestData.isLoading}
            total={greatestData.data?.pagination?.total}
            page={params.page}
            limit={params.limit}
            onPageChange={(p) => setParams({ ...params, page: p })}
            onLimitChange={(l) => setParams({ ...params, limit: l, page: 1 })}
            onRowClick={(row) => navigate(`/players/${row.playerId}`)}
          />
        )}

        {tab === 1 && (
          <DataTable
            columns={bargainCols}
            data={eliteBargainData.data?.rankings}
            isLoading={eliteBargainData.isLoading}
            total={eliteBargainData.data?.pagination?.total}
            page={params.page}
            limit={params.limit}
            onPageChange={(p) => setParams({ ...params, page: p })}
            onLimitChange={(l) => setParams({ ...params, limit: l, page: 1 })}
            onRowClick={(row) => navigate(`/players/${row.playerId}`)}
          />
        )}

        {tab === 2 && (
          <DataTable
            columns={bargainCols}
            data={breakoutBargainData.data?.rankings}
            isLoading={breakoutBargainData.isLoading}
            total={breakoutBargainData.data?.pagination?.total}
            page={params.page}
            limit={params.limit}
            onPageChange={(p) => setParams({ ...params, page: p })}
            onLimitChange={(l) => setParams({ ...params, limit: l, page: 1 })}
            onRowClick={(row) => navigate(`/players/${row.playerId}`)}
          />
        )}

        {tab === 3 && (
          <DataTable
            columns={disasterCols}
            data={disasterData.data?.rankings}
            isLoading={disasterData.isLoading}
            total={disasterData.data?.pagination?.total}
            page={params.page}
            limit={params.limit}
            onPageChange={(p) => setParams({ ...params, page: p })}
            onLimitChange={(l) => setParams({ ...params, limit: l, page: 1 })}
            onRowClick={(row) => navigate(`/players/${row.playerId}`)}
          />
        )}
      </Box>
    </Box>
  );
}
