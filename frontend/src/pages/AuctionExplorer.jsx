import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
  Button,
  Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import * as XLSX from "xlsx";
import { useAuctionEntries, useAuctionSeasons } from "../hooks/useAuction.js";
import { auctionApi } from "../api/index.js";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import {
  FRANCHISES,
  PLAYER_ROLES,
  NATIONALITY,
  AUCTION_STATUS,
} from "../constants/index.js";

function AuctionExplorer() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    page: 1,
    limit: 25,
    season: "",
    team: "",
    role: "",
    nationality: "",
    status: AUCTION_STATUS.SOLD,
    minPrice: "",
    maxPrice: "",
    search: "",
    quickFilter: "",
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 150);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    if (searchInput.length < 2) {
      setSearchOptions([]);
      return;
    }
    (async () => {
      try {
        const res = await auctionApi.getSearchSuggestions(searchInput);
        if (active && Array.isArray(res)) {
          setSearchOptions(res);
        }
      } catch (err) {
        console.error("Failed to load suggestions", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [searchInput]);

  const { data, isLoading, isFetching } = useAuctionEntries(params);
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
        <Chip
          size="small"
          variant="outlined"
          label={row.role || row.player.role}
        />
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
            label={row.franchise.name}
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
      id: "soldPrice",
      label: "Sold For",
      align: "center",
      render: formatPrice,
    },
  ];

  const yearsCount = Array.isArray(seasons) ? seasons.length : 0;
  const minYear = yearsCount > 0 ? seasons[yearsCount - 1] : "";
  const maxYear = yearsCount > 0 ? seasons[0] : "";

  const handleExport = async () => {
    try {
      const exportParams = { ...params, limit: 10000, page: 1 };
      const response = await auctionApi.getAuctionEntries(exportParams);
      const entries = response.entries || [];

      if (entries.length === 0) return;

      const exportData = entries.map((row) => ({
        Player: row.player?.name || "",
        Nationality: row.player?.nationality || "",
        Role: row.role || row.player?.role || "",
        Season: row.season || "",
        Franchise: row.franchise?.name || "Unsold",
        "Sold Price": row.soldPrice ? row.soldPrice * 100000 : "",
        "Base Price": row.basePrice ? row.basePrice * 100000 : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Auction Data");
      XLSX.writeFile(workbook, "auction_data.xlsx");
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setParams({
      page: 1,
      limit: 25,
      season: "",
      team: "",
      role: "",
      nationality: "",
      status: AUCTION_STATUS.SOLD,
      minPrice: "",
      maxPrice: "",
      search: "",
      quickFilter: "",
    });
  };

  const hasActiveFilters =
    params.season !== "" ||
    params.team !== "" ||
    params.role !== "" ||
    params.nationality !== "" ||
    params.status !== AUCTION_STATUS.SOLD ||
    params.minPrice !== "" ||
    params.maxPrice !== "" ||
    params.search !== "" ||
    params.quickFilter !== "" ||
    searchInput !== "";

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="Auction Explorer"
        subtitle={`Dive into comprehensive historical IPL auction data.${yearsCount > 0 ? ` Exploring pricing, trends across (${minYear} - ${maxYear})` : ""}`}
      />

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
            mb: 3,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { key: "multiple_appearances", label: "Multiple Appearances (>1)" },
            { key: "counts>2", label: "Auctions > 2" },
            { key: "counts>3", label: "Auctions > 3" },
            { key: "high_rollers", label: "High Rollers (> ₹10Cr)" },
          ].map((qf) => (
            <Chip
              key={qf.key}
              label={qf.label}
              onClick={() => {
                setParams({
                  ...params,
                  quickFilter: params.quickFilter === qf.key ? "" : qf.key,
                  page: 1,
                });
              }}
              color={params.quickFilter === qf.key ? "primary" : "default"}
              variant={params.quickFilter === qf.key ? "filled" : "outlined"}
              sx={{ fontWeight: 600, borderRadius: 2 }}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box sx={{ flex: "2 1 200px" }}>
            <Autocomplete
              freeSolo
              options={searchOptions}
              inputValue={searchInput}
              filterOptions={(x) => x}
              onInputChange={(event, newInputValue) => {
                setSearchInput(newInputValue || "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="outlined"
                  placeholder="Search by player name..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: "background.paper" },
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: "1 1 120px" }}>
            <TextField
              select
              fullWidth
              label="Season"
              value={params.season}
              onChange={handleFilterChange("season")}
              sx={{ "& .MuiSelect-select": { textAlign: "center" } }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="" sx={{ justifyContent: "center" }}>
                All Seasons
              </MenuItem>
              {Array.isArray(seasons) &&
                seasons.map((s) => (
                  <MenuItem key={s} value={s} sx={{ justifyContent: "center" }}>
                    {s}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
          <Box sx={{ flex: "1 1 120px" }}>
            <TextField
              select
              fullWidth
              label="Franchise"
              value={params.team}
              onChange={handleFilterChange("team")}
              sx={{ "& .MuiSelect-select": { textAlign: "center" } }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="" sx={{ justifyContent: "center" }}>
                All Teams
              </MenuItem>
              {FRANCHISES.map((t) => (
                <MenuItem
                  key={t.key}
                  value={t.key}
                  sx={{ justifyContent: "center" }}
                >
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ flex: "1 1 120px" }}>
            <TextField
              select
              fullWidth
              label="Role"
              value={params.role}
              onChange={handleFilterChange("role")}
              sx={{ "& .MuiSelect-select": { textAlign: "center" } }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="" sx={{ justifyContent: "center" }}>
                All Roles
              </MenuItem>
              {Object.values(PLAYER_ROLES).map((r) => (
                <MenuItem key={r} value={r} sx={{ justifyContent: "center" }}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ flex: "1 1 120px" }}>
            <TextField
              select
              fullWidth
              label="Nationality"
              value={params.nationality}
              onChange={handleFilterChange("nationality")}
              sx={{ "& .MuiSelect-select": { textAlign: "center" } }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="" sx={{ justifyContent: "center" }}>
                All Origins
              </MenuItem>
              {Object.values(NATIONALITY).map((n) => (
                <MenuItem key={n} value={n} sx={{ justifyContent: "center" }}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box
            sx={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {hasActiveFilters && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                startIcon={<FilterAltOffIcon />}
                sx={{ height: 56, borderRadius: 2, px: 3 }}
              >
                Clear
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              startIcon={<FileDownloadIcon />}
              sx={{ height: 56, borderRadius: 2, px: 3 }}
            >
              Export
            </Button>
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
          opacity: isFetching && !isLoading ? 0.6 : 1,
          transition: "opacity 0.2s ease-in-out",
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
