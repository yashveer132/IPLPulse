import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Slider,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  LabelList,
  Cell,
} from 'recharts';
import { useFastestMilestone, useFastestMilestoneCurve } from '../hooks/useAnalytics.js';

function MilestoneExplorer() {
  const [targetRuns, setTargetRuns] = useState(50);
  const [debouncedTarget, setDebouncedTarget] = useState(50);
  const [selectedCard, setSelectedCard] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTarget(targetRuns);
    }, 500);
    return () => clearTimeout(handler);
  }, [targetRuns]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const index = targetRuns - 20;
      const barWidth = 35;
      const targetPixel = index * barWidth;

      const scrollTo = targetPixel - container.clientWidth / 2 + barWidth / 2 + 20; 
      container.scrollTo({ left: Math.max(0, scrollTo), behavior: 'smooth' });
    }
  }, [targetRuns]);

  const { data: results, isLoading, isFetching } = useFastestMilestone(debouncedTarget);
  const { data: curveData, isLoading: curveLoading } = useFastestMilestoneCurve();

  const handleSliderChange = (event, newValue) => {
    setTargetRuns(newValue);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 1.5,
            bgcolor: 'rgba(15, 23, 42, 0.9)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography variant="body2" fontWeight={800} color="#f59e0b">
            {label} Runs
          </Typography>
          <Typography variant="body2">Fastest: {payload[0].value} Balls</Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">
            Record by: {payload[0].payload.playerName}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-').reverse().join('/');
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={900} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
          Milestone Explorer
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 400, maxWidth: 600, mx: 'auto' }}
        >
          Real-time analysis. Select any exact target score to instantly find out who reached it the
          fastest.
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="text.secondary" sx={{ mb: 1 }}>
            Target Milestone
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1 }}>
            <Typography
              variant="h1"
              fontWeight={900}
              color="primary.main"
              sx={{ lineHeight: 1, fontSize: { xs: '4rem', md: '5rem' } }}
            >
              {targetRuns}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={700}
              sx={{ textTransform: 'uppercase' }}
            >
              Runs
            </Typography>
          </Box>
        </Box>

        <Box
          ref={scrollContainerRef}
          sx={{
            width: '100%',
            overflowX: 'auto',
            mb: 3,
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 4,
            },
          }}
        >
          <Box
            sx={{
              height: 280,
              minWidth: curveData ? Math.max(1200, curveData.length * 35) : '100%',
            }}
          >
            {curveLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={30} />
              </Box>
            ) : curveData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={curveData} margin={{ top: 110, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="runs"
                    tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700 }}
                    interval={0}
                  />
                  <YAxis hide domain={[0, 'dataMax + 10']} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                  <ReferenceLine x={targetRuns} stroke="#ff4757" strokeDasharray="3 3" />
                  <Bar dataKey="balls" radius={[4, 4, 0, 0]}>
                    {curveData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.runs === targetRuns ? '#ff4757' : '#4dabf5'}
                      />
                    ))}
                    <LabelList
                      dataKey="playerName"
                      position="top"
                      angle={-90}
                      fill="rgba(255,255,255,0.9)"
                      fontSize={11}
                      style={{ fontWeight: 800, textAnchor: 'start' }}
                      offset={10}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 }, width: '100%' }}>
          <Slider
            value={targetRuns}
            min={20}
            max={175}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            sx={{
              height: 10,
              width: '100%',
              '& .MuiSlider-thumb': {
                width: 28,
                height: 28,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              20
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              175
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ position: 'relative', minHeight: 300 }}>
        {(isLoading || isFetching) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              opacity: 0.8,
              zIndex: 10,
              borderRadius: 3,
            }}
          >
            <CircularProgress size={50} thickness={4} />
          </Box>
        )}

        {(!results?.fastest || results.fastest.length === 0) && !isLoading && !isFetching && (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'background.default',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No player has ever scored exactly {debouncedTarget} runs as a milestone.
            </Typography>
          </Paper>
        )}

        {results?.fastest && results.fastest.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}
            >
              Top 10 Fastest to Exactly {debouncedTarget} Runs
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {results.fastest.map((res, index) => (
                <Grid item xs={12} sm={6} md={4} key={`fastest-${res.id}`}>
                  <Paper
                    onClick={() => setSelectedCard({ ...res, type: 'Fastest' })}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      border: '1px solid',
                      cursor: 'pointer',
                      borderColor: index === 0 ? '#2ecc71' : 'divider',
                      bgcolor: index === 0 ? 'rgba(46, 204, 113, 0.1)' : 'background.paper',
                      transition: 'transform 0.2s',
                      animation: index === 0 ? 'pulseGlow 2s infinite' : 'none',
                      '@keyframes pulseGlow': {
                        '0%': { boxShadow: '0 0 0 0 rgba(46, 204, 113, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(46, 204, 113, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(46, 204, 113, 0)' },
                      },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 40,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color={index === 0 ? '#2ecc71' : 'text.secondary'}
                      >
                        #{index + 1}
                      </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {res.playerName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {res.team} • {formatDate(res.matchDate)}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${res.runsScored} runs scored`}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>

                    <Box
                      sx={{
                        textAlign: 'center',
                        bgcolor: index === 0 ? '#2ecc71' : 'background.default',
                        color: index === 0 ? 'white' : 'text.primary',
                        p: 1.5,
                        borderRadius: 2,
                        minWidth: 80,
                        border: index === 0 ? 'none' : '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h5" fontWeight={900} lineHeight={1}>
                        {res.ballsFaced}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ fontSize: '0.6rem', textTransform: 'uppercase' }}
                      >
                        Balls
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {results?.slowest && results.slowest.length > 0 && (
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ mb: 3, textAlign: 'center', color: '#ff4757' }}
            >
              Top 10 Slowest to Exactly {debouncedTarget} Runs
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {results.slowest.map((res, index) => (
                <Grid item xs={12} sm={6} md={4} key={`slowest-${res.id}`}>
                  <Paper
                    onClick={() => setSelectedCard({ ...res, type: 'Slowest' })}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      border: '1px solid',
                      cursor: 'pointer',
                      borderColor: index === 0 ? '#ff4757' : 'divider',
                      bgcolor: index === 0 ? 'rgba(255, 71, 87, 0.05)' : 'background.paper',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 40,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color={index === 0 ? '#ff4757' : 'text.secondary'}
                      >
                        #{index + 1}
                      </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {res.playerName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {res.team} • {formatDate(res.matchDate)}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${res.runsScored} runs scored`}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>

                    <Box
                      sx={{
                        textAlign: 'center',
                        bgcolor: index === 0 ? '#ff4757' : 'background.default',
                        color: index === 0 ? 'white' : 'text.primary',
                        p: 1.5,
                        borderRadius: 2,
                        minWidth: 80,
                        border: index === 0 ? 'none' : '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h5" fontWeight={900} lineHeight={1}>
                        {res.ballsFaced}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ fontSize: '0.6rem', textTransform: 'uppercase' }}
                      >
                        Balls
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      <Dialog
        open={Boolean(selectedCard)}
        onClose={() => setSelectedCard(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedCard && (
          <>
            <DialogTitle
              sx={{
                fontWeight: 800,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {selectedCard.playerName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                  {selectedCard.team} vs {selectedCard.againstTeam || 'Opponent'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {selectedCard.venue || 'Stadium'} • {formatDate(selectedCard.matchDate)}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default' }}>
              <Box
                sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}
              >
                <Chip
                  label={`Match Result: ${selectedCard.matchResult || 'Unknown'}`}
                  sx={{
                    fontWeight: 800,
                    px: 2,
                    py: 2.5,
                    fontSize: '1rem',
                    bgcolor:
                      selectedCard.matchResult === 'Won'
                        ? 'success.main'
                        : selectedCard.matchResult === 'Lost'
                          ? 'error.main'
                          : 'warning.main',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                />
                <Chip
                  label={`Strike Rate: ${((selectedCard.runsScored / selectedCard.ballsFaced) * 100).toFixed(2)}`}
                  sx={{
                    fontWeight: 800,
                    px: 2,
                    py: 2.5,
                    fontSize: '0.9rem',
                    bgcolor: 'primary.main',
                    color: 'white',
                  }}
                />
                <Chip
                  label={`Dot Balls: ${selectedCard.sequence?.filter((r) => r === 0).length || 0}`}
                  sx={{
                    fontWeight: 800,
                    px: 2,
                    py: 2.5,
                    fontSize: '0.9rem',
                    bgcolor: 'text.secondary',
                    color: 'white',
                  }}
                />
                {selectedCard.tossWinner && selectedCard.tossDecision && (
                  <Chip
                    label={`Toss: ${selectedCard.tossWinner} chose to ${selectedCard.tossDecision}`}
                    sx={{
                      fontWeight: 800,
                      px: 2,
                      py: 2.5,
                      fontSize: '0.9rem',
                      bgcolor: 'info.main',
                      color: 'white',
                    }}
                  />
                )}
              </Box>

              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', height: '100%' }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      color="text.secondary"
                      gutterBottom
                      textTransform="uppercase"
                    >
                      Run Source
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 2 }}>
                      <Typography variant="body2" fontWeight={700}>
                        Boundaries (4s & 6s)
                      </Typography>
                      <Typography variant="body2" fontWeight={900} color="primary.main">
                        {selectedCard.boundariesRuns || 0} runs
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={((selectedCard.boundariesRuns || 0) / selectedCard.runsScored) * 100}
                      sx={{ height: 8, borderRadius: 4, mb: 3 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        Strike Rotation (1s, 2s, 3s)
                      </Typography>
                      <Typography variant="body2" fontWeight={900} color="secondary.main">
                        {selectedCard.rotationRuns || 0} runs
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={((selectedCard.rotationRuns || 0) / selectedCard.runsScored) * 100}
                      color="secondary"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', height: '100%' }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      color="text.secondary"
                      gutterBottom
                      textTransform="uppercase"
                    >
                      Phase Domination
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" fontWeight={800} sx={{ width: 80 }}>
                          Powerplay
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={
                              ((selectedCard.powerplayRuns || 0) / selectedCard.runsScored) * 100
                            }
                            color="info"
                            sx={{ height: 12, borderRadius: 6 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={900}
                          sx={{ width: 40, textAlign: 'right' }}
                        >
                          {selectedCard.powerplayRuns || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" fontWeight={800} sx={{ width: 80 }}>
                          Middle
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={((selectedCard.middleRuns || 0) / selectedCard.runsScored) * 100}
                            color="warning"
                            sx={{ height: 12, borderRadius: 6 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={900}
                          sx={{ width: 40, textAlign: 'right' }}
                        >
                          {selectedCard.middleRuns || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" fontWeight={800} sx={{ width: 80 }}>
                          Death
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={((selectedCard.deathRuns || 0) / selectedCard.runsScored) * 100}
                            color="error"
                            sx={{ height: 12, borderRadius: 6 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={900}
                          sx={{ width: 40, textAlign: 'right' }}
                        >
                          {selectedCard.deathRuns || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#ffb142' }}
                >
                  🤯 Advanced Milestone Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(231, 76, 60, 0.1)',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        height: '100%',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="error"
                        textTransform="uppercase"
                      >
                        Primary Victim
                      </Typography>
                      <Typography variant="body1" fontWeight={900} sx={{ mt: 1 }}>
                        {selectedCard.primaryVictim || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ opacity: 0.8 }}>
                        Destroyed for {selectedCard.victimRuns || 0} runs off{' '}
                        {selectedCard.victimBalls || 0} balls! (SR:{' '}
                        {selectedCard.victimBalls > 0
                          ? ((selectedCard.victimRuns / selectedCard.victimBalls) * 100).toFixed(0)
                          : 'N/A'}
                        )
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(46, 204, 113, 0.1)',
                        border: '1px solid rgba(46, 204, 113, 0.3)',
                        height: '100%',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="success.main"
                        textTransform="uppercase"
                      >
                        The Accelerator
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            First Half
                          </Typography>
                          <Typography variant="body1" fontWeight={900}>
                            {selectedCard.initialSR !== undefined ? selectedCard.initialSR : 'N/A'}{' '}
                            SR
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Second Half
                          </Typography>
                          <Typography variant="body1" fontWeight={900}>
                            {selectedCard.deathSR !== undefined ? selectedCard.deathSR : 'N/A'} SR
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(52, 152, 219, 0.1)',
                        border: '1px solid rgba(52, 152, 219, 0.3)',
                        height: '100%',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="info.main"
                        textTransform="uppercase"
                      >
                        Breathless Streaks
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ mt: 1 }}>
                        🔥 Max {selectedCard.maxBoundaryStreak || 0} boundaries in a row
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ mt: 0.5 }}>
                        🚀 {selectedCard.maxNonDotStreak || 0} consecutive scoring shots
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Typography
                variant="subtitle1"
                fontWeight={800}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                Ball-by-Ball Sequence
                <Chip
                  size="small"
                  label={`${selectedCard.type} to ${selectedCard.runsScored} runs in ${selectedCard.ballsFaced} balls`}
                />
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {selectedCard.sequence?.map((runs, i) => {
                  let bgColor = 'rgba(255,255,255,0.1)';
                  let color = 'white';
                  if (runs === 4) {
                    bgColor = '#4dabf5';
                    color = 'white';
                  }
                  if (runs === 6) {
                    bgColor = '#9c27b0';
                    color = 'white';
                  }
                  if (runs === 0) {
                    color = 'rgba(255,255,255,0.4)';
                  }

                  return (
                    <Box
                      key={i}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: bgColor,
                        color: color,
                        fontWeight: 800,
                        border: runs === 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        boxShadow: runs >= 4 ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                      }}
                    >
                      {runs}
                    </Box>
                  );
                })}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default MilestoneExplorer;
