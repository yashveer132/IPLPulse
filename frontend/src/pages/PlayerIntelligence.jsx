import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/index.js';
import { usePlayerPhoto } from '../hooks/usePlayerPhoto.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';

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

  const { photoUrl, loading: photoLoading } = usePlayerPhoto(playerInfo?.name);

  useEffect(() => {
    apiClient
      .get('/players?limit=3000')
      .then((res) => setPlayers(res.players || []))
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
          ([infoRes, simRes, hofRes, legRes, mileRes, impRes, rivRes, recRes, dnaRes, trajRes]) => {
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
          }
        )
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (!id) {
    return (
      <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={900} mb={3}>
          Player Intelligence Hub
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={6}>
          Search for any IPL player to generate a deep-dive analytics dossier.
        </Typography>
        <Autocomplete
          options={players}
          getOptionLabel={(option) => option.name}
          onChange={(event, newValue) => {
            if (newValue) navigate(`/analytics/player-intelligence/${newValue.id}`);
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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const derivedRole =
    trajectory.seasons.reduce((sum, s) => sum + s.runs, 0) >
    trajectory.seasons.reduce((sum, s) => sum + s.wickets, 0) * 20
      ? 'Batter'
      : 'Bowler';

  const generateNarrative = () => {
    const debut = trajectory.seasons.length > 0 ? trajectory.seasons[0].season : 2008;
    const rankStr =
      hof.hallOfFame.rank === 1 ? 'the most prolific player' : `one of the elite ${derivedRole}s`;

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
  if (hof.hallOfFame.rank <= 10) badges.push(`👑 Hall of Fame #${hof.hallOfFame.rank}`);
  if (playerDna?.playstyle === 'Pure Aggressor') badges.push('💀 Powerplay Destroyer');
  if (playerDna?.playstyle === 'Anchor + Aggressor') badges.push('🏃 Chase Master');
  if (hof.contextRankings?.strikeRatePercentile > 90) badges.push('🔥 Strike Rate Elite');
  if (hof.contextRankings?.averagePercentile > 90) badges.push('🎯 Consistency King');
  if (derivedRole === 'Bowler' && playerDna?.phaseImpacts?.deathOvers > 8)
    badges.push('🎯 Death Specialist');

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  let primeDetails = null;
  if (trajectory.primeEra) {
    const [start, end] = trajectory.primeEra.split('-');
    const primeSeasons = trajectory.seasons.filter(
      (s) => s.season >= parseInt(start) && s.season <= parseInt(end)
    );
    const isBatter = derivedRole === 'Batter';
    primeDetails = {
      start,
      end,
      metric1: isBatter
        ? primeSeasons.reduce((sum, s) => sum + s.runs, 0)
        : primeSeasons.reduce((sum, s) => sum + s.wickets, 0),
      label1: isBatter ? 'Runs' : 'Wickets',
      metric2: isBatter
        ? (primeSeasons.reduce((sum, s) => sum + s.average, 0) / primeSeasons.length).toFixed(1)
        : (primeSeasons.reduce((sum, s) => sum + s.economy, 0) / primeSeasons.length).toFixed(1),
      label2: isBatter ? 'Average' : 'Economy',
      metric3: isBatter
        ? (primeSeasons.reduce((sum, s) => sum + s.strikeRate, 0) / primeSeasons.length).toFixed(1)
        : (primeSeasons.reduce((sum, s) => sum + s.bowlingAvg, 0) / primeSeasons.length).toFixed(1),
      label3: isBatter ? 'Strike Rate' : 'Bowling Avg',
    };
  }

  const recordsHeld = [];
  if (hof.allTimeRunRank === 1) recordsHeld.push('Most Runs in IPL History');
  if (hof.allTimeWktRank === 1) recordsHeld.push('Most Wickets in IPL History');
  if (hof.contextRankings?.centuriesRank === 1) recordsHeld.push('Most Centuries in IPL History');
  if (hof.contextRankings?.fiftiesRank === 1) recordsHeld.push('Most 50+ Scores');
  if (legacy?.valueScore > 200) recordsHeld.push('Most Valuable Player (All-Time)');

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={4}>
        <Autocomplete
          options={players}
          getOptionLabel={(option) => option.name}
          onChange={(event, newValue) => {
            if (newValue) navigate(`/analytics/player-intelligence/${newValue.id}`);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Another Player (e.g., MS Dhoni)"
              variant="outlined"
            />
          )}
        />
      </Box>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 0,
            mb: 6,
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: '#121212',
            color: 'white',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              filter: 'blur(20px) brightness(0.3)',
              zIndex: 0,
            }}
          />

          <Grid container sx={{ position: 'relative', zIndex: 1 }}>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                pt: 4,
                bgcolor: 'rgba(0,0,0,0.4)',
              }}
            >
              <Box
                component="img"
                src={photoUrl}
                sx={{
                  width: '80%',
                  objectFit: 'contain',
                  maxHeight: 350,
                  filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))',
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={8}
              sx={{ p: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                <Chip
                  label={derivedRole}
                  color="primary"
                  sx={{ fontWeight: 800, fontSize: '0.9rem' }}
                />
                <Chip
                  label={`All-Time Rank: #${hof.hallOfFame.rank}`}
                  sx={{ bgcolor: 'white', color: 'black', fontWeight: 900 }}
                />
                {legacy && (
                  <Chip
                    label={`Legacy Points: ${Math.round(legacy.valueScore)}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600 }}
                  />
                )}
              </Box>

              <Typography variant="h2" fontWeight={900} mb={1} sx={{ letterSpacing: '-0.02em' }}>
                {playerInfo.name}
              </Typography>

              <Box display="flex" gap={1} mb={4} flexWrap="wrap">
                {badges.map((b, i) => (
                  <Chip
                    key={i}
                    label={b}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                ))}
              </Box>

              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.85)',
                  maxWidth: '90%',
                }}
              >
                {generateNarrative()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      <Grid container spacing={4} mb={6}>
        {primeDetails && (
          <Grid item xs={12} md={4}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
                  color: 'white',
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 800, letterSpacing: 1, opacity: 0.8 }}
                  >
                    PRIME ERA
                  </Typography>
                  <Typography variant="h3" fontWeight={900} mb={1}>
                    {primeDetails.start}–{primeDetails.end}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 4 }}>
                    Highest 3-year peak in career
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="h5" fontWeight={900}>
                      {primeDetails.metric1}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {primeDetails.label1}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h5" fontWeight={900}>
                      {primeDetails.metric2}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {primeDetails.label2}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h5" fontWeight={900}>
                      {primeDetails.metric3}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {primeDetails.label3}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        )}

        {playerDna && (
          <Grid item xs={12} md={8}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                <Typography variant="h5" fontWeight={800} mb={3}>
                  🧬 Player DNA
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700} mb={1}>
                      RUN DISTRIBUTION
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="body1" sx={{ width: 120 }}>
                        Boundary Runs
                      </Typography>
                      <Box sx={{ flexGrow: 1, mx: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={playerDna.distribution.boundaryPct}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': { bgcolor: '#FF416C' },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={700}>
                        {Math.round(playerDna.distribution.boundaryPct)}%
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={3}>
                      <Typography variant="body1" sx={{ width: 120 }}>
                        Running Runs
                      </Typography>
                      <Box sx={{ flexGrow: 1, mx: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={playerDna.distribution.runningPct}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': { bgcolor: '#4A00E0' },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={700}>
                        {Math.round(playerDna.distribution.runningPct)}%
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        IDENTIFIED PLAYSTYLE
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        {playerDna.playstyle}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700} mb={2}>
                      PHASE IMPACT SCORE (OUT OF 10)
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography variant="body1">Powerplay</Typography>
                      <Typography variant="body1" fontWeight={800}>
                        {playerDna.phaseImpacts.powerplay}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography variant="body1">Middle Overs</Typography>
                      <Typography variant="body1" fontWeight={800}>
                        {playerDna.phaseImpacts.middleOvers}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1">Death Overs</Typography>
                      <Typography variant="body1" fontWeight={800}>
                        {playerDna.phaseImpacts.deathOvers}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        )}

        <Grid item xs={12}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h5" fontWeight={800} mb={3}>
                📈 Career Trajectory
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={trajectory.seasons}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="season"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#888' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#888' }}
                    />
                    <RechartsTooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    {primeDetails && (
                      <ReferenceArea
                        x1={parseInt(primeDetails.start)}
                        x2={parseInt(primeDetails.end)}
                        strokeOpacity={0.3}
                        fill="#26D0CE"
                        fillOpacity={0.15}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Performance Score"
                      stroke="#FF416C"
                      strokeWidth={4}
                      dot={{ r: 4, fill: '#FF416C', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
              <Typography variant="h5" fontWeight={800} mb={3}>
                🏛️ Hall of Fame Breakdown
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3 }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                      Peak Component
                    </Typography>
                    <Typography variant="h4" fontWeight={900} mt={1}>
                      {hof.hallOfFame.peakComponent}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3 }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                      Longevity Component
                    </Typography>
                    <Typography variant="h4" fontWeight={900} mt={1}>
                      {hof.hallOfFame.longevityComponent}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3 }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                      Consistency Component
                    </Typography>
                    <Typography variant="h4" fontWeight={900} mt={1}>
                      {hof.hallOfFame.consistencyComponent}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3 }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                      Playoff Component
                    </Typography>
                    <Typography variant="h4" fontWeight={900} mt={1}>
                      {hof.hallOfFame.playoffComponent}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <Paper
              sx={{ p: 4, borderRadius: 4, height: '100%', bgcolor: '#121212', color: 'white' }}
            >
              <Typography variant="h5" fontWeight={800} mb={3}>
                📊 Historical Context
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Career Average
                </Typography>
                <Box display="flex" alignItems="baseline" gap={2}>
                  <Typography variant="h4" fontWeight={900}>
                    {hof.contextRankings?.careerAverage}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    {hof.contextRankings?.averagePercentile}th PCTL
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Career Strike Rate
                </Typography>
                <Box display="flex" alignItems="baseline" gap={2}>
                  <Typography variant="h4" fontWeight={900}>
                    {hof.contextRankings?.careerStrikeRate}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    {hof.contextRankings?.strikeRatePercentile}th PCTL
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={4} mb={6}>
        {similarPlayers?.similarPlayers && (
          <Grid item xs={12}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Typography variant="h5" fontWeight={800} mb={3}>
                👥 Similar Players
              </Typography>
              <Grid container spacing={3}>
                {similarPlayers.similarPlayers.slice(0, 3).map((sim, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={sim.matchPercentage}
                            size={60}
                            thickness={4}
                            sx={{ color: 'primary.main' }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" fontWeight={800}>
                              {sim.matchPercentage}%
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={800}>
                            {sim.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {sim.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {sim.reasons?.map((reason, i) => (
                          <Typography
                            key={i}
                            variant="caption"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              color: 'text.secondary',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: '#4CAF50' }}>✓</span> {reason}
                          </Typography>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>
        )}

        {rivalries && (
          <Grid item xs={12}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Typography variant="h5" fontWeight={800} mb={3}>
                ⚔️ Rivalry Matrix
              </Typography>
              <Grid container spacing={3}>
                {rivalries.nemesis && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 4, borderLeft: '6px solid #f44336' }}>
                      <Typography variant="overline" color="error" fontWeight={800}>
                        STRUGGLES AGAINST
                      </Typography>
                      <Typography variant="h4" fontWeight={900} mb={2}>
                        {rivalries.nemesis.opponent}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Dismissals
                          </Typography>
                          <Typography variant="h6" fontWeight={800}>
                            {rivalries.nemesis.dismissals}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Average
                          </Typography>
                          <Typography variant="h6" fontWeight={800}>
                            {rivalries.nemesis.average}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Strike Rate
                          </Typography>
                          <Typography variant="h6" fontWeight={800}>
                            {rivalries.nemesis.sr.toFixed(1)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography
                        variant="body2"
                        mt={2}
                        sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                      >
                        Dismissed every {rivalries.nemesis.ballsPerDismissal} balls
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {rivalries.favorite && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 4, borderLeft: '6px solid #4CAF50' }}>
                      <Typography variant="overline" sx={{ color: '#4CAF50', fontWeight: 800 }}>
                        DOMINATES
                      </Typography>
                      <Typography variant="h4" fontWeight={900} mb={2}>
                        {rivalries.favorite.opponent}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Runs Scored
                          </Typography>
                          <Typography variant="h6" fontWeight={800}>
                            {rivalries.favorite.runs}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Average
                          </Typography>
                          <Typography variant="h6" fontWeight={800}>
                            {rivalries.favorite.average}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Strike Rate
                          </Typography>
                          <Typography variant="h6" fontWeight={800}>
                            {rivalries.favorite.sr.toFixed(1)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography
                        variant="body2"
                        mt={2}
                        sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                      >
                        Dismissed every {rivalries.favorite.ballsPerDismissal} balls
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
              <Typography variant="h5" fontWeight={800} mb={3}>
                🏆 Records Held
              </Typography>
              {recordsHeld.length > 0 ? (
                <Box display="flex" flexDirection="column" gap={2}>
                  {recordsHeld.map((rec, i) => (
                    <Box
                      key={i}
                      display="flex"
                      alignItems="center"
                      gap={2}
                      p={2}
                      sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'primary.dark',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        🏅
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        {rec}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No all-time IPL records held currently.
                </Typography>
              )}
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
              <Typography variant="h5" fontWeight={800} mb={3}>
                ⏳ Career Eras
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  pl: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 8,
                    top: 10,
                    bottom: 10,
                    width: 2,
                    bgcolor: 'divider',
                  },
                }}
              >
                {trajectory.eras?.map((era, idx) => (
                  <Box key={idx} sx={{ position: 'relative', mb: 3, '&:last-child': { mb: 0 } }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -29,
                        top: 4,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: era.name === 'Prime' ? 'primary.main' : 'grey.400',
                        border: '2px solid white',
                        boxShadow: era.name === 'Prime' ? '0 0 0 2px #4A00E0' : 'none',
                      }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color={era.name === 'Prime' ? 'primary.main' : 'text.primary'}
                    >
                      {era.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      {era.start} – {era.end}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}
