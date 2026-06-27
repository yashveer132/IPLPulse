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
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
  Collapse,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SwordsIcon from "@mui/icons-material/Hardware";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";
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

const getHistoricalTeamName = (shortName, fullName, season) => {
  if (!shortName) return fullName || "";
  const sn = shortName.toUpperCase();
  if (sn === "DC" && season < 2019) return "Delhi Daredevils";
  if (sn === "PBKS" && season < 2021) return "Kings XI Punjab";
  if (sn === "RCB" && season < 2024) return "Royal Challengers Bangalore";
  return fullName || "";
};

const getHistoricalRole = (role) => {
  if (!role) return "";
  if (role === "Batter") return "Batsman";
  if (role === "Wicket-Keeper") return "Wicket Keeper";
  return role;
};

const getFilterFranchiseName = (key, defaultName) => {
  if (key === "DC") return "Delhi Capitals (formerly Delhi Daredevils)";
  if (key === "PBKS") return "Punjab Kings (formerly Kings XI Punjab)";
  if (key === "RCB")
    return "Royal Challengers Bengaluru (formerly Royal Challengers Bangalore)";
  return defaultName;
};

function AuctionExplorer() {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const [isExporting, setIsExporting] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 450);
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

  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useAuctionEntries(params);
  const { data: seasons } = useAuctionSeasons();

  useEffect(() => {
    if (data?.pagination?.page && data?.pagination?.totalPages) {
      if (params.page < data.pagination.totalPages) {
        const nextPage = params.page + 1;
        queryClient.prefetchQuery({
          queryKey: ["auctionEntries", { ...params, page: nextPage }],
          queryFn: () =>
            auctionApi.getAuctionEntries({ ...params, page: nextPage }),
        });
      }
      if (params.page > 1) {
        const prevPage = params.page - 1;
        queryClient.prefetchQuery({
          queryKey: ["auctionEntries", { ...params, page: prevPage }],
          queryFn: () =>
            auctionApi.getAuctionEntries({ ...params, page: prevPage }),
        });
      }
    }
  }, [data, params, queryClient]);

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
          label={getHistoricalRole(row.role || row.player.role)}
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
            label={getHistoricalTeamName(
              row.franchise.shortName,
              row.franchise.name,
              row.season,
            )}
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
    setIsExporting(true);
    try {
      const exportParams = { ...params, limit: 10000, page: 1 };
      const response = await auctionApi.getAuctionEntries(exportParams);
      const entries = response.entries || [];

      if (entries.length === 0) {
        setAlertState({
          open: true,
          message: "No records found to export.",
          severity: "warning",
        });
        setIsExporting(false);
        return;
      }

      const exportData = entries.map((row) => ({
        Player: row.player?.name || "",
        Nationality: row.player?.nationality || "",
        Role: getHistoricalRole(row.role || row.player?.role),
        Season: row.season || "",
        Franchise: row.franchise
          ? getHistoricalTeamName(
              row.franchise.shortName,
              row.franchise.name,
              row.season,
            )
          : "Unsold",
        "Sold Price": row.soldPrice ? row.soldPrice * 100000 : "",
        "Base Price": row.basePrice ? row.basePrice * 100000 : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Auction Data");
      XLSX.writeFile(workbook, "auction_data.xlsx");

      setAlertState({
        open: true,
        message: "Excel data exported successfully! 🎉",
        severity: "success",
      });
    } catch (error) {
      console.error("Export failed", error);
      setAlertState({
        open: true,
        message: "Export failed! Please try again.",
        severity: "error",
      });
    } finally {
      setIsExporting(false);
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
        subtitle={`View historical player auction prices and franchise spending${yearsCount > 0 ? ` (${minYear} - ${maxYear})` : ""}`}
      />

      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          onClick={() => setFiltersOpen(!filtersOpen)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-start" },
            cursor: "pointer",
            p: 1.5,
            userSelect: "none",
            bgcolor: "rgba(255, 255, 255, 0.035)",
            borderBottom: filtersOpen
              ? "1px solid rgba(255, 255, 255, 0.06)"
              : "none",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.06)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={
                <TuneIcon
                  sx={{
                    fontSize: "1.1rem !important",
                    color: hasActiveFilters
                      ? "primary.contrastText"
                      : "inherit",
                  }}
                />
              }
              label="Search & Filters"
              color={hasActiveFilters ? "primary" : "default"}
              variant={hasActiveFilters ? "filled" : "outlined"}
              sx={{
                fontWeight: 700,
                borderRadius: "8px",
                px: 0.5,
                cursor: "pointer",
              }}
            />
            {hasActiveFilters && (
              <Chip
                label={`${[params.season, params.team, params.role, params.nationality, params.minPrice, params.maxPrice, params.quickFilter].filter(Boolean).length + (searchInput ? 1 : 0)} Active`}
                size="small"
                color="secondary"
                sx={{
                  fontWeight: 700,
                  borderRadius: "6px",
                  height: 22,
                  fontSize: "0.75rem",
                }}
              />
            )}
          </Box>
        </Box>

        <Collapse in={filtersOpen}>
          <Divider sx={{ opacity: 0.4 }} />
          <Box sx={{ p: 2, pt: 1.5 }}>
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Chip
                  label="Multiple Appearances (>1)"
                  onClick={() => {
                    setParams({
                      ...params,
                      quickFilter:
                        params.quickFilter === "multiple_appearances"
                          ? ""
                          : "multiple_appearances",
                      page: 1,
                    });
                  }}
                  color={
                    params.quickFilter === "multiple_appearances"
                      ? "primary"
                      : "default"
                  }
                  variant={
                    params.quickFilter === "multiple_appearances"
                      ? "filled"
                      : "outlined"
                  }
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                />
              </Box>

              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                {[
                  { key: "counts>2", label: "Auctions > 2" },
                  { key: "counts>3", label: "Auctions > 3" },
                ].map((qf) => (
                  <Chip
                    key={qf.key}
                    label={qf.label}
                    onClick={() => {
                      setParams({
                        ...params,
                        quickFilter:
                          params.quickFilter === qf.key ? "" : qf.key,
                        page: 1,
                      });
                    }}
                    color={
                      params.quickFilter === qf.key ? "primary" : "default"
                    }
                    variant={
                      params.quickFilter === qf.key ? "filled" : "outlined"
                    }
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  />
                ))}
              </Box>

              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                {[
                  { key: "high_rollers", label: "High Rollers (> ₹10Cr)" },
                  { key: "mega_buys", label: "Mega Buys (> ₹15Cr)" },
                ].map((qf) => (
                  <Chip
                    key={qf.key}
                    label={qf.label}
                    onClick={() => {
                      setParams({
                        ...params,
                        quickFilter:
                          params.quickFilter === qf.key ? "" : qf.key,
                        page: 1,
                      });
                    }}
                    color={
                      params.quickFilter === qf.key ? "primary" : "default"
                    }
                    variant={
                      params.quickFilter === qf.key ? "filled" : "outlined"
                    }
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  />
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                gap: 1.5,
                mb: 3,
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  key: "multiple_appearances",
                  label: "Multiple Appearances (>1)",
                },
                { key: "counts>2", label: "Auctions > 2" },
                { key: "counts>3", label: "Auctions > 3" },
                { key: "high_rollers", label: "High Rollers (> ₹10Cr)" },
                { key: "mega_buys", label: "Mega Buys (> ₹15Cr)" },
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
                  variant={
                    params.quickFilter === qf.key ? "filled" : "outlined"
                  }
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
              <Box sx={{ flex: { xs: "1 1 100%", md: "2 1 200px" } }}>
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
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 120px" } }}>
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
                      <MenuItem
                        key={s}
                        value={s}
                        sx={{ justifyContent: "center" }}
                      >
                        {s}
                      </MenuItem>
                    ))}
                </TextField>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 120px" } }}>
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
                      {getFilterFranchiseName(t.key, t.name)}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 120px" } }}>
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
                    <MenuItem
                      key={r}
                      value={r}
                      sx={{ justifyContent: "center" }}
                    >
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 120px" } }}>
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
                    <MenuItem
                      key={n}
                      value={n}
                      sx={{ justifyContent: "center" }}
                    >
                      {n}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mt: 2,
                width: "100%",
              }}
            >
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleClearFilters}
                  startIcon={<FilterAltOffIcon />}
                  sx={{
                    height: 48,
                    borderRadius: 2,
                    px: 4,
                  }}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleExport}
                startIcon={<FileDownloadIcon />}
                sx={{
                  height: 48,
                  borderRadius: 2,
                  px: 4,
                }}
              >
                Export
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
          position: "relative",
          opacity: isFetching && !isLoading ? 0.75 : 1,
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        {(isFetching || isExporting) && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              height: 5,
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#f59e0b",
              },
            }}
          />
        )}
        <DataTable
          columns={columns}
          data={data?.entries}
          isLoading={isLoading}
          total={data?.pagination?.total}
          page={params.page}
          limit={params.limit}
          onPageChange={(p) => {
            setParams({ ...params, page: p });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onLimitChange={(l) => {
            setParams({ ...params, limit: l, page: 1 });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onRowClick={(row) => navigate(`/players/${row.player.id}`)}
        />
      </Paper>

      <Snackbar
        open={alertState.open}
        autoHideDuration={4000}
        onClose={() => setAlertState((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertState((prev) => ({ ...prev, open: false }))}
          severity={alertState.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            bgcolor: alertState.severity === "success" ? "#10b981" : undefined,
            color: "#ffffff",
            fontWeight: 600,
          }}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AuctionExplorer;
