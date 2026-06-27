import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LoadingCard from "../components/common/LoadingCard.jsx";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { usePlayerValueRankings } from "../hooks/useAnalytics.js";
import { analyticsApi } from "../api/index.js";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";

const ROLES = ["all", "batters", "bowlers", "all-rounders"];

function PlayerValueRankings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = useState(0);
  const [params, setParams] = useState({ page: 1, limit: 50 });
  const [isExporting, setIsExporting] = useState(false);

  const role = ROLES[tab];
  const { data, isLoading } = usePlayerValueRankings({ role, ...params });

  if (isLoading && !data) {
    return (
      <Box sx={{ mx: "auto", p: 2 }}>
        <PageHeader
          title="Player Value Rankings"
          subtitle="Explore all-time and seasonal valuation scores for IPL players"
        />
        <LoadingCard
          title="Calculating Value Rankings"
          message="Analyzing historical salaries and player performance..."
          minHeight="60vh"
        />
      </Box>
    );
  }

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await analyticsApi.getPlayerValueRankings({
        role,
        page: 1,
        limit: 2000,
      });

      const playersToExport = res?.players || [];
      if (playersToExport.length === 0) {
        alert("No data available to export");
        return;
      }

      const csvHeaders = [
        "Rank",
        "Player Name",
        "Role",
        "Batting Value Score",
        "Bowling Value Score",
        "Normalized Value Score",
      ];

      const csvRows = playersToExport.map((row) => {
        const displayScore = Math.round(row.lifetimeValueScore);
        return [
          row.rank,
          `"${row.player.name.replace(/"/g, '""')}"`,
          `"${row.player.role}"`,
          Math.round(row.battingValueScore),
          Math.round(row.bowlingValueScore),
          displayScore,
        ].join(",");
      });

      const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `IPL_Player_Value_Rankings_${role.toUpperCase()}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export rankings. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      id: "rank",
      label: "Rank",
      align: "center",
      headerAlign: "center",
      render: (val) => {
        let rankColor = "text.primary";
        let rankBg = "transparent";
        if (val === 1) {
          rankColor = "#FFE000";
          rankBg = "rgba(255, 224, 0, 0.15)";
        } else if (val === 2) {
          rankColor = "#C0C0C0";
          rankBg = "rgba(192, 192, 192, 0.15)";
        } else if (val === 3) {
          rankColor = "#CD7F32";
          rankBg = "rgba(205, 127, 50, 0.15)";
        }
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: rankBg,
              color: rankColor,
              fontWeight: 800,
            }}
          >
            {val}
          </Box>
        );
      },
    },
    {
      id: "player",
      label: "Player",
      align: "center",
      headerAlign: "center",
      render: (_, row) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" fontWeight={750} color="text.primary">
            {row.player.name}
          </Typography>
          <Chip
            label={row.player.role}
            size="small"
            sx={{
              fontSize: "0.65rem",
              height: 16,
              mt: 0.5,
              fontWeight: 700,
              bgcolor: "action.hover",
              color: "text.secondary",
            }}
          />
        </Box>
      ),
    },
    {
      id: "bat",
      label: isXs ? "Batting" : "Batting Value",
      align: "center",
      headerAlign: "center",
      render: (_, row) => (
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {Math.round(row.battingValueScore)}
        </Typography>
      ),
    },
    {
      id: "bowl",
      label: isXs ? "Bowling" : "Bowling Value",
      align: "center",
      headerAlign: "center",
      render: (_, row) => (
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {Math.round(row.bowlingValueScore)}
        </Typography>
      ),
    },
    {
      id: "total",
      label: isXs ? "Score" : "Value Score",
      align: "center",
      headerAlign: "center",
      render: (_, row) => {
        const displayScore = Math.round(row.lifetimeValueScore);
        let chipBg = "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)";
        if (row.rank === 1 || displayScore >= 93) {
          chipBg = "linear-gradient(135deg, #FFE000 0%, #799F0C 100%)";
        } else if (displayScore >= 80) {
          chipBg = "linear-gradient(135deg, #F000FF 0%, #7B00FF 100%)";
        }
        return (
          <Chip
            label={displayScore}
            sx={{
              fontWeight: 900,
              background: chipBg,
              color: "#fff",
              px: 1.5,
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Player Valuation Index"
        subtitle="Proprietary metric measuring overall player impact on a 100-point scale"
      />

      <Paper
        sx={{
          mb: 4,
          bgcolor: "background.paper",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          p: { xs: 2, md: 0 },
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => {
            setTab(v);
            setParams({ ...params, page: 1 });
          }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : undefined}
          allowScrollButtonsMobile={isMobile ? true : undefined}
          centered={!isMobile}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            width: "100%",
            "& .MuiTab-root": {
              fontWeight: 700,
              textTransform: "none",
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              py: 2,
              minWidth: { xs: 100, sm: 120 },
            },
          }}
        >
          <Tab label="Overall Rankings" />
          <Tab label="Batters" />
          <Tab label="Bowlers" />
          <Tab label="All-Rounders" />
        </Tabs>

        <Button
          variant="contained"
          color="primary"
          startIcon={
            isExporting ? (
              <LoadingCard compact size="small" transparent message="" />
            ) : (
              <FileDownloadIcon />
            )
          }
          onClick={handleExport}
          disabled={isExporting || isLoading}
          sx={{
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2,
            px: 2.5,
            py: 1,
            position: { xs: "static", md: "absolute" },
            right: { md: 16 },
            top: { md: "50%" },
            transform: { md: "translateY(-50%)" },
            mt: { xs: 2, md: 0 },
            width: { xs: "100%", md: "auto" },
          }}
        >
          {isExporting ? "Exporting..." : "Export to Excel"}
        </Button>
      </Paper>

      <DataTable
        columns={columns}
        data={data?.players}
        isLoading={isLoading}
        loadingMessage="Compiling player value score rankings..."
        onRowClick={(row) =>
          navigate(`/analytics/player-value/${row.playerId}`)
        }
        total={data?.pagination?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(p) => setParams({ ...params, page: p })}
        onLimitChange={(l) => setParams({ ...params, limit: l, page: 1 })}
        minWidth={isXs ? 340 : 450}
      />
    </Box>
  );
}

export default PlayerValueRankings;
