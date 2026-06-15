import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import apiClient from "../api/apiClient";

const EntityDetail = () => {
  const { id } = useParams();
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const res = await apiClient.get(`/entities/${id}`);
        setEntity(res);
      } catch (error) {
        console.error("Error fetching entity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntity();
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (!entity)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Entity not found.</Typography>
      </Box>
    );

  const connectedEvents = entity.flashpoints.length;
  const uniqueRoles = new Set(entity.flashpoints.map((fp) => fp.role)).size;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        component={Link}
        to="/flashpoints"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 4, color: "text.secondary" }}
      >
        Back to Intelligence Hub
      </Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: "background.paper",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Chip
              label={entity.type}
              sx={{ mb: 2, fontWeight: "bold" }}
              color="primary"
              variant="outlined"
            />
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
              {entity.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mb: 4, lineHeight: 1.6 }}
            >
              {entity.description}
            </Typography>

            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Network Influence Score
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: 2,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, color: "#3b82f6" }}
                >
                  {connectedEvents}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  EVENTS
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(16, 185, 129, 0.1)",
                  borderRadius: 2,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, color: "#10b981" }}
                >
                  {uniqueRoles}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  ROLES
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>
            Connected History
          </Typography>

          {entity.flashpoints.length === 0 ? (
            <Typography color="text.secondary">
              No connected historical events found in the database.
            </Typography>
          ) : (
            <Box sx={{ position: "relative" }}>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "24px",
                  width: "2px",
                  bgcolor: "rgba(255,255,255,0.1)",
                }}
              />

              {entity.flashpoints.map((relation, idx) => {
                const fp = relation.flashpoint;
                return (
                  <Box
                    key={fp.id}
                    sx={{ display: "flex", mb: 4, position: "relative" }}
                  >
                    <Box
                      sx={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        bgcolor:
                          fp.tier === "S"
                            ? "#ef4444"
                            : fp.tier === "A"
                              ? "#f59e0b"
                              : "#3b82f6",
                        mt: "24px",
                        ml: "19px",
                        mr: 3,
                        zIndex: 1,
                      }}
                    />

                    <Paper
                      component={Link}
                      to={`/flashpoints/${fp.id}`}
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        borderRadius: 3,
                        textDecoration: "none",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="overline"
                            sx={{
                              fontWeight: "bold",
                              color: "text.secondary",
                              letterSpacing: 1,
                            }}
                          >
                            {fp.year} • Tier {fp.tier}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: "text.primary" }}
                          >
                            {fp.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={`Role: ${relation.role}`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      {fp.historicalSignificance && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontStyle: "italic",
                            mt: 1,
                          }}
                        >
                          "{fp.historicalSignificance}"
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                );
              })}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default EntityDetail;
