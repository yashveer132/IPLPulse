import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Autocomplete,
  TextField,
  CircularProgress,
  Chip,
  LinearProgress,
} from "@mui/material";
import LoadingCard from "../components/common/LoadingCard.jsx";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../api/index.js";
import { usePlayerPhoto } from "../hooks/usePlayerPhoto.js";
import {
  getPlayerDisplayName,
  deduplicatePlayers,
} from "../utils/playerHelpers.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import PageHeader from "../components/common/PageHeader.jsx";

const GlassCard = ({ children, sx = {}, ...props }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 3, md: 4 },
      borderRadius: 4,
      border: "1px solid rgba(148, 163, 184, 0.08)",
      bgcolor: "rgba(17, 24, 39, 0.6)",
      backdropFilter: "blur(20px)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      width: "100%",
      boxSizing: "border-box",
      "&:hover": {
        border: "1px solid rgba(148, 163, 184, 0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        transform: "translateY(-2px)",
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Paper>
);

export default function PlayerIntelligence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  const [playerInfo, setPlayerInfo] = useState(null);
  const [similarPlayers, setSimilarPlayers] = useState(null);
  const [hof, setHof] = useState(null);
  const [legacy, setLegacy] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [impact, setImpact] = useState(null);
  const [rivalries, setRivalries] = useState(null);
  const [records, setRecords] = useState(null);
  const [playerDna, setPlayerDna] = useState(null);
  const [trajectory, setTrajectory] = useState(null);
  const [loading, setLoading] = useState(false);

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
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        apiClient.get(`/players/${id}`),
        apiClient.get(`/analytics/similar-players/${id}`),
        apiClient.get(`/analytics/historical-rankings/${id}`),
        apiClient.get(`/analytics/legacy-score/${id}`),
        apiClient.get(`/analytics/career-milestones/${id}`),
        apiClient.get(`/analytics/impact-differential/${id}`),
        apiClient.get(`/analytics/historical-rivalries/${id}`),
        apiClient.get(`/analytics/career-records/${id}`),
        apiClient.get(`/analytics/player-dna/${id}`),
        apiClient.get(`/analytics/career-trajectory/${id}`),
      ])
        .then(
          ([
            infoRes,
            simRes,
            hofRes,
            legRes,
            mileRes,
            impRes,
            rivRes,
            recRes,
            dnaRes,
            trajRes,
          ]) => {
            setPlayerInfo(infoRes);
            setSimilarPlayers(simRes);
            setHof(hofRes);
            setLegacy(legRes);
            setMilestones(mileRes);
            setImpact(impRes);
            setRivalries(rivRes);
            setRecords(recRes);
            setPlayerDna(dnaRes);
            setTrajectory(trajRes);
            setLoading(false);
          },
        )
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (!id) {
    return (
      <Container
        maxWidth="md"
        sx={{ mt: { xs: 0.5, sm: 1, md: 2 }, textAlign: "center" }}
      >
        <PageHeader
          title="Player Intelligence Hub"
          subtitle="Search for any player to generate their stats profile."
        />
        <Autocomplete
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
          onChange={(event, newValue) => {
            if (newValue)
              navigate(`/analytics/player-intelligence/${newValue.id}`);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Player (e.g., Virat Kohli)"
              variant="outlined"
              autoFocus
            />
          )}
        />
      </Container>
    );
  }

  if (loading || !playerInfo || !hof || !trajectory) {
    const searchedPlayer = id ? players.find((p) => p.id === id) : null;
    const searchedName = searchedPlayer
      ? searchedPlayer.displayName || searchedPlayer.name
      : "";

    return (
      <Container maxWidth="xl" sx={{ pt: 0, pb: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: { xs: 1, sm: 2 } }}>
          <PageHeader
            title="Player Intelligence Profile"
            subtitle="Detailed stats overview and phase breakdown"
          />
        </Box>

        <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
          <Autocomplete
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
            onChange={(event, newValue) => {
              if (newValue)
                navigate(`/analytics/player-intelligence/${newValue.id}`);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Player (e.g., MS Dhoni)"
                variant="outlined"
              />
            )}
          />
        </Box>

        <LoadingCard
          title="Player Intelligence"
          message={
            searchedName
              ? `Synthesizing stats, value modeling, and career trajectories for ${searchedName}...`
              : "Synthesizing player stats, value modeling, and career trajectories..."
          }
          minHeight="50vh"
        />
      </Container>
    );
  }

  const derivedRole =
    trajectory.seasons.reduce((sum, s) => sum + s.runs, 0) >
    trajectory.seasons.reduce((sum, s) => sum + s.wickets, 0) * 20
      ? "Batter"
      : "Bowler";

  const generateNarrative = () => {
    const debut =
      trajectory.seasons.length > 0 ? trajectory.seasons[0].season : 2008;
    const rankStr =
      hof.hallOfFame.rank === 1
        ? "the most prolific player"
        : `one of the elite ${derivedRole}s`;

    let text = `${playerInfo.name} debuted in ${debut} and evolved into ${rankStr} in IPL history. `;
    if (trajectory.primeEra) {
      text += `His prime arrived between ${trajectory.primeEra} where he produced the highest-impact performances of his career. `;
    }
    if (hof.hallOfFame.rank <= 10) {
      text += `His exceptional longevity and consistency place him #${hof.hallOfFame.rank} in the All-Time Hall of Fame.`;
    } else {
      text += `He currently sits in the ${hof.allTimeRunPercentile}th percentile of historical IPL talent.`;
    }
    return text;
  };

  const badges = [];
  if (hof.hallOfFame.rank <= 10)
    badges.push(`👑 Hall of Fame #${hof.hallOfFame.rank}`);
  if (playerDna?.playstyle === "Pure Aggressor")
    badges.push("💀 Powerplay Destroyer");
  if (playerDna?.playstyle === "Anchor + Aggressor")
    badges.push("🏃 Chase Master");
  if (hof.contextRankings?.strikeRatePercentile > 90)
    badges.push("🔥 Strike Rate Elite");
  if (hof.contextRankings?.averagePercentile > 90)
    badges.push("🎯 Consistency King");
  if (derivedRole === "Bowler" && playerDna?.phaseImpacts?.deathOvers > 8)
    badges.push("🎯 Death Specialist");

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  let primeDetails = null;
  if (trajectory.primeEra) {
    const [start, end] = trajectory.primeEra.split("-");
    const primeSeasons = trajectory.seasons.filter(
      (s) => s.season >= parseInt(start) && s.season <= parseInt(end),
    );
    const isBlockBatter = derivedRole === "Batter";
    primeDetails = {
      start,
      end,
      metric1: isBlockBatter
        ? primeSeasons.reduce((sum, s) => sum + s.runs, 0)
        : primeSeasons.reduce((sum, s) => sum + s.wickets, 0),
      label1: isBlockBatter ? "Runs" : "Wickets",
      metric2: isBlockBatter
        ? (
            primeSeasons.reduce((sum, s) => sum + s.average, 0) /
            primeSeasons.length
          ).toFixed(1)
        : (
            primeSeasons.reduce((sum, s) => sum + s.economy, 0) /
            primeSeasons.length
          ).toFixed(1),
      label2: isBlockBatter ? "Average" : "Economy",
      metric3: isBlockBatter
        ? (
            primeSeasons.reduce((sum, s) => sum + s.strikeRate, 0) /
            primeSeasons.length
          ).toFixed(1)
        : (
            primeSeasons.reduce((sum, s) => sum + s.bowlingAvg, 0) /
            primeSeasons.length
          ).toFixed(1),
      label3: isBlockBatter ? "Strike Rate" : "Bowling Avg",
    };
  }

  const recordsHeld = [];
  if (hof.allTimeRunRank === 1) recordsHeld.push("Most Runs in IPL History");
  if (hof.allTimeWktRank === 1) recordsHeld.push("Most Wickets in IPL History");
  if (hof.contextRankings?.centuriesRank === 1)
    recordsHeld.push("Most Centuries in IPL History");
  if (hof.contextRankings?.fiftiesRank === 1)
    recordsHeld.push("Most 50+ Scores");
  if (legacy?.valueScore > 200)
    recordsHeld.push("Most Valuable Player (All-Time)");

  return (
    <Container maxWidth="xl" sx={{ pt: 0, pb: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: { xs: 1, sm: 2 } }}>
        <PageHeader
          title="Player Intelligence Profile"
          subtitle={`Detailed stats overview and phase breakdown for ${playerInfo.name}`}
        />
      </Box>

      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
        <Autocomplete
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
          onChange={(event, newValue) => {
            if (newValue)
              navigate(`/analytics/player-intelligence/${newValue.id}`);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Player (e.g., MS Dhoni)"
              variant="outlined"
            />
          )}
        />
      </Box>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ width: "100%" }}
        >
          <GlassCard
            sx={{
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(17, 24, 39, 0.9) 100%)",
              borderLeft: "4px solid #6366f1",
              p: { xs: 4, md: 6 },
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              gap={1.5}
              rowGap={1.5}
              mb={2}
              flexWrap="wrap"
            >
              <Chip
                label={derivedRole}
                color="primary"
                sx={{ fontWeight: 800, fontSize: "0.85rem" }}
              />
              <Chip
                label={`All-Time Rank: #${hof.hallOfFame.rank}`}
                sx={{
                  bgcolor: "white",
                  color: "black",
                  fontWeight: 950,
                  fontSize: "0.85rem",
                }}
              />
            </Box>

            <Typography
              variant="h3"
              fontWeight={900}
              mb={2}
              sx={{
                letterSpacing: "-0.02em",
                textAlign: "center",
                background: "linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              {playerInfo.name}
            </Typography>

            <Box
              display="flex"
              justifyContent="center"
              gap={1.5}
              rowGap={1.5}
              mb={3}
              flexWrap="wrap"
            >
              {badges.map((b, i) => (
                <Chip
                  key={i}
                  label={b}
                  size="small"
                  sx={{
                    bgcolor: "rgba(99, 102, 241, 0.15)",
                    color: "#a5b4fc",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    fontWeight: 800,
                  }}
                />
              ))}
            </Box>
          </GlassCard>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: primeDetails
              ? { xs: "1fr", md: "1fr 2fr" }
              : "1fr",
            gap: 4,
            width: "100%",
          }}
        >
          {primeDetails && (
            <Box
              component={motion.div}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ height: "100%" }}
            >
              <GlassCard
                sx={{
                  height: "100%",
                  justifyContent: "space-between",
                  background:
                    "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(17, 24, 39, 0.9) 100%)",
                  borderLeft: "4px solid #6366f1",
                  p: 4,
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      color: "#818cf8",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    PRIME ERA
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    mb={1}
                    color="white"
                  >
                    {primeDetails.start}–{primeDetails.end}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 4 }}
                  >
                    Highest 3-year peak in career
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 2,
                    width: "100%",
                    mt: "auto",
                  }}
                >
                  <Box>
                    <Typography variant="h4" fontWeight={900} color="#f59e0b">
                      {primeDetails.metric1}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontWeight: 800 }}
                    >
                      {primeDetails.label1}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={900} color="#10b981">
                      {primeDetails.metric2}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontWeight: 800 }}
                    >
                      {primeDetails.label2}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={900} color="#0ea5e9">
                      {primeDetails.metric3}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontWeight: 800 }}
                    >
                      {primeDetails.label3}
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Box>
          )}

          {playerDna && (
            <Box
              component={motion.div}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ height: "100%" }}
            >
              <GlassCard
                sx={{
                  p: 4,
                  height: "100%",
                  borderLeft: "4px solid #10b981",
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(17, 24, 39, 0.9) 100%)",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={800}
                  mb={3}
                  sx={{
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  🧬 Player DNA
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 4,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={800}
                      sx={{ letterSpacing: 1 }}
                    >
                      RUN DISTRIBUTION
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="body2"
                          sx={{
                            width: 110,
                            textAlign: "left",
                            fontWeight: 700,
                          }}
                        >
                          Boundary Runs
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={playerDna.distribution.boundaryPct}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: "rgba(255, 255, 255, 0.05)",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: "#ec4899",
                              },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="#ec4899"
                        >
                          {Math.round(playerDna.distribution.boundaryPct)}%
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="body2"
                          sx={{
                            width: 110,
                            textAlign: "left",
                            fontWeight: 700,
                          }}
                        >
                          Running Runs
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={playerDna.distribution.runningPct}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: "rgba(255, 255, 255, 0.05)",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: "#6366f1",
                              },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="#6366f1"
                        >
                          {Math.round(playerDna.distribution.runningPct)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "rgba(16, 185, 129, 0.08)",
                        borderRadius: 3,
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                        textAlign: "center",
                        mt: "auto",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        fontWeight={750}
                        sx={{ mb: 0.5 }}
                      >
                        IDENTIFIED PLAYSTYLE
                      </Typography>
                      <Typography variant="h6" fontWeight={900} color="#10b981">
                        {playerDna.playstyle}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={800}
                      sx={{ letterSpacing: 1 }}
                    >
                      PHASE IMPACT SCORE
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: "auto",
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(255,255,255,0.02)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" fontWeight={700}>
                          Powerplay
                        </Typography>
                        <Chip
                          label={`${playerDna.phaseImpacts.powerplay} / 10`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(245, 158, 11, 0.15)",
                            color: "#f59e0b",
                            fontWeight: 800,
                          }}
                        />
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(255,255,255,0.02)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" fontWeight={700}>
                          Middle Overs
                        </Typography>
                        <Chip
                          label={`${playerDna.phaseImpacts.middleOvers} / 10`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            fontWeight: 800,
                          }}
                        />
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(255,255,255,0.02)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" fontWeight={700}>
                          Death Overs
                        </Typography>
                        <Chip
                          label={`${playerDna.phaseImpacts.deathOvers} / 10`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(236, 72, 153, 0.15)",
                            color: "#ec4899",
                            fontWeight: 800,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </GlassCard>
            </Box>
          )}
        </Box>

        <Box
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          transition={{ duration: 0.5, delay: 0.3 }}
          sx={{ width: "100%" }}
        >
          <GlassCard
            sx={{
              pt: 4,
              pb: 4,
              px: { xs: 1.5, sm: 2, md: 3 },
              alignItems: "stretch",
              borderLeft: "4px solid #ec4899",
              background:
                "linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(17, 24, 39, 0.9) 100%)",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={800}
              mb={3}
              sx={{
                color: "#ec4899",
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: "center",
              }}
            >
              📈 Career Trajectory
            </Typography>
            <Box sx={{ width: "100%", height: 320, mt: 2 }}>
              <ResponsiveContainer width="99%" height="100%">
                <LineChart
                  data={trajectory.seasons}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="season"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <RechartsTooltip
                    cursor={{
                      strokeDasharray: "3 3",
                      stroke: "rgba(255,255,255,0.1)",
                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(148, 163, 184, 0.15)",
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      color: "white",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    }}
                  />
                  {primeDetails && (
                    <ReferenceArea
                      x1={parseInt(primeDetails.start)}
                      x2={parseInt(primeDetails.end)}
                      strokeOpacity={0.3}
                      fill="#26D0CE"
                      fillOpacity={0.12}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Performance Score"
                    stroke="#ec4899"
                    strokeWidth={4}
                    dot={{
                      r: 4,
                      fill: "#ec4899",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </GlassCard>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: similarPlayers?.similarPlayers
              ? { xs: "1fr", md: "1fr 1fr" }
              : "1fr",
            gap: 4,
            width: "100%",
          }}
        >
          {similarPlayers?.similarPlayers && (
            <Box
              component={motion.div}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ height: "100%" }}
            >
              <GlassCard
                sx={{
                  p: 4,
                  height: "100%",
                  borderLeft: "4px solid #6366f1",
                  background:
                    "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(17, 24, 39, 0.9) 100%)",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={800}
                  mb={4}
                  sx={{ color: "#818cf8" }}
                >
                  👥 Similar Players
                </Typography>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={3}
                  sx={{ width: "100%" }}
                >
                  {similarPlayers.similarPlayers.slice(0, 2).map((sim, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(148, 163, 184, 0.05)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={1.5}
                        mb={2}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            display: "inline-flex",
                          }}
                        >
                          <CircularProgress
                            variant="determinate"
                            value={sim.matchPercentage}
                            size={55}
                            thickness={4.5}
                            sx={{ color: "#6366f1" }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: "absolute",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={900}
                              color="white"
                            >
                              {sim.matchPercentage}%
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight={800}
                            color="white"
                          >
                            {sim.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                          >
                            {sim.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="column"
                        gap={0.75}
                        alignItems="center"
                      >
                        {sim.reasons?.map((reason, i) => (
                          <Typography
                            key={i}
                            variant="caption"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: "#10b981" }}>✓</span> {reason}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </GlassCard>
            </Box>
          )}

          <Box
            component={motion.div}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ height: "100%" }}
          >
            <GlassCard
              sx={{
                p: 4,
                height: "100%",
                borderLeft: "4px solid #f59e0b",
                background:
                  "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(17, 24, 39, 0.9) 100%)",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h5"
                fontWeight={800}
                mb={5}
                sx={{ color: "#f59e0b" }}
              >
                📊 Historical Context
              </Typography>
              <Box mb={4} sx={{ width: "100%" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 700, mb: 1 }}
                >
                  Career Average
                </Typography>
                <Typography variant="h2" fontWeight={900} color="white">
                  {hof.contextRankings?.careerAverage}
                </Typography>
                <Chip
                  label={`${hof.contextRankings?.averagePercentile}th Percentile`}
                  size="small"
                  sx={{
                    mt: 1.5,
                    bgcolor: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    fontWeight: 800,
                  }}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 700, mb: 1 }}
                >
                  Career Strike Rate
                </Typography>
                <Typography variant="h2" fontWeight={900} color="white">
                  {hof.contextRankings?.careerStrikeRate}
                </Typography>
                <Chip
                  label={`${hof.contextRankings?.strikeRatePercentile}th Percentile`}
                  size="small"
                  sx={{
                    mt: 1.5,
                    bgcolor: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    fontWeight: 800,
                  }}
                />
              </Box>
            </GlassCard>
          </Box>
        </Box>

        {rivalries && (
          <Box
            component={motion.div}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.5 }}
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <GlassCard
              sx={{
                p: 4,
                width: "100%",
                borderLeft: "4px solid #6366f1",
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(17, 24, 39, 0.9) 100%)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight={800}
                mb={4}
                sx={{ color: "#818cf8" }}
              >
                ⚔️ Rivalry Matrix
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    rivalries.nemesis && rivalries.favorite
                      ? { xs: "1fr", md: "1fr 1fr" }
                      : "1fr",
                  gap: 4,
                  width: "100%",
                }}
              >
                {rivalries.nemesis && (
                  <Box
                    sx={{
                      p: 3.5,
                      borderRadius: 4,
                      bgcolor: "rgba(239, 68, 68, 0.05)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: "#ef4444",
                        fontWeight: 900,
                        letterSpacing: 1.5,
                        display: "block",
                        mb: 1,
                      }}
                    >
                      STRUGGLES AGAINST
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      mb={3}
                      color="white"
                    >
                      {rivalries.nemesis.opponent}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 2,
                        mb: 3,
                        width: "100%",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            display: "block",
                          }}
                        >
                          Dismissals
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          color="#ef4444"
                        >
                          {rivalries.nemesis.dismissals}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            display: "block",
                          }}
                        >
                          Average
                        </Typography>
                        <Typography variant="h5" fontWeight={900} color="white">
                          {rivalries.nemesis.dismissals === 0 ||
                          String(rivalries.nemesis.average).includes("∞") ||
                          String(rivalries.nemesis.average).includes("Infinity")
                            ? "—"
                            : rivalries.nemesis.average}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            display: "block",
                          }}
                        >
                          Strike Rate
                        </Typography>
                        <Typography variant="h5" fontWeight={900} color="white">
                          {rivalries.nemesis.sr.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        color: "text.secondary",
                        fontWeight: 700,
                      }}
                    >
                      {rivalries.nemesis.dismissals === 0 ||
                      String(rivalries.nemesis.ballsPerDismissal).includes(
                        "∞",
                      ) ||
                      String(rivalries.nemesis.ballsPerDismissal).includes(
                        "Infinity",
                      ) ? (
                        <span style={{ color: "#ef4444", fontWeight: 800 }}>
                          Never Dismissed
                        </span>
                      ) : (
                        <>
                          Dismissed every{" "}
                          <span style={{ color: "#ef4444", fontWeight: 800 }}>
                            {rivalries.nemesis.ballsPerDismissal}
                          </span>{" "}
                          balls
                        </>
                      )}
                    </Typography>
                  </Box>
                )}
                {rivalries.favorite && (
                  <Box
                    sx={{
                      p: 3.5,
                      borderRadius: 4,
                      bgcolor: "rgba(16, 185, 129, 0.05)",
                      border: "1px solid rgba(16, 185, 129, 0.15)",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: "#10b981",
                        fontWeight: 900,
                        letterSpacing: 1.5,
                        display: "block",
                        mb: 1,
                      }}
                    >
                      DOMINATES
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      mb={3}
                      color="white"
                    >
                      {rivalries.favorite.opponent}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 2,
                        mb: 3,
                        width: "100%",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            display: "block",
                          }}
                        >
                          Runs Scored
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          color="#10b981"
                        >
                          {rivalries.favorite.runs}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            display: "block",
                          }}
                        >
                          Average
                        </Typography>
                        <Typography variant="h5" fontWeight={900} color="white">
                          {rivalries.favorite.average === "∞" ||
                          String(rivalries.favorite.average).includes("∞") ||
                          String(rivalries.favorite.average).includes(
                            "Infinity",
                          )
                            ? "—"
                            : rivalries.favorite.average}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            display: "block",
                          }}
                        >
                          Strike Rate
                        </Typography>
                        <Typography variant="h5" fontWeight={900} color="white">
                          {rivalries.favorite.sr.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        color: "text.secondary",
                        fontWeight: 700,
                      }}
                    >
                      {String(rivalries.favorite.ballsPerDismissal).includes(
                        "∞",
                      ) ||
                      String(rivalries.favorite.ballsPerDismissal).includes(
                        "Infinity",
                      ) ? (
                        <span style={{ color: "#10b981", fontWeight: 800 }}>
                          Never Dismissed
                        </span>
                      ) : (
                        <>
                          Dismissed every{" "}
                          <span style={{ color: "#10b981", fontWeight: 800 }}>
                            {rivalries.favorite.ballsPerDismissal}
                          </span>{" "}
                          balls
                        </>
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
            </GlassCard>
          </Box>
        )}

        <Box
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          transition={{ duration: 0.5, delay: 0.7 }}
          sx={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <GlassCard
            sx={{
              p: 4,
              width: "100%",
              borderLeft: "4px solid #a855f7",
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(17, 24, 39, 0.9) 100%)",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={800}
              mb={3}
              sx={{ color: "#c084fc" }}
            >
              ⏳ Career Eras
            </Typography>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "center",
                gap: { xs: 4, sm: 8, md: 16 },
                alignItems: "center",
                width: "100%",
                px: { xs: 2, md: 8 },
                mt: 4,
                mb: 2,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: { xs: "50%", sm: 0 },
                  right: { xs: "auto", sm: 0 },
                  top: { xs: 0, sm: "50%" },
                  bottom: { xs: 0, sm: "auto" },
                  transform: { xs: "translateX(-50%)", sm: "translateY(-50%)" },
                  width: { xs: 2, sm: "auto" },
                  height: { xs: "100%", sm: 2 },
                  bgcolor: "rgba(255,255,255,0.1)",
                  zIndex: 0,
                },
              }}
            >
              {trajectory.eras?.map((era, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    zIndex: 1,
                    bgcolor: "rgba(17, 24, 39, 0.95)",
                    px: 2,
                    py: { xs: 1, sm: 0 },
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: era.name === "Prime" ? "#c084fc" : "#475569",
                      border: "3px solid #0f172a",
                      mb: 1,
                      boxShadow:
                        era.name === "Prime" ? "0 0 12px #c084fc" : "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight={900}
                    color={era.name === "Prime" ? "#c084fc" : "white"}
                    sx={{ fontSize: { xs: "0.85rem", sm: "1.05rem" } }}
                  >
                    {era.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                  >
                    {era.start} – {era.end}
                  </Typography>
                </Box>
              ))}
            </Box>
          </GlassCard>
        </Box>
      </Box>
    </Container>
  );
}
