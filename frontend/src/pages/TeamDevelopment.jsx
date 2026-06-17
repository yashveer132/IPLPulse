import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  Collapse,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  useTeamDevelopmentIndex,
  useTeamDevelopmentBreakdown,
} from "../hooks/useAnalytics.js";
import PageHeader from "../components/common/PageHeader.jsx";

function MetricBadge({ value }) {
  const isPositive = value > 0;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: isPositive
          ? "success.main"
          : value < 0
            ? "error.main"
            : "grey.500",
        color: "white",
        fontWeight: 800,
        fontSize: "0.75rem",
      }}
    >
      {isPositive ? "+" : ""}
      {value} pts
    </Box>
  );
}

function FranchiseCard({ data }) {
  const [expanded, setExpanded] = useState(false);
  const { data: breakdown, isLoading } = useTeamDevelopmentBreakdown(
    data.franchise.id,
    {
      enabled: expanded,
    },
  );

  const cardBg = "rgba(255, 255, 255, 0.05)";
  const brandColor = data.franchise.color || "primary.main";

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "background.paper",
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.02), ${cardBg})`,
        border: "1px solid",
        borderColor: "divider",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px -4px ${brandColor}40`,
          borderColor: brandColor,
        },
      }}
    >
      <Box
        sx={{
          height: 6,
          background: `linear-gradient(90deg, ${brandColor}, ${brandColor}80)`,
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={700}
              sx={{ letterSpacing: 1.5 }}
            >
              Rank #{data.rank}
            </Typography>
            <Typography variant="h5" fontWeight={900} sx={{ mt: -0.5 }}>
              {data.franchise.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              {data.validTrajectories} players analyzed
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                background: `linear-gradient(135deg, ${brandColor}, #ffffff)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}
            >
              {data.developmentScore.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={1} sx={{ mb: 3 }}>
          <Grid item xs={3}>
            <Box
              sx={{
                textAlign: "center",
                bgcolor: "background.default",
                p: 1,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.65rem", lineHeight: 1, mb: 0.5 }}
              >
                EFFICIENCY
              </Typography>
              <Typography variant="body2" fontWeight={800}>
                {data.efficiencyScore.toFixed(1)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box
              sx={{
                textAlign: "center",
                bgcolor: "background.default",
                p: 1,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.65rem", lineHeight: 1, mb: 0.5 }}
              >
                YIELD
              </Typography>
              <Typography variant="body2" fontWeight={800}>
                {data.yieldScore.toFixed(1)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box
              sx={{
                textAlign: "center",
                bgcolor: "background.default",
                p: 1,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.65rem", lineHeight: 1, mb: 0.5 }}
              >
                STARS
              </Typography>
              <Typography variant="body2" fontWeight={800}>
                {data.breakthroughScore.toFixed(1)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box
              sx={{
                textAlign: "center",
                bgcolor: "background.default",
                p: 1,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.65rem", lineHeight: 1, mb: 0.5 }}
              >
                CONSISTENCY
              </Typography>
              <Typography variant="body2" fontWeight={800}>
                {data.consistencyScore.toFixed(1)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Button
          variant={expanded ? "contained" : "outlined"}
          fullWidth
          onClick={() => setExpanded(!expanded)}
          endIcon={
            expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
          }
          startIcon={!expanded && <InsightsIcon />}
          sx={{
            fontWeight: 700,
            borderRadius: 3,
            textTransform: "none",
            py: 1,
            bgcolor: expanded ? brandColor : "transparent",
            color: expanded ? "#fff" : "text.primary",
            borderColor: expanded ? brandColor : "divider",
            "&:hover": {
              bgcolor: expanded ? `${brandColor}dd` : "action.hover",
            },
          }}
        >
          {expanded ? "Hide Details" : "View Player Progression"}
        </Button>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3 }}>
            {isLoading || !breakdown ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <Stack spacing={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    gutterBottom
                    sx={{ color: brandColor, mb: 2 }}
                  >
                    Development Profile
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Improvement Rate
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {breakdown.developmentProfile.improvementRate}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Players Evaluated
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {breakdown.totalPlayersAnalyzed}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Average Value Added
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color={
                          breakdown.developmentProfile.averageValueAdded > 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {breakdown.developmentProfile.averageValueAdded > 0
                          ? "+"
                          : ""}
                        {breakdown.developmentProfile.averageValueAdded} pts/yr
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Cumulative Yield
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color={
                          breakdown.developmentProfile.cumulativeYield > 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {breakdown.developmentProfile.cumulativeYield > 0
                          ? "+"
                          : ""}
                        {breakdown.developmentProfile.cumulativeYield} pts
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Median Value Added
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color={
                          breakdown.developmentProfile.medianValueAdded > 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {breakdown.developmentProfile.medianValueAdded > 0
                          ? "+"
                          : ""}
                        {breakdown.developmentProfile.medianValueAdded} pts
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    gutterBottom
                    display="block"
                  >
                    Value Added Distribution
                  </Typography>
                  <Stack spacing={1}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Elite Breakthrough {">"} +20 pts
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="success.main"
                      >
                        {breakdown.developmentProfile.distribution.major}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Positive Value +5 to +20 pts
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="success.light"
                      >
                        {breakdown.developmentProfile.distribution.moderate}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Expected Value -5 to +5 pts
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="text.secondary"
                      >
                        {breakdown.developmentProfile.distribution.stable}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Major Regression {"<"} -5 pts
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="error.main"
                      >
                        {breakdown.developmentProfile.distribution.regression}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color="success.main"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                      }}
                    />
                    Top Contributors
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      overflow: "hidden",
                      borderRadius: 3,
                      bgcolor: "background.default",
                    }}
                  >
                    <Table size="small">
                      <TableBody>
                        {breakdown.topContributors.map((t) => (
                          <TableRow
                            key={t.player.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={700}>
                                {t.player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {t.player.role}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <MetricBadge value={t.deltaScore} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color="error.main"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "error.main",
                      }}
                    />
                    Needs Improvement
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      overflow: "hidden",
                      borderRadius: 3,
                      bgcolor: "background.default",
                    }}
                  >
                    <Table size="small">
                      <TableBody>
                        {breakdown.bottomContributors.map((t) => (
                          <TableRow
                            key={t.player.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={700}>
                                {t.player.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {t.player.role}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <MetricBadge value={t.deltaScore} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Box>
              </Stack>
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
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Progression Index"
        subtitle="Evaluating organizational impact on player development. (Score 50 = League Average, 60 = Top 15%, 70 = Elite)"
      />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {data?.map((row) => (
            <FranchiseCard key={row.franchise.id} data={row} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default TeamDevelopment;
