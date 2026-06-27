import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Autocomplete,
  TextField,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { apiClient } from "../api/index.js";
import PageHeader from "../components/common/PageHeader.jsx";
import {
  getPlayerDisplayName,
  deduplicatePlayers,
} from "../utils/playerHelpers.js";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import CloseIcon from "@mui/icons-material/Close";

function HeadToHeadMatchups() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [players, setPlayers] = useState([]);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [selectedBatter, setSelectedBatter] = useState(null);
  const [selectedBowler, setSelectedBowler] = useState(null);

  useEffect(() => {
    apiClient
      .get("/players?limit=3000")
      .then((res) => setPlayers(res.players || []))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (overrideP1, overrideP2) => {
    const bat = overrideP1 && overrideP1.id ? overrideP1 : player1;
    const bowl = overrideP2 && overrideP2.id ? overrideP2 : player2;

    if (bat && bowl) {
      setLoading(true);
      setSearched(true);
      apiClient
        .get(`/analytics/head-to-head?batterId=${bat.id}&bowlerId=${bowl.id}`)
        .then((res) => {
          setStats(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setStats(null);
          setLoading(false);
        });
    }
  };

  const handleDefaultClick = (p1Name, p2Name) => {
    const p1 = players.find((p) => p.name === p1Name);
    const p2 = players.find((p) => p.name === p2Name);
    if (p1 && p2) {
      setPlayer1(p1);
      setPlayer2(p2);
      handleSearch(p1, p2);
    }
  };

  const getDominance = (data) => {
    if (!data || data.ballsFaced < 15)
      return { label: "Small Sample Size", color: "#9e9e9e" };
    const bpd = data.ballsFaced / (data.dismissals || 0.5);
    if (data.strikeRate > 140 && bpd > 20)
      return { label: "🟢 Batter Dominance", color: "#4caf50" };
    if (data.strikeRate < 115 && bpd < 15)
      return { label: "🔴 Bowler Dominance", color: "#f44336" };
    return { label: "🔥 Fierce Rivalry", color: "#ff9800" };
  };

  const buildTimelineData = (seasonDetails) => {
    if (!seasonDetails) return [];
    const timeline = [];
    let cumulativeRuns = 0;
    const years = Object.keys(seasonDetails).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );
    years.forEach((year) => {
      const deliveries = seasonDetails[year].deliveries || [];
      deliveries.forEach((d) => {
        cumulativeRuns += d.runs;
        timeline.push({
          ball: timeline.length + 1,
          year: year,
          runs: cumulativeRuns,
          runsThisBall: d.runs,
          isWicket: Boolean(d.wicket),
          wicketKind: d.wicket,
        });
      });
    });
    return timeline;
  };

  const CustomWicketDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.isWicket) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#ff4757"
          stroke="white"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper
          sx={{
            p: 1.5,
            bgcolor: "rgba(0,0,0,0.8)",
            color: "white",
            border: "1px solid #444",
          }}
        >
          <Typography variant="body2" fontWeight={800}>
            Ball {data.ball} ({data.year})
          </Typography>
          <Typography variant="body2">
            Runs: {data.runsThisBall} (Total: {data.runs})
          </Typography>
          {data.isWicket && (
            <Typography variant="body2" color="#ff4757" fontWeight={800}>
              WICKET! ({data.wicketKind})
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  const StatCard = ({ label, value, color = "white", gradient }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        textAlign: "center",
        borderRadius: 3,
        bgcolor: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(8px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          bgcolor: "rgba(255, 255, 255, 0.04)",
          borderColor: color !== "white" ? color : "rgba(99, 102, 241, 0.4)",
          boxShadow: `0 8px 24px ${color !== "white" ? color : "#6366f1"}15`,
        },
      }}
    >
      <Typography
        variant="h3"
        fontWeight={900}
        color={color}
        sx={{
          fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
          background: gradient ? gradient : "none",
          WebkitBackgroundClip: gradient ? "text" : "none",
          WebkitTextFillColor: gradient ? "transparent" : "inherit",
          lineHeight: 1.2,
          mb: 0.5,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="overline"
        sx={{
          fontSize: { xs: "0.65rem", sm: "0.7rem" },
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: 1.2,
        }}
      >
        {label}
      </Typography>
    </Paper>
  );

  const renderSection = (batter, bowler, data) => {
    if (!data) return null;
    const dom = getDominance(data);
    const timelineData = buildTimelineData(data.seasonDetails);
    const title = `🏏 ${batter.name} batting vs ${bowler.name} bowling`;

    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 4,
          bgcolor: "background.paper",
          backgroundImage:
            "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(245, 158, 11, 0.08) 0px, transparent 50%)",
          border: "1px solid",
          borderColor: "divider",
          color: "text.primary",
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 1.5,
            mb: 4,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            color="text.primary"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.4rem" } }}
          >
            {title}
          </Typography>
          <Chip
            label={dom.label}
            sx={{
              bgcolor: dom.color,
              color: "white",
              fontWeight: 800,
              px: 2,
              py: 2,
              borderRadius: "8px",
              boxShadow: `0 4px 14px ${dom.color}44`,
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: { xs: 2, sm: 3 },
            mb: 3,
          }}
        >
          <StatCard label="Runs" value={data.runsScored} />
          <StatCard label="Balls" value={data.ballsFaced} />
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(8px)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px)",
                bgcolor: "rgba(255, 255, 255, 0.04)",
                borderColor:
                  data.dismissals > 0 ? "#ef4444" : "rgba(255, 255, 255, 0.15)",
                boxShadow: `0 8px 24px ${data.dismissals > 0 ? "#ef4444" : "#ffffff"}15`,
              },
            }}
          >
            <Typography
              variant="h3"
              fontWeight={900}
              color={data.dismissals > 0 ? "#ef4444" : "text.primary"}
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {data.dismissals}
            </Typography>
            <Typography
              variant="overline"
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.7rem" },
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              Dismissals
            </Typography>
            {data.dismissalDetails &&
              Object.keys(data.dismissalDetails).length > 0 && (
                <Box
                  sx={{
                    mt: 1.5,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  {Object.entries(data.dismissalDetails).map(
                    ([kind, count]) => (
                      <Chip
                        key={kind}
                        label={`${kind}: ${count}`}
                        size="small"
                        sx={{
                          fontSize: "0.6rem",
                          height: 18,
                          bgcolor: "rgba(255, 255, 255, 0.08)",
                          color: "text.secondary",
                          fontWeight: 700,
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                        }}
                      />
                    ),
                  )}
                </Box>
              )}
          </Paper>
          <StatCard label="Strike Rate" value={data.strikeRate?.toFixed(1)} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: { xs: 2, sm: 3 },
            mb: 4,
          }}
        >
          <StatCard
            label="True Average"
            value={
              data.dismissals > 0
                ? (data.runsScored / data.dismissals).toFixed(1)
                : "-"
            }
            color="#10b981"
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          />
          <StatCard
            label="Dot Ball %"
            value={
              data.ballsFaced > 0
                ? ((data.dotBalls / data.ballsFaced) * 100).toFixed(1) + "%"
                : "0%"
            }
            color="#f59e0b"
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          />
          <StatCard
            label="Boundary Run %"
            value={
              data.runsScored > 0
                ? (
                    ((data.fours * 4 + data.sixes * 6) / data.runsScored) *
                    100
                  ).toFixed(1) + "%"
                : "0%"
            }
            color="#3b82f6"
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          />
          <StatCard
            label="Fours / Sixes"
            value={`${data.fours} / ${data.sixes}`}
            color="#a855f7"
            gradient="linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)"
          />
        </Box>

        {data.phaseDetails && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="rgba(255,255,255,0.6)"
              mb={2}
              sx={{
                letterSpacing: 1,
                textTransform: "uppercase",
                textAlign: "center",
                display: "block",
                width: "100%",
              }}
            >
              Phase Mastery Breakdown
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {["Powerplay", "Middle", "Death"].map((phase) => {
                const pData = data.phaseDetails[phase];
                if (!pData || pData.balls === 0) return null;
                const phaseLabel =
                  phase === "Powerplay"
                    ? "Powerplay (1-6)"
                    : phase === "Middle"
                      ? "Middle Overs (7-15)"
                      : "Death Overs (16-20)";
                const pSr =
                  pData.balls > 0
                    ? ((pData.runs / pData.balls) * 100).toFixed(1)
                    : 0;
                return (
                  <Box
                    key={phase}
                    sx={{
                      flex: 1,
                      minWidth: { xs: "100%", sm: 140 },
                      p: 2,
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 2,
                      textAlign: "center",
                      bgcolor: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="#f59e0b"
                      display="block"
                      mb={1.5}
                    >
                      {phaseLabel}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(2, 1fr)",
                          sm: "repeat(4, 1fr)",
                        },
                        gap: 1.5,
                        justifyItems: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{
                            fontSize: {
                              xs: "1.1rem",
                              sm: "1.3rem",
                              md: "1.5rem",
                            },
                          }}
                        >
                          {pData.runs}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.5)"
                          display="block"
                        >
                          Runs
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{
                            fontSize: {
                              xs: "1.1rem",
                              sm: "1.3rem",
                              md: "1.5rem",
                            },
                          }}
                        >
                          {pData.balls}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.5)"
                          display="block"
                        >
                          Balls
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          color={pData.wkts > 0 ? "#ff4757" : "inherit"}
                          sx={{
                            fontSize: {
                              xs: "1.1rem",
                              sm: "1.3rem",
                              md: "1.5rem",
                            },
                          }}
                        >
                          {pData.wkts}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.5)"
                          display="block"
                        >
                          Wkts
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          color="#4dabf5"
                          sx={{
                            fontSize: {
                              xs: "1.1rem",
                              sm: "1.3rem",
                              md: "1.5rem",
                            },
                          }}
                        >
                          {pSr}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.5)"
                          display="block"
                        >
                          SR
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {data.seasonDetails && Object.keys(data.seasonDetails).length > 0 && (
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              mb={2.5}
              color="text.secondary"
              sx={{
                textAlign: "center",
                display: "block",
                width: "100%",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: "0.85rem",
              }}
            >
              Year-by-Year Breakdown (Click for log)
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                justifyContent: "center",
              }}
            >
              {Object.entries(data.seasonDetails)
                .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
                .map(([year, sData]) => {
                  if (sData.balls === 0) return null;
                  return (
                    <Box
                      key={year}
                      onClick={() => {
                        if (sData.deliveries && sData.deliveries.length > 0) {
                          setSelectedYear(year);
                          setSelectedDeliveries(sData.deliveries);
                          setSelectedBatter(batter);
                          setSelectedBowler(bowler);
                        }
                      }}
                      sx={{
                        p: 2,
                        bgcolor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: 2.5,
                        textAlign: "center",
                        minWidth: 110,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(99, 102, 241, 0.08)",
                          borderColor: "rgba(99, 102, 241, 0.3)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="secondary.main"
                      >
                        {year}
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={750}
                        sx={{ mt: 0.5 }}
                      >
                        {sData.runs}{" "}
                        <span
                          style={{
                            fontSize: "0.75rem",
                            opacity: 0.7,
                            fontWeight: 500,
                          }}
                        >
                          ({sData.balls})
                        </span>
                      </Typography>
                      {sData.wkts > 0 && (
                        <Chip
                          label={`${sData.wkts} WKT`}
                          size="small"
                          sx={{
                            mt: 1,
                            height: 18,
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            bgcolor: "error.main",
                            color: "white",
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        pt: { xs: 1, md: 2 },
        pb: 6,
      }}
    >
      <PageHeader
        title="Player Matchups"
        subtitle="Analyze delivery-by-delivery stats between any batsman and bowler"
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
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
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "center",
            gap: 2.5,
            width: "100%",
          }}
        >
          <Box
            sx={{ flex: 1, width: "100%", maxWidth: { xs: "100%", md: 350 } }}
          >
            <Autocomplete
              fullWidth
              options={deduplicatePlayers(players)}
              getOptionLabel={(option) => getPlayerDisplayName(option)}
              filterOptions={(options, state) => {
                const query = (state.inputValue || "").trim().toLowerCase();
                if (!query) return options;
                return options.filter((option) => {
                  if (!option) return false;
                  const displayName = (
                    getPlayerDisplayName(option) || ""
                  ).toLowerCase();
                  return displayName.includes(query);
                });
              }}
              value={player1}
              onChange={(e, val) => {
                setPlayer1(val);
                setSearched(false);
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={key}
                    component="li"
                    {...optionProps}
                    sx={{
                      justifyContent: "center !important",
                      textAlign: "center !important",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      py: 1,
                    }}
                  >
                    {getPlayerDisplayName(option)}
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Player 1"
                  variant="outlined"
                />
              )}
            />
          </Box>
          <Box
            sx={{ flex: 1, width: "100%", maxWidth: { xs: "100%", md: 350 } }}
          >
            <Autocomplete
              fullWidth
              options={deduplicatePlayers(players)}
              getOptionLabel={(option) => getPlayerDisplayName(option)}
              filterOptions={(options, state) => {
                const query = (state.inputValue || "").trim().toLowerCase();
                if (!query) return options;
                return options.filter((option) => {
                  if (!option) return false;
                  const displayName = (
                    getPlayerDisplayName(option) || ""
                  ).toLowerCase();
                  return displayName.includes(query);
                });
              }}
              value={player2}
              onChange={(e, val) => {
                setPlayer2(val);
                setSearched(false);
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={key}
                    component="li"
                    {...optionProps}
                    sx={{
                      justifyContent: "center !important",
                      textAlign: "center !important",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      py: 1,
                    }}
                  >
                    {getPlayerDisplayName(option)}
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Player 2"
                  variant="outlined"
                />
              )}
            />
          </Box>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!player1 || !player2 || loading}
            sx={{
              height: 56,
              px: 4,
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 2,
              whiteSpace: "nowrap",
              width: { xs: "100%", md: "auto" },
              bgcolor: "primary.main",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            {loading ? "Searching..." : "Analyze Matchup"}
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mt: 3,
            pt: 2.5,
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
            Iconic Rivalries
            <KeyboardDoubleArrowRightIcon sx={{ fontSize: 15 }} />
          </Typography>
          {[
            { label: "Dhoni vs Bumrah", p1: "MS Dhoni", p2: "JJ Bumrah" },
            { label: "Kohli vs Narine", p1: "V Kohli", p2: "SP Narine" },
            { label: "ABD vs Rashid", p1: "AB de Villiers", p2: "Rashid Khan" },
            { label: "Russell vs Bhuvi", p1: "AD Russell", p2: "B Kumar" },
            { label: "Rohit vs Mishra", p1: "RG Sharma", p2: "A Mishra" },
            { label: "Warner vs Ashwin", p1: "DA Warner", p2: "R Ashwin" },
            {
              label: "Gayle vs Harbhajan",
              p1: "CH Gayle",
              p2: "Harbhajan Singh",
            },
            { label: "Dhawan vs Chawla", p1: "S Dhawan", p2: "PP Chawla" },
          ].map((rivalry) => (
            <Chip
              key={rivalry.label}
              label={rivalry.label}
              onClick={() => handleDefaultClick(rivalry.p1, rivalry.p2)}
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

      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            width: "100%",
            color: "text.primary",
          }}
        >
          <CircularProgress size={60} thickness={4} color="primary" />
          <Typography
            variant="h6"
            sx={{
              mt: 3,
              fontWeight: 600,
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Analyzing Matchup...
          </Typography>
        </Box>
      )}

      {!loading && stats && (
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.8rem" },
              textAlign: "center",
              mt: 4,
              mb: 4,
              display: "block",
              width: "100%",
            }}
          >
            {stats.player1.name} vs {stats.player2.name}
          </Typography>

          {renderSection(stats.player1, stats.player2, stats.p1Batting)}
          {renderSection(stats.player2, stats.player1, stats.p2Batting)}

          {!stats.p1Batting && !stats.p2Batting && (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No ball-by-ball data found between these two players.
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {!loading && !stats && searched && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No historical matchups found between these two players.
          </Typography>
        </Paper>
      )}

      <Dialog
        open={Boolean(selectedYear)}
        onClose={() => setSelectedYear(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            bgcolor: "primary.main",
            color: "white",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
              pr: 6,
              pl: 6,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ textAlign: "center", width: "100%" }}
            >
              Ball-by-Ball Log: {selectedYear}
            </Typography>
            {selectedBatter && selectedBowler && (
              <Typography
                variant="subtitle2"
                sx={{ opacity: 0.9, textAlign: "center", width: "100%" }}
              >
                {selectedBatter.name} (
                {selectedBatter.teamMap?.[selectedYear] || "Unknown"}) vs{" "}
                {selectedBowler.name} (
                {selectedBowler.teamMap?.[selectedYear] || "Unknown"})
              </Typography>
            )}
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setSelectedYear(null)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
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
          <TableContainer
            sx={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 3,
              },
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: "rgba(0,0,0,0.05)" }}>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Venue
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Over
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Runs
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Extras
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Wicket
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedDeliveries.map((ball, i) => {
                  const [y, m, d] = (ball.date || "").split("-");
                  const fDate = y && m && d ? `${d}-${m}-${y}` : ball.date;
                  return (
                    <TableRow
                      key={i}
                      sx={{
                        bgcolor: ball.wicket
                          ? "rgba(255, 71, 87, 0.1)"
                          : "inherit",
                      }}
                    >
                      <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
                        {fDate}
                      </TableCell>
                      <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
                        {ball.venue}
                      </TableCell>
                      <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
                        Over {ball.over}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: ball.runs >= 4 ? 800 : 400,
                          color:
                            ball.runs === 4
                              ? "#2196f3"
                              : ball.runs === 6
                                ? "#9c27b0"
                                : "inherit",
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        {ball.runs}
                      </TableCell>
                      <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
                        {ball.extras || "-"}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: "#ff4757",
                          fontWeight: 700,
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        {ball.wicket || "-"}
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

export default HeadToHeadMatchups;
