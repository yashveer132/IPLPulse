import { useState } from 'react';
import { 
  Box, Typography, Chip, Grid, Card, CardContent, Accordion, 
  AccordionSummary, AccordionDetails, Button, Collapse, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Alert, Paper, Divider 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsightsIcon from '@mui/icons-material/Insights';
import { useTeamDevelopmentIndex, useTeamDevelopmentBreakdown } from '../hooks/useAnalytics.js';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

function FranchiseCard({ data }) {
  const [expanded, setExpanded] = useState(false);
  const { data: breakdown, isLoading } = useTeamDevelopmentBreakdown(data.franchise.id, {
    enabled: expanded,
  });

  return (
    <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ height: 6, bgcolor: data.franchise.color || 'primary.main' }} />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              #{data.rank} {data.franchise.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyzed {data.validTrajectories} valid trajectories from {data.totalPlayersAnalyzed} total players
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h3" fontWeight={800} color={data.developmentScore > 60 ? 'success.main' : data.developmentScore > 45 ? 'primary.main' : 'text.secondary'}>
              {data.developmentScore.toFixed(1)}
            </Typography>
            <Chip 
              label={`${data.confidenceLevel} Confidence`} 
              size="small" 
              color={data.confidenceLevel === 'High' ? 'success' : data.confidenceLevel === 'Medium' ? 'warning' : 'error'}
              sx={{ mt: 1, fontWeight: 700 }}
            />
          </Box>
        </Box>

        <Box sx={{ height: 40, width: '100%', mb: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history}>
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
              <Line type="monotone" dataKey="score" stroke={data.franchise.color || '#8884d8'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Button 
          variant={expanded ? "contained" : "outlined"} 
          fullWidth 
          onClick={() => setExpanded(!expanded)}
          startIcon={<InsightsIcon />}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          {expanded ? "Hide Explanation" : "Explain this score"}
        </Button>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3 }}>
            {isLoading || !breakdown ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={800} color="success.main" gutterBottom>
                    Top 5 Contributors (Progression)
                  </Typography>
                  <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell>Player</TableCell>
                          <TableCell align="right">Delta %</TableCell>
                          <TableCell align="right">Impact</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {breakdown.topContributors.map(t => (
                          <TableRow key={t.player.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{t.player.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{t.player.role}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>+{t.deltaScore}%</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>+{t.contribution}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={800} color="error.main" gutterBottom>
                    Bottom 5 Contributors (Regression)
                  </Typography>
                  <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell>Player</TableCell>
                          <TableCell align="right">Delta %</TableCell>
                          <TableCell align="right">Impact</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {breakdown.bottomContributors.map(t => (
                          <TableRow key={t.player.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{t.player.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{t.player.role}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ color: t.deltaScore < 0 ? 'error.main' : 'text.primary', fontWeight: 700 }}>
                              {t.deltaScore > 0 ? '+' : ''}{t.deltaScore}%
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              {t.contribution > 0 ? '+' : ''}{t.contribution}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

function TeamDevelopment() {
  const { data, isLoading } = useTeamDevelopmentIndex();

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Team Progression & Opportunity Index</Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        An aggregative analytical model estimating in-franchise player progression. This index calculates the delta in normalized performance metrics (volume and efficiency) between a player's induction and their most recent season. By aggregating squad-wide progression for retained players, this model serves as a proxy for a franchise's ability to successfully integrate, nurture, and increase the utilization of acquired talent over time.
      </Typography>

      <Accordion sx={{ mb: 4, borderRadius: 2, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={700}>📊 How this Index is calculated</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ pl: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Step 1: Player Selection Criteria</Typography>
            <Typography variant="body2" mb={2}>Minimum 2 seasons with the franchise. Incomplete or single-season trajectories are excluded to prevent small-sample distortion.</Typography>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Step 2: Baseline vs Latest Comparison</Typography>
            <Typography variant="body2" mb={2}>Compares the player's first season stats with the franchise against their most recent season stats.</Typography>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Step 3: Metric Breakdown</Typography>
            <Typography variant="body2" mb={2}>
              <strong>Batters:</strong> Runs, Strike Rate, Matches Played<br/>
              <strong>Bowlers:</strong> Wickets, Economy, Matches Played<br/>
              <em>Matches Played acts as a Selection Frequency Change (Opportunity Proxy)</em>
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Step 4: Percentage Delta Formula</Typography>
            <Typography variant="body2" mb={2} component="div">
              <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, display: 'inline-block', border: '1px solid', borderColor: 'divider' }}>
                <code style={{ fontFamily: 'monospace' }}>(Latest - First) / First</code>
              </Box>
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Step 5: Role-based Averaging & Clamping</Typography>
            <Typography variant="body2" mb={2}>The three metric deltas are averaged. To prevent extreme outliers from breaking the squad score, individual player improvements are strictly clamped between <strong>-100%</strong> and <strong>+200%</strong>.</Typography>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Step 6: Final Aggregation</Typography>
            <Typography variant="body2" component="div">
              <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, display: 'inline-block', border: '1px solid', borderColor: 'divider' }}>
                <code style={{ fontFamily: 'monospace' }}>50 + (Avg Squad Improvement / 4)</code>
              </Box>
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={0}>
          <Grid item xs={12}>
            {data?.map(row => (
              <FranchiseCard key={row.franchise.id} data={row} />
            ))}
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Limitations of this Model</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Model-derived index:</strong> This is a statistical estimation, not an official front-office evaluation.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Conflation of effects:</strong> The model does not isolate coaching interventions vs. raw scouting vs. retention bias.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Role changes:</strong> Players transitioning from part-time roles to different core roles can distort historical deltas.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Survivorship bias:</strong> By excluding players with {"<"}2 seasons, the model inherently filters out rapid failures, which can artificially inflate a franchise's baseline.
        </Typography>
      </Box>
    </Box>
  );
}

export default TeamDevelopment;
