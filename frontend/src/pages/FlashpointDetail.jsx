import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedIcon from "@mui/icons-material/Verified";
import GavelIcon from "@mui/icons-material/Gavel";
import PolicyIcon from "@mui/icons-material/Policy";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TimelineIcon from "@mui/icons-material/Timeline";
import { motion } from "framer-motion";
import api from "../api/apiClient.js";
import CausalHistoryEngine from "../components/common/CausalHistoryEngine.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const ConfidenceLabel = ({ strength }) => {
  const configs = {
    Verified: { color: "success", icon: <VerifiedIcon fontSize="small" /> },
    "Strong Evidence": {
      color: "info",
      icon: <VerifiedIcon fontSize="small" />,
    },
    "Credible Reporting": {
      color: "warning",
      icon: <WarningAmberIcon fontSize="small" />,
    },
    Disputed: { color: "error", icon: <WarningAmberIcon fontSize="small" /> },
  };
  const config = configs[strength] || configs["Credible Reporting"];

  return (
    <Chip
      icon={config.icon}
      label={strength}
      color={config.color}
      variant="outlined"
      size="small"
      sx={{ mr: 1, mb: 1 }}
    />
  );
};

const FlashpointDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [fp, setFp] = useState(null);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
      try {
        const [resFp, resGraph] = await Promise.all([
          api.get(`/flashpoints/${id}`),
          api.get(`/flashpoints/${id}/graph`),
        ]);
        setFp(resFp || null);
        setGraphData(resGraph || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!fp)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Flashpoint not found.</Typography>
      </Box>
    );

  const totalSources = fp.sourceIntelligence?.length || 0;
  const primarySources =
    fp.sourceIntelligence?.filter(
      (s) =>
        s.sourceType?.includes("Primary") ||
        s.sourceType?.includes("Official") ||
        s.sourceType?.includes("Committee"),
    ).length || 0;
  const journalisticSources = totalSources - primarySources;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Chip
                label={`Tier ${fp.tier}`}
                color={
                  fp.tier === "S"
                    ? "error"
                    : fp.tier === "A"
                      ? "warning"
                      : "primary"
                }
                sx={{ fontWeight: "bold", mr: 2, borderRadius: 1 }}
              />
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: "bold", letterSpacing: 1, mr: 3 }}
              >
                {fp.year} • {fp.entryType} • {fp.eventType}
              </Typography>
              {totalSources > 0 && (
                <Chip
                  label={`${totalSources} Evidence Sources (${primarySources} Primary, ${journalisticSources} Journalistic)`}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontWeight: "bold",
                    color: "text.secondary",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                />
              )}
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, mt: 1 }}>
              {fp.title}
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              {fp.shortSummary}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 4 }}>
              {fp.affectedTeams.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                />
              ))}
              {fp.affectedPlayers.map((p) => (
                <Chip key={p} label={p} variant="outlined" />
              ))}
            </Box>
          </Box>
          <Paper
            sx={{ p: 4, mb: 4, bgcolor: "background.paper", borderRadius: 4 }}
          >
            <Typography
              variant="h5"
              align="center"
              sx={{ fontWeight: 800, mb: 3 }}
            >
              The Full Investigation
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                color: "text.primary",
                fontSize: "1.1rem",
              }}
            >
              {fp.fullStory}
            </Typography>
          </Paper>
          {fp.whyItMatters && fp.whyItMatters.length > 0 && (
            <Paper
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                bgcolor: "rgba(234, 179, 8, 0.05)",
                border: "1px solid rgba(234, 179, 8, 0.2)",
              }}
            >
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 800, mb: 3, color: "#eab308" }}
              >
                Why It Matters
              </Typography>
              <List dense>
                {fp.whyItMatters.map((reason, i) => (
                  <ListItem key={i} disablePadding sx={{ mb: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: "#eab308" }}>
                      ✦
                    </ListItemIcon>
                    <ListItemText
                      primary={reason}
                      primaryTypographyProps={{
                        variant: "body1",
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          {fp.outcomes && Object.keys(fp.outcomes).length > 0 && (
            <Paper
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                bgcolor: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, mb: 3, color: "#10b981" }}
              >
                Structured Outcomes
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(fp.outcomes).map(([key, items], idx) => {
                  if (!items || items.length === 0) return null;
                  const label = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 1, color: "#047857" }}
                      >
                        {label}
                      </Typography>
                      {items.map((item, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                          ✓ {item}
                        </Typography>
                      ))}
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          )}
          {fp.howIplChanged && Object.keys(fp.howIplChanged).length > 0 && (
            <Paper sx={{ p: 4, mb: 4, borderRadius: 4, textAlign: "center" }}>
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 800, mb: 3 }}
              >
                How IPL Changed
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                {fp.howIplChanged.ruleChanges?.length > 0 && (
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      maxWidth: { xs: "100%", md: "400px" },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <GavelIcon sx={{ mr: 1, fontSize: "1.2rem" }} /> Rule
                      Changes
                    </Typography>
                    {fp.howIplChanged.ruleChanges.map((c, i) => (
                      <Box
                        key={i}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.05)",
                          p: 2,
                          borderRadius: 2,
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          align="center"
                          sx={{ fontSize: "0.95rem" }}
                        >
                          {c}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                {fp.howIplChanged.governanceChanges?.length > 0 && (
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      maxWidth: { xs: "100%", md: "400px" },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <AccountBalanceIcon sx={{ mr: 1, fontSize: "1.2rem" }} />{" "}
                      Governance
                    </Typography>
                    {fp.howIplChanged.governanceChanges.map((c, i) => (
                      <Box
                        key={i}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.05)",
                          p: 2,
                          borderRadius: 2,
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          align="center"
                          sx={{ fontSize: "0.95rem" }}
                        >
                          {c}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                {fp.howIplChanged.franchiseChanges?.length > 0 && (
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      maxWidth: { xs: "100%", md: "400px" },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <PolicyIcon sx={{ mr: 1, fontSize: "1.2rem" }} />{" "}
                      Franchise Structure
                    </Typography>
                    {fp.howIplChanged.franchiseChanges.map((c, i) => (
                      <Box
                        key={i}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.05)",
                          p: 2,
                          borderRadius: 2,
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          align="center"
                          sx={{ fontSize: "0.95rem" }}
                        >
                          {c}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              bgcolor: "rgba(99, 102, 241, 0.05)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: 4,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "text.secondary", fontWeight: "bold" }}
            >
              EVENT IMPORTANCE BREAKDOWN
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">Severity</Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {fp.severity} / 10
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">League Impact</Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {fp.impactType}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">Media Attention</Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {fp.mediaAttention} / 10
              </Typography>
            </Box>
          </Paper>

          {fp.impactMetrics && Object.keys(fp.impactMetrics).length > 0 && (
            <Paper
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                bgcolor: "rgba(59, 130, 246, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 800, mb: 3, color: "#3b82f6" }}
              >
                Impact Metrics
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(fp.impactMetrics).map(([key, value]) => {
                  const label = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <Grid size={{ xs: 6 }} key={key}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "rgba(255,255,255,0.05)",
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 900, color: "text.primary", mb: 1 }}
                        >
                          {value}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          )}

          {fp.entities && fp.entities.length > 0 && (
            <Paper
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 800, mb: 3 }}
              >
                Involved Entities
              </Typography>
              <Grid container spacing={2}>
                {fp.entities.map((relation) => (
                  <Grid size={{ xs: 12 }} key={relation.id}>
                    <Box
                      component={Link}
                      to={`/entities/${relation.entity.id}`}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        p: 2,
                        bgcolor: "rgba(255,255,255,0.03)",
                        borderRadius: 2,
                        textDecoration: "none",
                        color: "inherit",
                        transition: "background-color 0.2s",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          {relation.entity.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {relation.entity.type}
                        </Typography>
                      </Box>
                      <Chip
                        label={relation.role}
                        size="small"
                        variant="outlined"
                        sx={{ color: "text.secondary" }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {graphData && graphData.nodes && graphData.nodes.length > 1 && (
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Related Flashpoints
              </Typography>
              <List disablePadding>
                {graphData.nodes
                  .filter((n) => n.id !== fp.id)
                  .map((node) => (
                    <ListItem key={node.id} disablePadding sx={{ mb: 1 }}>
                      <Button
                        component={Link}
                        to={`/flashpoints/${node.id}`}
                        variant="text"
                        size="small"
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          color: "text.secondary",
                          textTransform: "none",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        • {node.title}
                      </Button>
                    </ListItem>
                  ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <CausalHistoryEngine graphData={graphData} />
      </Box>
    </Container>
  );
};

export default FlashpointDetail;
