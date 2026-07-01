import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Autocomplete,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { apiClient } from "../api/index.js";
import PageHeader from "../components/common/PageHeader.jsx";
import {
  getPlayerDisplayName,
  deduplicatePlayers,
} from "../utils/playerHelpers.js";

function VenueMastery() {
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState("");
  const [searched, setSearched] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedVenueOption, setSelectedVenueOption] = useState(null);

  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const cardsPerPage = isMd ? 3 : isSm ? 2 : 1;

  useEffect(() => {
    apiClient
      .get("/players?limit=3000")
      .then((res) => {
        const rawPlayers = res.players || [];
        const seen = new Set();
        const processed = [];
        for (let i = 0; i < rawPlayers.length; i++) {
          const p = rawPlayers[i];
          if (!p) continue;
          const disp = getPlayerDisplayName(p);
          if (!disp || seen.has(disp)) continue;
          seen.add(disp);
          processed.push({
            ...p,
            displayName: disp,
          });
        }
        setPlayers(processed);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (overridePlayer = null) => {
    const hasOverride =
      overridePlayer &&
      typeof overridePlayer === "object" &&
      "id" in overridePlayer;
    const targetPlayer = hasOverride ? overridePlayer : player;
    if (targetPlayer) {
      setLoading(true);
      setSearched(true);
      if (hasOverride) {
        setPlayer(targetPlayer);
      }
      apiClient
        .get(`/analytics/venue-mastery/${targetPlayer.id}`)
        .then((res) => {
          setStats(res || []);
          setCarouselIndex(0);
          setSelectedVenueOption(null);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setStats([]);
          setCarouselIndex(0);
          setSelectedVenueOption(null);
          setLoading(false);
        });
    }
  };

  const renderStatCard = (
    label,
    value,
    color = "text.primary",
    subtitle = "",
  ) => (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        textAlign: "center",
        borderRadius: 2.5,
        bgcolor: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.04)",
          borderColor:
            color !== "text.primary" && color !== "white"
              ? color
              : "rgba(99, 102, 241, 0.3)",
        },
      }}
    >
      <Typography
        variant="h5"
        fontWeight={850}
        color={color}
        sx={{ fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.6rem" } }}
      >
        {value}
      </Typography>
      <Typography
        variant="overline"
        sx={{
          fontSize: "0.6rem",
          color: "text.secondary",
          fontWeight: 700,
          lineHeight: 1.2,
          mt: 0.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.6rem",
            color: "text.secondary",
            opacity: 0.8,
            display: "block",
            mt: 0.25,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Venue Mastery Analytics"
        subtitle="Find which players perform best at specific stadiums"
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 2.5 },
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Autocomplete
            fullWidth
            options={players}
            getOptionLabel={(option) => option.displayName || option.name}
            filterOptions={(options, state) => {
              const query = (state.inputValue || "").trim().toLowerCase();
              if (!query) return options;
              return options.filter((option) => {
                if (!option) return false;
                const displayName = (
                  option.displayName ||
                  option.name ||
                  ""
                ).toLowerCase();
                return displayName.includes(query);
              });
            }}
            value={player}
            onChange={(e, val) => setPlayer(val)}
            renderInput={(params) => (
              <TextField {...params} label="Select Player" variant="outlined" />
            )}
          />
          <Button
            variant="contained"
            size="large"
            onClick={() => handleSearch()}
            disabled={!player || loading}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Searching..." : "Analyze Venue Data"}
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mt: 2,
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            width: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              mr: 1,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              "& .MuiSvgIcon-root": {
                animation: "slideRight 1.5s infinite ease-in-out",
              },
              "@keyframes slideRight": {
                "0%": { transform: "translateX(0)" },
                "50%": { transform: "translateX(4px)" },
                "100%": { transform: "translateX(0)" },
              },
            }}
          >
            Popular Players
            <KeyboardDoubleArrowRightIcon sx={{ fontSize: 15 }} />
          </Typography>
          {[
            { name: "V Kohli", label: "Virat Kohli" },
            { name: "MS Dhoni", label: "MS Dhoni" },
            { name: "RG Sharma", label: "Rohit Sharma" },
            { name: "Rashid Khan", label: "Rashid Khan" },
            { name: "JJ Bumrah", label: "Jasprit Bumrah" },
            { name: "AB de Villiers", label: "AB de Villiers" },
          ].map((item) => (
            <Chip
              key={item.name}
              label={item.label}
              onClick={() => {
                const pObj = players.find((p) => p.name === item.name);
                if (pObj) handleSearch(pObj);
              }}
              clickable
              sx={{
                fontWeight: 750,
                px: 1.5,
                height: 32,
                bgcolor: "rgba(99, 102, 241, 0.08)",
                color: "#818cf8",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "white",
                  transform: "translateY(-1.5px)",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)",
                },
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          ))}
        </Box>
      </Paper>

      {!loading && searched && stats.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: "center",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            mb: 4,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            mb={1}
            color="text.secondary"
          >
            🏏 No Venue Data Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            We couldn't find any historical match records at specific venues for{" "}
            {player?.name || "this player"}.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearched(false);
              setPlayer(null);
            }}
          >
            Clear Search
          </Button>
        </Paper>
      )}

      {!loading &&
        stats.length > 0 &&
        (() => {
          const totalRuns = stats.reduce(
            (acc, curr) => acc + (curr.runsScored || 0),
            0,
          );
          const totalWickets = stats.reduce(
            (acc, curr) => acc + (curr.wickets || 0),
            0,
          );
          const totalMatches = stats.reduce(
            (acc, curr) => acc + (curr.matchesPlayed || 0),
            0,
          );

          const statsWithScores = stats.map((venueStat) => {
            const hasBatting = venueStat.inningsBat > 0;
            const hasBowling = venueStat.inningsBowl > 0;
            const dismissals = venueStat.inningsBat - venueStat.notOuts;
            const trueAverage =
              dismissals > 0 ? venueStat.runsScored / dismissals : 0;
            const sr =
              venueStat.ballsFaced > 0
                ? (venueStat.runsScored / venueStat.ballsFaced) * 100
                : 0;
            const economy =
              venueStat.ballsBowled > 0
                ? (venueStat.runsConceded / venueStat.ballsBowled) * 6
                : 0;
            const bowlingAvg =
              venueStat.wickets > 0
                ? venueStat.runsConceded / venueStat.wickets
                : 999;

            const batScore = hasBatting
              ? Math.min(
                  100,
                  (venueStat.runsScored / 200) * 40 +
                    (sr / 150) * 30 +
                    (trueAverage > 0 ? (trueAverage / 45) * 30 : 25),
                )
              : 0;

            const bowlScore = hasBowling
              ? Math.min(
                  100,
                  (venueStat.wickets / 10) * 45 +
                    (economy > 0 ? (8 / economy) * 35 : 20) +
                    (bowlingAvg < 999 ? (25 / bowlingAvg) * 20 : 15),
                )
              : 0;

            const score = Math.max(batScore, bowlScore);

            const experienceWeight =
              venueStat.matchesPlayed >= 5
                ? 1.0
                : venueStat.matchesPlayed >= 3
                  ? 0.9
                  : 0.75;
            const finalScore = Math.round(
              Math.max(10, Math.min(100, (score || 50) * experienceWeight)),
            );
            return { ...venueStat, finalScore };
          });

          const isBatter = totalRuns > totalWickets * 15;

          const sortedStats = [...statsWithScores].sort((a, b) => {
            if (b.finalScore !== a.finalScore) {
              return b.finalScore - a.finalScore;
            }
            if (isBatter) {
              return b.runsScored - a.runsScored;
            } else {
              return b.wickets - a.wickets;
            }
          });
          const ultimateFortress = sortedStats[0];

          const isSingleCardMode =
            selectedVenueOption && !selectedVenueOption.isShowAll;
          const effectiveCardsPerPage = isSingleCardMode ? 1 : cardsPerPage;
          const dropdownOptions = [
            { isShowAll: true, venue: "Show All (Page View)" },
            ...sortedStats,
          ];

          const handlePrev = () => {
            setCarouselIndex((prev) => {
              if (prev === 0) {
                const remainder = sortedStats.length % effectiveCardsPerPage;
                return remainder === 0
                  ? sortedStats.length - effectiveCardsPerPage
                  : sortedStats.length - remainder;
              }
              const prevIndex = prev - effectiveCardsPerPage;
              return prevIndex < 0 ? 0 : prevIndex;
            });
          };

          const handleNext = () => {
            setCarouselIndex((prev) => {
              const nextIndex = prev + effectiveCardsPerPage;
              return nextIndex >= sortedStats.length ? 0 : nextIndex;
            });
          };

          return (
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: { xs: 2, sm: 3 },
                  mb: 4,
                  width: "100%",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 4,
                      height: "100%",
                      width: "100%",
                      bgcolor: "rgba(99, 102, 241, 0.08)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="primary.main"
                      fontWeight={800}
                      sx={{
                        letterSpacing: 1.5,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      👑 Ultimate Fortress
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      sx={{
                        mt: 1,
                        mb: 0.5,
                        fontSize: { xs: "1.2rem", sm: "1.35rem", md: "1.5rem" },
                      }}
                    >
                      {ultimateFortress?.venue}
                    </Typography>
                    <Box
                      sx={{
                        position: "absolute",
                        right: 10,
                        bottom: -15,
                        opacity: 0.08,
                        fontSize: { xs: "3.5rem", sm: "5rem" },
                        transform: "rotate(-15deg)",
                      }}
                    >
                      🏰
                    </Box>
                  </Paper>
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 4,
                      height: "100%",
                      width: "100%",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      fontWeight={800}
                      sx={{
                        letterSpacing: 1.5,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      📊 Career Venue Footprint
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(2, 1fr)",
                          sm: "repeat(4, 1fr)",
                        },
                        gap: { xs: 2, sm: 3 },
                        mt: 2.5,
                        width: "100%",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                        >
                          {stats.length}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", fontWeight: 700 }}
                        >
                          Venues
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                        >
                          {totalMatches}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", fontWeight: 700 }}
                        >
                          Matches
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          color="#3b82f6"
                          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                        >
                          {totalRuns}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", fontWeight: 700 }}
                        >
                          Runs
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          color="#ff4757"
                          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                        >
                          {totalWickets}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", fontWeight: 700 }}
                        >
                          Wickets
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 4,
                  width: "100%",
                }}
              >
                <Autocomplete
                  sx={{ width: { xs: "100%", sm: 450 } }}
                  options={dropdownOptions}
                  getOptionLabel={(option) => {
                    if (option.isShowAll) return option.venue;
                    const idx = sortedStats.findIndex(
                      (s) => s.venue === option.venue,
                    );
                    return `${idx !== -1 ? idx + 1 : ""}. ${option.venue} (${option.matchesPlayed} Matches)`;
                  }}
                  value={selectedVenueOption || dropdownOptions[0]}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setSelectedVenueOption(newValue);
                      if (newValue.isShowAll) {
                        setCarouselIndex(0);
                      } else {
                        const idx = sortedStats.findIndex(
                          (s) => s.venue === newValue.venue,
                        );
                        if (idx !== -1) setCarouselIndex(idx);
                      }
                    }
                  }}
                  disableClearable
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    const idx = sortedStats.findIndex(
                      (s) => s.venue === option.venue,
                    );
                    return (
                      <Box
                        key={key}
                        component="li"
                        {...optionProps}
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          py: 1.5,
                          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            textAlign: "left",
                            width: "100%",
                          }}
                        >
                          {option.isShowAll
                            ? option.venue
                            : `${idx !== -1 ? idx + 1 : ""}. ${option.venue} (${option.matchesPlayed} Matches)`}
                        </Typography>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Stadium to View Details"
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: "background.paper",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          transition: "all 0.3s",
                          "&:hover": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  width: "100%",
                  maxWidth: 1200,
                  mx: "auto",
                  mb: { xs: 2, sm: 4 },
                  px: { xs: 3, sm: 8 },
                }}
              >
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    display: "inline-flex",
                    position: "absolute",
                    left: { xs: -12, sm: 10 },
                    zIndex: 10,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "white",
                    backdropFilter: "blur(4px)",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
                    },
                    width: { xs: 32, sm: 48 },
                    height: { xs: 32, sm: 48 },
                    transition: "all 0.3s ease",
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                </IconButton>

                {(() => {
                  const len = sortedStats.length;
                  if (len === 0) return null;

                  const visibleCards = [];
                  for (let i = 0; i < effectiveCardsPerPage; i++) {
                    const cardIndex = carouselIndex + i;
                    if (cardIndex < len) {
                      visibleCards.push({
                        stat: sortedStats[cardIndex],
                        display: { xs: "block" },
                      });
                    }
                  }

                  return (
                    <Box
                      sx={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm:
                            visibleCards.length > 1 ? "repeat(2, 1fr)" : "1fr",
                          md:
                            visibleCards.length > 2
                              ? "repeat(3, 1fr)"
                              : visibleCards.length > 1
                                ? "repeat(2, 1fr)"
                                : "1fr",
                        },
                        gap: 3,
                        transition: "all 0.5s ease",
                        animation: "fadeInScale 0.4s ease-out",
                        "@keyframes fadeInScale": {
                          "0%": { opacity: 0, transform: "scale(0.96)" },
                          "100%": { opacity: 1, transform: "scale(1)" },
                        },
                      }}
                      key={carouselIndex}
                    >
                      {visibleCards.map(({ stat: venueStat, display }) => {
                        const hasBatting = venueStat.inningsBat > 0;
                        const hasBowling = venueStat.inningsBowl > 0;
                        const hasFielding =
                          venueStat.catches > 0 ||
                          venueStat.runOuts > 0 ||
                          venueStat.stumpings > 0;
                        const hasMilestones =
                          venueStat.centuries > 0 ||
                          venueStat.fifties > 0 ||
                          venueStat.runsScored >= 3000;

                        const dismissals =
                          venueStat.inningsBat - venueStat.notOuts;
                        const trueAverage =
                          dismissals > 0
                            ? (venueStat.runsScored / dismissals).toFixed(1)
                            : venueStat.runsScored > 0
                              ? "-"
                              : "0.0";
                        const boundaryRuns =
                          venueStat.fours * 4 + venueStat.sixes * 6;
                        const boundaryReliance =
                          venueStat.runsScored > 0
                            ? Math.round(
                                (boundaryRuns / venueStat.runsScored) * 100,
                              )
                            : 0;
                        const sr =
                          venueStat.ballsFaced > 0
                            ? (
                                (venueStat.runsScored / venueStat.ballsFaced) *
                                100
                              ).toFixed(1)
                            : 0;
                        const economy =
                          venueStat.ballsBowled > 0
                            ? (
                                (venueStat.runsConceded /
                                  venueStat.ballsBowled) *
                                6
                              ).toFixed(2)
                            : 0;
                        const bowlingAvg =
                          venueStat.wickets > 0
                            ? (
                                venueStat.runsConceded / venueStat.wickets
                              ).toFixed(1)
                            : "-";
                        const bestBowlingStr =
                          venueStat.bestBowlingWickets > 0
                            ? `${venueStat.bestBowlingWickets}/${venueStat.bestBowlingRuns}`
                            : "-";

                        return (
                          <Box
                            key={venueStat.id}
                            sx={{
                              ...display,
                              width: "100%",
                              minWidth: 0,
                            }}
                          >
                            <Card
                              onClick={() => {
                                setSelectedLogs(venueStat.matchLogs || []);
                                setSelectedVenue(venueStat.venue);
                              }}
                              sx={{
                                borderRadius: 4,
                                overflow: "hidden",
                                bgcolor: "background.paper",
                                backgroundImage:
                                  "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(245, 158, 11, 0.08) 0px, transparent 50%)",
                                border: "1px solid",
                                borderColor: "divider",
                                color: "text.primary",
                                cursor: "pointer",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                transition:
                                  "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s",
                                "&:hover": {
                                  transform: "translateY(-6px)",
                                  boxShadow:
                                    "0 12px 30px rgba(99, 102, 241, 0.15)",
                                  borderColor: "rgba(99, 102, 241, 0.4)",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  bgcolor: "rgba(255,255,255,0.05)",
                                  p: 2,
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.1)",
                                  textAlign: "center",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  fontWeight={800}
                                  sx={{
                                    fontSize: {
                                      xs: "0.95rem",
                                      sm: "1.1rem",
                                      md: "1.25rem",
                                    },
                                    lineHeight: 1.3,
                                    minHeight: { xs: "2.6rem", sm: "3rem" },
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {(() => {
                                    const originalIndex = sortedStats.findIndex(
                                      (s) => s.venue === venueStat.venue,
                                    );
                                    return `${originalIndex !== -1 ? `#${originalIndex + 1} ` : ""}${venueStat.venue}`;
                                  })()}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="rgba(255,255,255,0.6)"
                                >
                                  {venueStat.matchesPlayed} Matches Played
                                </Typography>
                              </Box>

                              {hasMilestones && (
                                <Box
                                  sx={{
                                    p: 1.5,
                                    bgcolor: "rgba(245, 158, 11, 0.1)",
                                    borderBottom:
                                      "1px solid rgba(255,255,255,0.1)",
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                  }}
                                >
                                  {venueStat.centuries > 0 && (
                                    <Chip
                                      size="small"
                                      label={`${venueStat.centuries} Centuries`}
                                      sx={{
                                        bgcolor: "#f59e0b",
                                        color: "#000",
                                        fontWeight: 800,
                                      }}
                                    />
                                  )}
                                  {venueStat.fifties > 0 && (
                                    <Chip
                                      size="small"
                                      label={`${venueStat.fifties} Fifties`}
                                      sx={{
                                        bgcolor: "rgba(245, 158, 11, 0.8)",
                                        color: "#000",
                                        fontWeight: 800,
                                      }}
                                    />
                                  )}
                                  {venueStat.runsScored >= 3000 && (
                                    <Chip
                                      size="small"
                                      label="🏆 3,000 Run Club"
                                      sx={{
                                        bgcolor: "#ffd700",
                                        color: "#000",
                                        fontWeight: 800,
                                      }}
                                    />
                                  )}
                                  {venueStat.runsScored >= 1000 &&
                                    venueStat.runsScored < 3000 && (
                                      <Chip
                                        size="small"
                                        label="🏆 1,000 Run Club"
                                        sx={{
                                          bgcolor: "rgba(255,215,0,0.8)",
                                          color: "#000",
                                          fontWeight: 800,
                                        }}
                                      />
                                    )}
                                </Box>
                              )}

                              <CardContent
                                sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}
                              >
                                {hasBatting && (
                                  <Box mb={3}>
                                    <Typography
                                      variant="subtitle2"
                                      color="#4dabf5"
                                      fontWeight={800}
                                      mb={2}
                                      sx={{
                                        textAlign: "center",
                                        width: "100%",
                                        letterSpacing: 1,
                                      }}
                                    >
                                      🏏 BATTING
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: { xs: 1.5, sm: 2 },
                                        width: "100%",
                                      }}
                                    >
                                      {renderStatCard(
                                        "Runs",
                                        venueStat.runsScored,
                                        "white",
                                        `${venueStat.inningsBat} Innings`,
                                      )}
                                      {renderStatCard(
                                        "High Score",
                                        venueStat.highestScore > 0
                                          ? venueStat.notOuts > 0
                                            ? `${venueStat.highestScore}*`
                                            : venueStat.highestScore
                                          : "-",
                                        "#f59e0b",
                                      )}
                                      {renderStatCard(
                                        "True Average",
                                        trueAverage,
                                      )}
                                      {renderStatCard("Strike Rate", sr)}
                                    </Box>
                                    {venueStat.runsScored > 0 && (
                                      <Box
                                        mt={3.5}
                                        sx={{
                                          borderTop:
                                            "1px dashed rgba(255,255,255,0.1)",
                                          pt: 2.5,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          mb={0.5}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            color: "text.secondary",
                                            fontWeight: 600,
                                          }}
                                        >
                                          <span>Boundary Reliance</span>
                                          <span>{boundaryReliance}%</span>
                                        </Typography>
                                        <LinearProgress
                                          variant="determinate"
                                          value={boundaryReliance}
                                          sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: "rgba(255,255,255,0.06)",
                                            "& .MuiLinearProgress-bar": {
                                              bgcolor: "secondary.main",
                                            },
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{
                                            display: "block",
                                            mt: 0.5,
                                            fontSize: "0.7rem",
                                          }}
                                        >
                                          {venueStat.fours} Fours |{" "}
                                          {venueStat.sixes} Sixes
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                )}

                                {hasBowling && (
                                  <Box
                                    sx={{
                                      pt: hasBatting ? 3 : 0,
                                      borderTop: hasBatting
                                        ? "1px solid rgba(255,255,255,0.1)"
                                        : "none",
                                      mb: hasFielding ? 3 : 0,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      color="#ff4757"
                                      fontWeight={800}
                                      mb={2}
                                      sx={{
                                        textAlign: "center",
                                        width: "100%",
                                        letterSpacing: 1,
                                      }}
                                    >
                                      ⚾ BOWLING
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: { xs: 1.5, sm: 2 },
                                        width: "100%",
                                      }}
                                    >
                                      {renderStatCard(
                                        "Wickets",
                                        venueStat.wickets,
                                        "white",
                                        `${venueStat.inningsBowl} Innings`,
                                      )}
                                      {renderStatCard(
                                        "Best Figures",
                                        bestBowlingStr,
                                        "#ff4757",
                                      )}
                                      {renderStatCard("Average", bowlingAvg)}
                                      {renderStatCard("Economy", economy)}
                                    </Box>
                                  </Box>
                                )}

                                {hasFielding && (
                                  <Box
                                    sx={{
                                      pt: hasBatting || hasBowling ? 3 : 0,
                                      borderTop:
                                        hasBatting || hasBowling
                                          ? "1px solid rgba(255,255,255,0.1)"
                                          : "none",
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      color="#2ed573"
                                      fontWeight={800}
                                      mb={2}
                                      sx={{
                                        textAlign: "center",
                                        width: "100%",
                                        letterSpacing: 1,
                                      }}
                                    >
                                      🧤 FIELDING
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        justifyContent: "center",
                                        gap: 2,
                                        width: "100%",
                                      }}
                                    >
                                      {venueStat.catches > 0 && (
                                        <Box
                                          sx={{
                                            flex: {
                                              xs: "1 1 40%",
                                              sm: "0 1 100px",
                                            },
                                            minWidth: 90,
                                          }}
                                        >
                                          {renderStatCard(
                                            "Catches",
                                            venueStat.catches,
                                          )}
                                        </Box>
                                      )}
                                      {venueStat.stumpings > 0 && (
                                        <Box
                                          sx={{
                                            flex: {
                                              xs: "1 1 40%",
                                              sm: "0 1 100px",
                                            },
                                            minWidth: 90,
                                          }}
                                        >
                                          {renderStatCard(
                                            "Stumpings",
                                            venueStat.stumpings,
                                          )}
                                        </Box>
                                      )}
                                      {venueStat.runOuts > 0 && (
                                        <Box
                                          sx={{
                                            flex: {
                                              xs: "1 1 40%",
                                              sm: "0 1 100px",
                                            },
                                            minWidth: 90,
                                          }}
                                        >
                                          {renderStatCard(
                                            "Run Outs",
                                            venueStat.runOuts,
                                          )}
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                <IconButton
                  onClick={handleNext}
                  sx={{
                    display: "inline-flex",
                    position: "absolute",
                    right: { xs: -12, sm: 10 },
                    zIndex: 10,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "white",
                    backdropFilter: "blur(4px)",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
                    },
                    width: { xs: 32, sm: 48 },
                    height: { xs: 32, sm: 48 },
                    transition: "all 0.3s ease",
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                </IconButton>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  mb: 4,
                  flexWrap: "wrap",
                  maxWidth: "90%",
                  mx: "auto",
                }}
              >
                {(() => {
                  const numPages = Math.ceil(
                    sortedStats.length / effectiveCardsPerPage,
                  );
                  const activePageIndex = Math.floor(
                    carouselIndex / effectiveCardsPerPage,
                  );
                  return Array.from({ length: numPages }).map((_, idx) => (
                    <Box
                      key={idx}
                      onClick={() =>
                        setCarouselIndex(idx * effectiveCardsPerPage)
                      }
                      sx={{
                        width: idx === activePageIndex ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        bgcolor:
                          idx === activePageIndex
                            ? "primary.main"
                            : "rgba(255, 255, 255, 0.2)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor:
                            idx === activePageIndex
                              ? "primary.main"
                              : "rgba(255, 255, 255, 0.4)",
                        },
                      }}
                    />
                  ));
                })()}
              </Box>
            </Box>
          );
        })()}

      <Dialog
        open={Boolean(selectedLogs)}
        onClose={() => setSelectedLogs(null)}
        maxWidth="lg"
        fullWidth
        fullScreen={!isSm}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            bgcolor: "primary.main",
            color: "white",
            textAlign: "center",
            position: "relative",
            pr: 6,
            fontSize: { xs: "1rem", sm: "1.25rem" },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          Historical Match Log: {selectedVenue}
          <IconButton
            onClick={() => setSelectedLogs(null)}
            sx={{
              position: "absolute",
              right: 8,
              top: { xs: 6, sm: 8 },
              color: "white",
              bgcolor: "#ef4444",
              width: 30,
              height: 30,
              "&:hover": {
                bgcolor: "#dc2626",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "rgba(0,0,0,0.05)" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    Runs
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    Balls
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    SR
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    Wickets
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    Overs
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    Econ
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      px: { xs: 0.75, sm: 2 },
                      py: 1.5,
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    }}
                    align="center"
                  >
                    Fielding
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedLogs &&
                  selectedLogs.map((log, i) => {
                    const sr =
                      log.balls > 0
                        ? ((log.runs / log.balls) * 100).toFixed(1)
                        : "-";
                    const overs = (log.ballsBowled / 6).toFixed(1);
                    const econ =
                      log.ballsBowled > 0
                        ? ((log.runsConceded / log.ballsBowled) * 6).toFixed(2)
                        : "-";
                    const field = [
                      log.catches > 0 ? `${log.catches}c` : null,
                      log.stumpings > 0 ? `${log.stumpings}st` : null,
                      log.runOuts > 0 ? `${log.runOuts}ro` : null,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    const [y, m, d] = (log.date || "").split("-");
                    const formattedDate =
                      y && m && d ? `${d}-${m}-${y}` : log.date;

                    return (
                      <TableRow
                        key={i}
                        sx={{ "&:hover": { bgcolor: "rgba(0,0,0,0.02)" } }}
                      >
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                          align="center"
                        >
                          {formattedDate}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: log.runs >= 50 ? 800 : 400,
                            color:
                              log.runs >= 100
                                ? "#e65100"
                                : log.runs >= 50
                                  ? "secondary.main"
                                  : "inherit",
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                        >
                          {log.runs > 0 || log.balls > 0 ? log.runs : "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                          align="center"
                        >
                          {log.balls > 0 ? log.balls : "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                          align="center"
                        >
                          {sr}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            color: log.isOut
                              ? "error.main"
                              : log.runs > 0 || log.balls > 0
                                ? "success.main"
                                : "inherit",
                            fontWeight: log.isOut ? 400 : 700,
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                        >
                          {log.runs > 0 || log.balls > 0
                            ? log.isOut
                              ? "Out"
                              : "Not Out"
                            : "-"}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: log.wickets >= 3 ? 800 : 400,
                            color: log.wickets >= 3 ? "error.main" : "inherit",
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                        >
                          {log.ballsBowled > 0 ? log.wickets : "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                          align="center"
                        >
                          {log.ballsBowled > 0
                            ? `${overs} (${log.runsConceded})`
                            : "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                          align="center"
                        >
                          {econ}
                        </TableCell>
                        <TableCell
                          sx={{
                            px: { xs: 0.75, sm: 2 },
                            py: 1,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                          align="center"
                        >
                          {field || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default VenueMastery;
