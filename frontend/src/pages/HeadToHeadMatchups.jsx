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

function HeadToHeadMatchups() {
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

  const StatCard = ({ label, value, color = "white" }) => (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h3" fontWeight={800} color={color}>
        {value}
      </Typography>
      <Typography variant="overline" color="rgba(255,255,255,0.7)">
        {label}
      </Typography>
    </Box>
  );

  const renderSection = (batter, bowler, data) => {
    if (!data) return null;
    const dom = getDominance(data);
    const timelineData = buildTimelineData(data.seasonDetails);
    const title = `🏏 ${batter.name} batting vs ${bowler.name} bowling`;

    return (
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          color: "white",
          mb: 3,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            color="rgba(255,255,255,0.85)"
          >
            {title}
          </Typography>
          <Chip
            label={dom.label}
            sx={{ bgcolor: dom.color, color: "white", fontWeight: 800 }}
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
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              fontWeight={800}
              color={data.dismissals > 0 ? "#ff4757" : "white"}
            >
              {data.dismissals}
            </Typography>
            <Typography variant="overline" color="rgba(255,255,255,0.7)">
              Dismissals
            </Typography>
            {data.dismissalDetails &&
              Object.keys(data.dismissalDetails).length > 0 && (
                <Box mt={0.5}>
                  {Object.entries(data.dismissalDetails).map(
                    ([kind, count]) => (
                      <Typography
                        key={kind}
                        variant="caption"
                        display="block"
                        sx={{ opacity: 0.8 }}
                      >
                        {kind}: {count}
                      </Typography>
                    ),
                  )}
                </Box>
              )}
          </Box>
          <StatCard label="Strike Rate" value={data.strikeRate?.toFixed(1)} />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 2, md: 5 },
            mb: 4,
            p: 3,
            bgcolor: "rgba(0,0,0,0.2)",
            borderRadius: 3,
            flexWrap: "wrap",
          }}
        >
          <StatCard
            label="True Average"
            value={
              data.dismissals > 0
                ? (data.runsScored / data.dismissals).toFixed(1)
                : "-"
            }
            color="#4caf50"
          />
          <StatCard
            label="Dot Ball %"
            value={
              data.ballsFaced > 0
                ? ((data.dotBalls / data.ballsFaced) * 100).toFixed(1) + "%"
                : "0%"
            }
            color="#ff9800"
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
            color="#2196f3"
          />
          <StatCard
            label="Fours / Sixes"
            value={`${data.fours} / ${data.sixes}`}
            color="#9c27b0"
          />
        </Box>

        {data.phaseDetails && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="rgba(255,255,255,0.6)"
              mb={2}
              textAlign="center"
              sx={{ letterSpacing: 1, textTransform: "uppercase" }}
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
                      display="flex"
                      justifyContent="space-around"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="h5" fontWeight={800}>
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
                        <Typography variant="h5" fontWeight={800}>
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
            sx={{ mt: 4, pt: 3, borderTop: "1px solid rgba(255,255,255,0.2)" }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              textAlign="center"
              mb={2}
              color="rgba(255,255,255,0.8)"
            >
              Year-by-Year Breakdown (Click for log)
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
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
                        p: 1.5,
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 2,
                        textAlign: "center",
                        minWidth: 100,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="#f59e0b"
                      >
                        {year}
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {sData.runs}{" "}
                        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                          ({sData.balls})
                        </span>
                      </Typography>
                      {sData.wkts > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#ff4757",
                            display: "block",
                            fontWeight: 800,
                          }}
                        >
                          {sData.wkts} WKTS
                        </Typography>
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
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <PageHeader
        title="Head-to-Head Matchups"
        subtitle="Analyze every delivery between any two players in IPL history."
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Autocomplete
            fullWidth
            options={players}
            getOptionLabel={(option) => option.name}
            value={player1}
            onChange={(e, val) => {
              setPlayer1(val);
              setSearched(false);
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
        <Box sx={{ flex: 1 }}>
          <Autocomplete
            fullWidth
            options={players}
            getOptionLabel={(option) => option.name}
            value={player2}
            onChange={(e, val) => {
              setPlayer2(val);
              setSearched(false);
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
      </Box>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSearch}
          disabled={!player1 || !player2 || loading}
          sx={{ px: 6, py: 1.5, fontSize: "1.1rem", borderRadius: 2 }}
        >
          {loading ? "Searching..." : "Analyze Matchup"}
        </Button>
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        gap={2}
        mb={4}
        flexWrap="wrap"
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            width: "100%",
            textAlign: "center",
            mb: 1,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Iconic Rivalries
        </Typography>
        <Chip
          label="Dhoni vs Bumrah"
          onClick={() => handleDefaultClick("MS Dhoni", "JJ Bumrah")}
          clickable
          sx={{
            fontWeight: 800,
            bgcolor: "rgba(255,255,255,0.05)",
            color: "white",
            "&:hover": { bgcolor: "primary.main" },
          }}
        />
        <Chip
          label="Kohli vs Narine"
          onClick={() => handleDefaultClick("V Kohli", "SP Narine")}
          clickable
          sx={{
            fontWeight: 800,
            bgcolor: "rgba(255,255,255,0.05)",
            color: "white",
            "&:hover": { bgcolor: "primary.main" },
          }}
        />
        <Chip
          label="ABD vs Rashid"
          onClick={() => handleDefaultClick("AB de Villiers", "Rashid Khan")}
          clickable
          sx={{
            fontWeight: 800,
            bgcolor: "rgba(255,255,255,0.05)",
            color: "white",
            "&:hover": { bgcolor: "primary.main" },
          }}
        />
        <Chip
          label="Russell vs Bhuvi"
          onClick={() => handleDefaultClick("AD Russell", "B Kumar")}
          clickable
          sx={{
            fontWeight: 800,
            bgcolor: "rgba(255,255,255,0.05)",
            color: "white",
            "&:hover": { bgcolor: "primary.main" },
          }}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && stats && (
        <Box>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={3}>
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
          sx={{ fontWeight: 800, bgcolor: "primary.main", color: "white" }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" fontWeight={800}>
              Ball-by-Ball Log: {selectedYear}
            </Typography>
            {selectedBatter && selectedBowler && (
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                {selectedBatter.name} (
                {selectedBatter.teamMap?.[selectedYear] || "Unknown"}){" vs "}
                {selectedBowler.name} (
                {selectedBowler.teamMap?.[selectedYear] || "Unknown"})
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "rgba(0,0,0,0.05)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Venue</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Over</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Runs</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Extras</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Wicket</TableCell>
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
                      <TableCell>{fDate}</TableCell>
                      <TableCell>{ball.venue}</TableCell>
                      <TableCell>Over {ball.over}</TableCell>
                      <TableCell
                        sx={{
                          fontWeight: ball.runs >= 4 ? 800 : 400,
                          color:
                            ball.runs === 4
                              ? "#2196f3"
                              : ball.runs === 6
                                ? "#9c27b0"
                                : "inherit",
                        }}
                      >
                        {ball.runs}
                      </TableCell>
                      <TableCell>{ball.extras || "-"}</TableCell>
                      <TableCell sx={{ color: "#ff4757", fontWeight: 700 }}>
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
