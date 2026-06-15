import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAuctionEntries, useAuctionSeasons } from "../hooks/useAuction.js";
import DataTable from "../components/common/DataTable.jsx";
import { FRANCHISES, PLAYER_ROLES, NATIONALITY, AUCTION_STATUS } from "../constants/index.js";

function AuctionExplorer() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    page: 1,
    limit: 25,
    season: "",
    team: "",
    role: "",
    nationality: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });

  const { data, isLoading } = useAuctionEntries(params);
  const { data: seasons } = useAuctionSeasons();

  const handleFilterChange = (field) => (e) => {
    setParams({ ...params, [field]: e.target.value, page: 1 });
  };

  const formatPrice = (val) => {
    if (!val) return "—";
    if (val >= 100) {
      return `₹${parseFloat((val / 100).toFixed(2))}Cr`;
    }
    return `₹${val}L`;
  };

  const columns = [
    {
      id: "player",
      label: "Player",
      align: "center",
      render: (_, row) => (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            {row.player.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.player.nationality}
          </Typography>
        </Box>
      ),
    },
    {
      id: "role",
      label: "Role",
      align: "center",
      render: (_, row) => (
        <Chip size="small" variant="outlined" label={row.player.role} />
      ),
    },
    { id: "season", label: "Season", align: "center" },
    {
      id: "team",
      label: "Franchise",
      align: "center",
      render: (_, row) =>
        row.franchise ? (
          <Chip
            size="small"
            label={row.franchise.shortName}
            sx={{
              bgcolor: row.franchise.color,
              color: "#fff",
              fontWeight: 600,
              minWidth: 60,
            }}
          />
        ) : (
          "—"
        ),
    },
    {
      id: "status",
      label: "Status",
      align: "center",
      render: (val) => (
        <Typography
          variant="body2"
          fontWeight={600}
          color={val === "Unsold" ? "error.main" : "success.main"}
        >
          {val}
        </Typography>
      ),
    },
    {
      id: "soldPrice",
      label: "Sold For",
      align: "center",
      render: formatPrice,
    },
  ];

  const yearsCount = Array.isArray(seasons) ? seasons.length : 0;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ textAlign: "center", mb: 5, mt: 2 }}>
        <Typography
          variant="h3"
          fontWeight={900}
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            background: "linear-gradient(90deg, #1976d2, #9c27b0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Auction Explorer
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto", mb: 1 }}
        >
          Dive into comprehensive historical IPL auction data.
          {yearsCount > 0 &&
            ` Exploring pricing, trends, and franchise strategies across ${yearsCount} years of auction history.`}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
            gap: 3,
          }}
        >
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by player name..."
              value={params.search}
              onChange={handleFilterChange("search")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            />
          </Box>
          <Box>
            <TextField
              select
              fullWidth
              label="Season"
              value={params.season}
              onChange={handleFilterChange("season")}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="">All Seasons</MenuItem>
              {Array.isArray(seasons) &&
                seasons.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
          <Box>
            <TextField
              select
              fullWidth
              label="Franchise"
              value={params.team}
              onChange={handleFilterChange("team")}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="">All Teams</MenuItem>
              {FRANCHISES.map((t) => (
                <MenuItem key={t.key} value={t.key}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box>
            <TextField
              select
              fullWidth
              label="Role"
              value={params.role}
              onChange={handleFilterChange("role")}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="">All Roles</MenuItem>
              {Object.values(PLAYER_ROLES).map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box>
            <TextField
              select
              fullWidth
              label="Nationality"
              value={params.nationality}
              onChange={handleFilterChange("nationality")}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="">All Origins</MenuItem>
              {Object.values(NATIONALITY).map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box>
            <TextField
              select
              fullWidth
              label="Status"
              value={params.status}
              onChange={handleFilterChange("status")}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {Object.values(AUCTION_STATUS).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box>
            <TextField
              type="number"
              fullWidth
              label="Min Price (Lakhs)"
              value={params.minPrice}
              onChange={handleFilterChange("minPrice")}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            />
          </Box>
          <Box>
            <TextField
              type="number"
              fullWidth
              label="Max Price (Lakhs)"
              value={params.maxPrice}
              onChange={handleFilterChange("maxPrice")}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            />
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        }}
      >
        <DataTable
          columns={columns}
          data={data?.entries}
          isLoading={isLoading}
          total={data?.pagination?.total}
          page={params.page}
          limit={params.limit}
          onPageChange={(p) => setParams({ ...params, page: p })}
          onLimitChange={(l) => setParams({ ...params, limit: l, page: 1 })}
          onRowClick={(row) => navigate(`/players/${row.player.id}`)}
        />
      </Paper>
    </Box>
  );
}

export default AuctionExplorer;
