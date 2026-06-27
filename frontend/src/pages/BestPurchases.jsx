import { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  Tooltip,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
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
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [infoOpen, setInfoOpen] = useState(false);
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
      align: "center",
      headerAlign: "center",
      render: (val) => (
        <Typography fontWeight={800} color="primary">
          #{val}
        </Typography>
      ),
    },
    {
      id: "player",
      label: "Player",
      align: "center",
      headerAlign: "center",
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
    { id: "season", label: "Season", align: "center", headerAlign: "center" },
    {
      id: "franchise",
      label: "Franchise",
      align: "center",
      headerAlign: "center",
      render: (_, row) => <Typography fontWeight={600}>{row.team}</Typography>,
    },
    {
      id: "cost",
      label: "Cost",
      align: "center",
      headerAlign: "center",
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
      align: "center",
      headerAlign: "center",
      render: (val) => <Typography fontWeight={500}>{val}</Typography>,
    },
    {
      id: "performanceScore",
      label: "Role-Adjusted Perf",
      align: "center",
      headerAlign: "center",
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
      align: "center",
      headerAlign: "center",
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
      align: "center",
      headerAlign: "center",
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
      align: "center",
      headerAlign: "center",
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
      align: "center",
      headerAlign: "center",
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
      align: "center",
      headerAlign: "center",
      render: (val) => (
        <Typography fontWeight={800} color="error">
          #{val}
        </Typography>
      ),
    },
    {
      id: "player",
      label: "Player",
      align: "center",
      headerAlign: "center",
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
    { id: "season", label: "Season", align: "center", headerAlign: "center" },
    {
      id: "franchise",
      label: "Franchise",
      align: "center",
      headerAlign: "center",
      render: (_, row) => <Typography fontWeight={600}>{row.team}</Typography>,
    },
    {
      id: "cost",
      label: "Cost",
      align: "center",
      headerAlign: "center",
      render: (val) => <CostDisplay cost={val} />,
    },
    {
      id: "status",
      label: "Status",
      align: "center",
      headerAlign: "center",
      render: (val) => <StatusChip status={val} />,
    },
    {
      id: "matches",
      label: "Matches",
      align: "center",
      headerAlign: "center",
      render: (val) => <Typography fontWeight={500}>{val}</Typography>,
    },
    {
      id: "performanceScore",
      label: "Role-Adjusted Perf",
      align: "center",
      headerAlign: "center",
    },
    {
      id: "valueScore",
      label: "True Value Score",
      align: "center",
      headerAlign: "center",
      render: (val) => (
        <Typography fontWeight={800} color="error.main">
          {val}
        </Typography>
      ),
    },
    {
      id: "why",
      label: "Summary",
      align: "center",
      headerAlign: "center",
      render: (val) => (
        <Typography variant="caption" color="text.secondary">
          {val}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ mx: "auto", p: 2 }}>
      <PageHeader
        title="True Value Analysis"
        subtitle="Analyze player performance relative to their auction price"
      />

      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ textAlign: "center" }}
            >
              ⚙️ True Auction Value Engine v2.0
            </Typography>
          </Box>
          <IconButton
            onClick={() => setInfoOpen(false)}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Chip
              label="Data Scope: 2013 – 2022"
              color="primary"
              variant="outlined"
              sx={{ mt: 2, mb: 3, fontWeight: 700, fontSize: "0.85rem" }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.8, textAlign: "center" }}
            >
              Powered by the <strong>True Value Score</strong> algorithm. Costs
              are strictly inflation-adjusted to 2022 equivalence. Performance
              is normalized against era-specific Role Baselines. Multipliers
              applied for Championship-winning seasons and Longevity retention.
              Retentions and direct signings are excluded.
            </Typography>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {[
                {
                  label: "Inflation-Adjusted Costs",
                  desc: "All prices normalized to 2022 cap equivalence",
                },
                {
                  label: "Role-Based Baselines",
                  desc: "Season-specific medians for batting & bowling impact",
                },
                {
                  label: "Championship Multiplier",
                  desc: "1.15x bonus for title-winning season contributions",
                },
                {
                  label: "Longevity Bonus",
                  desc: "Up to 1.25x for multi-season franchise retention",
                },
              ].map((item) => (
                <Paper
                  key={item.label}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Paper
        sx={{
          mb: 4,
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => {
            setTab(v);
            setParams({ ...params, page: 1, limit: 25 });
          }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : undefined}
          allowScrollButtonsMobile={isMobile}
          centered={!isMobile}
          sx={{
            width: "100%",
            "& .MuiTab-root": { py: 2, fontWeight: 700, fontSize: "1rem" },
            "& .MuiTabs-flexContainer": { justifyContent: isMobile ? "flex-start" : "center" },
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
        <Tooltip title="How it works — Methodology & Data Scope" arrow>
          <IconButton
            onClick={() => setInfoOpen(true)}
            size="small"
            sx={{
              mr: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              gap: 0.5,
              color: "text.secondary",
              "&:hover": {
                bgcolor: "primary.main",
                color: "white",
                borderColor: "primary.main",
              },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Methodology
            </Typography>
          </IconButton>
        </Tooltip>
      </Paper>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Season</InputLabel>
          <Select
            value={params.season || ""}
            label="Season"
            onChange={(e) =>
              setParams({ ...params, season: e.target.value, page: 1 })
            }
            MenuProps={{
              PaperProps: {
                sx: { borderRadius: 2, mt: 1 },
              },
            }}
          >
            <MenuItem
              value=""
              sx={{
                justifyContent: "center",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              All Seasons
            </MenuItem>
            {[2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].map(
              (y) => (
                <MenuItem
                  key={y}
                  value={y}
                  sx={{
                    justifyContent: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
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
            MenuProps={{
              PaperProps: {
                sx: { borderRadius: 2, mt: 1 },
              },
            }}
          >
            <MenuItem
              value=""
              sx={{
                justifyContent: "center",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              All Franchises
            </MenuItem>
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
              <MenuItem
                key={t}
                value={t}
                sx={{
                  justifyContent: "center",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
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
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
          "& > *": { minWidth: 0 },
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
