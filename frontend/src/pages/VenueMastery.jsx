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
} from "@mui/material";
import { apiClient } from "../api/index.js";
import PageHeader from "../components/common/PageHeader.jsx";

function VenueMastery() {
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState("");

  useEffect(() => {
    apiClient
      .get("/players?limit=3000")
      .then((res) => setPlayers(res.players || []))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = () => {
    if (player) {
      setLoading(true);
      apiClient
        .get(`/analytics/venue-mastery/${player.id}`)
        .then((res) => {
          setStats(res || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
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
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <PageHeader
        title="The Ultimate Venue Mastery"
        subtitle="Discover which players have turned specific stadiums into their fortresses."
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
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Autocomplete
            fullWidth
            options={players}
            getOptionLabel={(option) => option.name}
            value={player}
            onChange={(e, val) => setPlayer(val)}
            renderInput={(params) => (
              <TextField {...params} label="Select Player" variant="outlined" />
            )}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            disabled={!player || loading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Searching..." : "Analyze Venue Data"}
          </Button>
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
            Analyzing Venue Mastery...
          </Typography>
        </Box>
      )}

      {!loading && stats.length > 0 && (
        <Grid container spacing={4}>
          {stats.map((venueStat) => {
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

            const dismissals = venueStat.inningsBat - venueStat.notOuts;
            const trueAverage =
              dismissals > 0
                ? (venueStat.runsScored / dismissals).toFixed(1)
                : venueStat.runsScored > 0
                  ? "-"
                  : "0.0";
            const boundaryRuns = venueStat.fours * 4 + venueStat.sixes * 6;
            const boundaryReliance =
              venueStat.runsScored > 0
                ? Math.round((boundaryRuns / venueStat.runsScored) * 100)
                : 0;
            const sr =
              venueStat.ballsFaced > 0
                ? ((venueStat.runsScored / venueStat.ballsFaced) * 100).toFixed(
                    1,
                  )
                : 0;
            const economy =
              venueStat.ballsBowled > 0
                ? (
                    (venueStat.runsConceded / venueStat.ballsBowled) *
                    6
                  ).toFixed(2)
                : 0;
            const bowlingAvg =
              venueStat.wickets > 0
                ? (venueStat.runsConceded / venueStat.wickets).toFixed(1)
                : "-";
            const bestBowlingStr =
              venueStat.bestBowlingWickets > 0
                ? `${venueStat.bestBowlingWickets}/${venueStat.bestBowlingRuns}`
                : "-";

            return (
              <Grid item xs={12} md={6} lg={4} key={venueStat.id}>
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
                    transition:
                      "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 30px rgba(99, 102, 241, 0.15)",
                      borderColor: "rgba(99, 102, 241, 0.4)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.05)",
                      p: 2,
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={800} noWrap>
                      {venueStat.venue}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                      {venueStat.matchesPlayed} Matches Played
                    </Typography>
                  </Box>

                  {hasMilestones && (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "rgba(245, 158, 11, 0.1)",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
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

                  <CardContent>
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
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            {renderStatCard(
                              "Runs",
                              venueStat.runsScored,
                              "white",
                              `${venueStat.inningsBat} Innings`,
                            )}
                          </Grid>
                          <Grid item xs={6}>
                            {renderStatCard(
                              "High Score",
                              venueStat.highestScore > 0
                                ? venueStat.notOuts > 0
                                  ? `${venueStat.highestScore}*`
                                  : venueStat.highestScore
                                : "-",
                              "#f59e0b",
                            )}
                          </Grid>
                          <Grid item xs={6}>
                            {renderStatCard("True Average", trueAverage)}
                          </Grid>
                          <Grid item xs={6}>
                            {renderStatCard("Strike Rate", sr)}
                          </Grid>
                        </Grid>
                        {venueStat.runsScored > 0 && (
                          <Box mt={2}>
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
                              {venueStat.fours} Fours | {venueStat.sixes} Sixes
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
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            {renderStatCard(
                              "Wickets",
                              venueStat.wickets,
                              "white",
                              `${venueStat.inningsBowl} Innings`,
                            )}
                          </Grid>
                          <Grid item xs={6}>
                            {renderStatCard(
                              "Best Figures",
                              bestBowlingStr,
                              "#ff4757",
                            )}
                          </Grid>
                          <Grid item xs={6}>
                            {renderStatCard("Average", bowlingAvg)}
                          </Grid>
                          <Grid item xs={6}>
                            {renderStatCard("Economy", economy)}
                          </Grid>
                        </Grid>
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
                        <Grid container spacing={2} justifyContent="center">
                          {venueStat.catches > 0 && (
                            <Grid item xs={4}>
                              {renderStatCard("Catches", venueStat.catches)}
                            </Grid>
                          )}
                          {venueStat.stumpings > 0 && (
                            <Grid item xs={4}>
                              {renderStatCard("Stumpings", venueStat.stumpings)}
                            </Grid>
                          )}
                          {venueStat.runOuts > 0 && (
                            <Grid item xs={4}>
                              {renderStatCard("Run Outs", venueStat.runOuts)}
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={Boolean(selectedLogs)}
        onClose={() => setSelectedLogs(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            bgcolor: "primary.main",
            color: "white",
            textAlign: "center",
          }}
        >
          Historical Match Log: {selectedVenue}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: "auto" }}>
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
                    Runs
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Balls
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    SR
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Wickets
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Overs
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
                    align="center"
                  >
                    Econ
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, px: { xs: 1, sm: 2 } }}
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
                          sx={{ whiteSpace: "nowrap", px: { xs: 1, sm: 2 } }}
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
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {log.runs > 0 || log.balls > 0 ? log.runs : "-"}
                        </TableCell>
                        <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
                          {log.balls > 0 ? log.balls : "-"}
                        </TableCell>
                        <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
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
                            px: { xs: 1, sm: 2 },
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
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {log.ballsBowled > 0 ? log.wickets : "-"}
                        </TableCell>
                        <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
                          {log.ballsBowled > 0
                            ? `${overs} (${log.runsConceded})`
                            : "-"}
                        </TableCell>
                        <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
                          {econ}
                        </TableCell>
                        <TableCell sx={{ px: { xs: 1, sm: 2 } }} align="center">
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
