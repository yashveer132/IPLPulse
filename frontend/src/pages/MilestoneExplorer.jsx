import { useState, useEffect, useRef } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
} from "recharts";
import {
  useFastestMilestone,
  useFastestMilestoneCurve,
} from "../hooks/useAnalytics.js";
import PageHeader from "../components/common/PageHeader.jsx";

const getPlayerColor = (name) => {
  if (!name) return "#4dabf5";
  const colors = [
    "#6366f1",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
    "#f97316",
    "#0ea5e9",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

function MilestoneExplorer() {
  const [targetRuns, setTargetRuns] = useState(50);
  const [debouncedTarget, setDebouncedTarget] = useState(50);
  const [selectedCard, setSelectedCard] = useState(null);
  const scrollContainerRef = useRef(null);

  const [fastestIndex, setFastestIndex] = useState(0);
  const [slowestIndex, setSlowestIndex] = useState(0);

  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const cardsPerPage = isMd ? 3 : isSm ? 2 : 1;

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

      const scrollTo =
        targetPixel - container.clientWidth / 2 + barWidth / 2 + 20;
      container.scrollTo({ left: Math.max(0, scrollTo), behavior: "smooth" });
    }
  }, [targetRuns]);

  const {
    data: results,
    isLoading,
    isFetching,
  } = useFastestMilestone(debouncedTarget);
  const { data: curveData, isLoading: curveLoading } =
    useFastestMilestoneCurve();

  useEffect(() => {
    setFastestIndex(0);
    setSlowestIndex(0);
  }, [results]);

  if (curveLoading || !curveData) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          gap: 3,
        }}
      >
        <CircularProgress
          size={55}
          thickness={4.5}
          sx={{
            color: "primary.main",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
            animation: "pulseGlow 1.5s infinite ease-in-out",
            "@keyframes pulseGlow": {
              "0%": { transform: "scale(0.95)", opacity: 0.8 },
              "50%": { transform: "scale(1.05)", opacity: 1 },
              "100%": { transform: "scale(0.95)", opacity: 0.8 },
            },
          }}
        />
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            background: "linear-gradient(90deg, #6366f1, #0ea5e9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 0.5,
          }}
        >
          Loading Milestone Explorer...
        </Typography>
      </Box>
    );
  }

  const handleSliderChange = (event, newValue) => {
    setTargetRuns(newValue);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 1.5,
            bgcolor: "rgba(15, 23, 42, 0.9)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography variant="body2" fontWeight={800} color="#f59e0b">
            {label} Runs
          </Typography>
          <Typography variant="body2">
            Fastest: {payload[0].value} Balls
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">
            Record by: {payload[0].payload.playerName}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("-").reverse().join("/");
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <PageHeader
        title="Milestone Tracker"
        subtitle="Compare which players reached specific run or wicket thresholds fastest"
      />

      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="overline"
            fontWeight={800}
            color="text.secondary"
            sx={{ mb: 0.5, letterSpacing: 1.2, fontSize: "0.75rem" }}
          >
            Target Milestone
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <Typography
              variant="h3"
              fontWeight={900}
              color="primary.main"
              sx={{ lineHeight: 1, fontSize: { xs: "2.5rem", md: "3rem" } }}
            >
              {targetRuns}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Runs
            </Typography>
          </Box>
        </Box>

        <Box
          ref={scrollContainerRef}
          sx={{
            width: "100%",
            overflowX: "auto",
            mb: 1,
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 3,
            p: 1.5,
            bgcolor: "rgba(0, 0, 0, 0.15)",
            "&::-webkit-scrollbar": {
              height: "10px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(0, 0, 0, 0.25)",
              borderRadius: "5px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "linear-gradient(90deg, #6366f1, #3b82f6, #0ea5e9)",
              borderRadius: "5px",
              boxShadow: "0 0 8px rgba(99, 102, 241, 0.5)",
              "&:hover": {
                background: "linear-gradient(90deg, #8b5cf6, #ec4899, #f97316)",
              },
            },
          }}
        >
          <Box
            sx={{
              height: 140,
              minWidth: curveData
                ? Math.max(1200, curveData.length * 35)
                : "100%",
            }}
          >
            {curveLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress size={25} />
              </Box>
            ) : curveData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={curveData}
                  margin={{ top: 50, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="runs"
                    tick={{
                      fill: "rgba(255,255,255,0.8)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                    interval={0}
                  />
                  <YAxis hide domain={[0, "dataMax + 10"]} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.08)" }}
                  />
                  <ReferenceLine
                    x={targetRuns}
                    stroke="#ff4757"
                    strokeDasharray="3 3"
                  />
                  <Bar
                    dataKey="balls"
                    radius={[3, 3, 0, 0]}
                    onClick={(data) => {
                      if (data && data.runs) {
                        setTargetRuns(data.runs);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {curveData.map((entry, index) => {
                      const isSelected = entry.runs === targetRuns;
                      const playerColor = getPlayerColor(entry.playerName);
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={playerColor}
                          stroke={isSelected ? "#ffffff" : "transparent"}
                          strokeWidth={isSelected ? 2 : 0}
                          opacity={isSelected ? 1 : 0.6}
                          style={{
                            filter: isSelected
                              ? "drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.5))"
                              : "none",
                            transition: "all 0.3s ease",
                          }}
                        />
                      );
                    })}
                    <LabelList
                      dataKey="playerName"
                      position="top"
                      angle={-90}
                      fill="rgba(255,255,255,0.9)"
                      fontSize={10}
                      style={{ fontWeight: 800, textAnchor: "start" }}
                      offset={8}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ position: "relative", minHeight: 300 }}>
        {isLoading || isFetching ? (
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
              Analyzing Milestones...
            </Typography>
          </Box>
        ) : (
          <>
            {(!results?.fastest || results.fastest.length === 0) && (
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No player has ever scored exactly {debouncedTarget} runs as a
                  milestone.
                </Typography>
              </Paper>
            )}

            {results?.fastest && results.fastest.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{
                    mb: 3.5,
                    mt: 2,
                    textAlign: "center",
                    color: "primary.main",
                  }}
                >
                  Top 10 Fastest to Exactly {debouncedTarget} Runs
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    width: "100%",
                    maxWidth: 1200,
                    mx: "auto",
                    mb: 2,
                    px: { xs: 3, sm: 8 },
                  }}
                >
                  <IconButton
                    onClick={() => {
                      setFastestIndex((prev) => {
                        if (prev === 0) {
                          const remainder =
                            results.fastest.length % cardsPerPage;
                          return remainder === 0
                            ? results.fastest.length - cardsPerPage
                            : results.fastest.length - remainder;
                        }
                        const prevIndex = prev - cardsPerPage;
                        return prevIndex < 0 ? 0 : prevIndex;
                      });
                    }}
                    sx={{
                      display: "inline-flex",
                      position: "absolute",
                      left: { xs: -12, sm: 10 },
                      zIndex: 10,
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      backdropFilter: "blur(4px)",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
                      },
                      width: { xs: 32, sm: 48 },
                      height: { xs: 32, sm: 48 },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                  </IconButton>

                  {(() => {
                    const len = results.fastest.length;
                    const visibleCards = [];
                    for (let i = 0; i < cardsPerPage; i++) {
                      const cardIndex = fastestIndex + i;
                      if (cardIndex < len) {
                        visibleCards.push({
                          res: results.fastest[cardIndex],
                          index: cardIndex,
                        });
                      }
                    }

                    return (
                      <Box
                        sx={{
                          width: "100%",
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm:
                              visibleCards.length > 1
                                ? "repeat(2, 1fr)"
                                : "1fr",
                            md:
                              visibleCards.length > 2
                                ? "repeat(3, 1fr)"
                                : visibleCards.length > 1
                                  ? "repeat(2, 1fr)"
                                  : "1fr",
                          },
                          gap: 2.5,
                          transition: "all 0.5s ease",
                          animation: "fadeInScale 0.4s ease-out",
                          "@keyframes fadeInScale": {
                            "0%": { opacity: 0, transform: "scale(0.96)" },
                            "100%": { opacity: 1, transform: "scale(1)" },
                          },
                        }}
                        key={fastestIndex}
                      >
                        {visibleCards.map(({ res, index }) => (
                          <Paper
                            key={`fastest-${res.id}`}
                            onClick={() =>
                              setSelectedCard({ ...res, type: "Fastest" })
                            }
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              border: "1px solid",
                              cursor: "pointer",
                              borderColor:
                                index === 0 ? "success.main" : "divider",
                              bgcolor:
                                index === 0
                                  ? "rgba(16, 185, 129, 0.08)"
                                  : "background.paper",
                              backgroundImage:
                                index === 0
                                  ? "none"
                                  : "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.04) 0px, transparent 50%)",
                              transition:
                                "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s",
                              animation:
                                index === 0 ? "pulseGlow 2s infinite" : "none",
                              "@keyframes pulseGlow": {
                                "0%": {
                                  boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.4)",
                                },
                                "70%": {
                                  boxShadow: "0 0 0 10px rgba(16, 185, 129, 0)",
                                },
                                "100%": {
                                  boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)",
                                },
                              },
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow:
                                  "0 8px 24px rgba(99, 102, 241, 0.15)",
                                borderColor:
                                  index === 0
                                    ? "success.main"
                                    : "rgba(99, 102, 241, 0.4)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                minWidth: 40,
                              }}
                            >
                              <Typography
                                variant="h5"
                                fontWeight={900}
                                color={
                                  index === 0
                                    ? "success.main"
                                    : "text.secondary"
                                }
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
                                sx={{ display: "block", mb: 0.5 }}
                              >
                                {res.team} • {formatDate(res.matchDate)}
                              </Typography>
                              <Chip
                                size="small"
                                label={`${res.runsScored} runs scored`}
                                variant="outlined"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            </Box>

                            <Box
                              sx={{
                                textAlign: "center",
                                bgcolor:
                                  index === 0
                                    ? "#2ecc71"
                                    : "background.default",
                                color: index === 0 ? "white" : "text.primary",
                                p: 1.5,
                                borderRadius: 2,
                                minWidth: 80,
                                border: index === 0 ? "none" : "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Typography
                                variant="h5"
                                fontWeight={900}
                                lineHeight={1}
                                color={index === 0 ? "success.main" : "inherit"}
                              >
                                {res.ballsFaced}
                              </Typography>
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                sx={{
                                  fontSize: "0.6rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                Balls
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    );
                  })()}

                  <IconButton
                    onClick={() => {
                      setFastestIndex((prev) => {
                        const nextIndex = prev + cardsPerPage;
                        return nextIndex >= results.fastest.length
                          ? 0
                          : nextIndex;
                      });
                    }}
                    sx={{
                      display: "inline-flex",
                      position: "absolute",
                      right: { xs: -12, sm: 10 },
                      zIndex: 10,
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      backdropFilter: "blur(4px)",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
                      },
                      width: { xs: 32, sm: 48 },
                      height: { xs: 32, sm: 48 },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ChevronRightIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mb: 4,
                    flexWrap: "wrap",
                    maxWidth: "90%",
                    mx: "auto",
                  }}
                >
                  {(() => {
                    const numPages = Math.ceil(
                      results.fastest.length / cardsPerPage,
                    );
                    const activePageIndex = Math.floor(
                      fastestIndex / cardsPerPage,
                    );
                    return Array.from({ length: numPages }).map((_, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setFastestIndex(idx * cardsPerPage)}
                        sx={{
                          width: idx === activePageIndex ? 24 : 8,
                          height: 8,
                          borderRadius: 4,
                          bgcolor:
                            idx === activePageIndex
                              ? "primary.main"
                              : "rgba(255, 255, 255, 0.2)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            bgcolor:
                              idx === activePageIndex
                                ? "primary.main"
                                : "rgba(255, 255, 255, 0.4)",
                          },
                        }}
                      />
                    ));
                  })()}
                </Box>
              </Box>
            )}

            {results?.slowest && results.slowest.length > 0 && (
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{
                    mb: 3.5,
                    mt: 2,
                    textAlign: "center",
                    color: "error.main",
                  }}
                >
                  Top 10 Slowest to Exactly {debouncedTarget} Runs
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    width: "100%",
                    maxWidth: 1200,
                    mx: "auto",
                    mb: 2,
                    px: { xs: 3, sm: 8 },
                  }}
                >
                  <IconButton
                    onClick={() => {
                      setSlowestIndex((prev) => {
                        if (prev === 0) {
                          const remainder =
                            results.slowest.length % cardsPerPage;
                          return remainder === 0
                            ? results.slowest.length - cardsPerPage
                            : results.slowest.length - remainder;
                        }
                        const prevIndex = prev - cardsPerPage;
                        return prevIndex < 0 ? 0 : prevIndex;
                      });
                    }}
                    sx={{
                      display: "inline-flex",
                      position: "absolute",
                      left: { xs: -12, sm: 10 },
                      zIndex: 10,
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      backdropFilter: "blur(4px)",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
                      },
                      width: { xs: 32, sm: 48 },
                      height: { xs: 32, sm: 48 },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                  </IconButton>

                  {(() => {
                    const len = results.slowest.length;
                    const visibleCards = [];
                    for (let i = 0; i < cardsPerPage; i++) {
                      const cardIndex = slowestIndex + i;
                      if (cardIndex < len) {
                        visibleCards.push({
                          res: results.slowest[cardIndex],
                          index: cardIndex,
                        });
                      }
                    }

                    return (
                      <Box
                        sx={{
                          width: "100%",
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm:
                              visibleCards.length > 1
                                ? "repeat(2, 1fr)"
                                : "1fr",
                            md:
                              visibleCards.length > 2
                                ? "repeat(3, 1fr)"
                                : visibleCards.length > 1
                                  ? "repeat(2, 1fr)"
                                  : "1fr",
                          },
                          gap: 2.5,
                          transition: "all 0.5s ease",
                          animation: "fadeInScale 0.4s ease-out",
                          "@keyframes fadeInScale": {
                            "0%": { opacity: 0, transform: "scale(0.96)" },
                            "100%": { opacity: 1, transform: "scale(1)" },
                          },
                        }}
                        key={slowestIndex}
                      >
                        {visibleCards.map(({ res, index }) => (
                          <Paper
                            key={`slowest-${res.id}`}
                            onClick={() =>
                              setSelectedCard({ ...res, type: "Slowest" })
                            }
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              border: "1px solid",
                              cursor: "pointer",
                              borderColor:
                                index === 0 ? "error.main" : "divider",
                              bgcolor:
                                index === 0
                                  ? "rgba(239, 68, 68, 0.06)"
                                  : "background.paper",
                              backgroundImage:
                                index === 0
                                  ? "none"
                                  : "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.04) 0px, transparent 50%)",
                              transition:
                                "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow:
                                  "0 8px 24px rgba(99, 102, 241, 0.15)",
                                borderColor:
                                  index === 0
                                    ? "error.main"
                                    : "rgba(99, 102, 241, 0.4)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                minWidth: 40,
                              }}
                            >
                              <Typography
                                variant="h5"
                                fontWeight={900}
                                color={
                                  index === 0 ? "error.main" : "text.secondary"
                                }
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
                                sx={{ display: "block", mb: 0.5 }}
                              >
                                {res.team} • {formatDate(res.matchDate)}
                              </Typography>
                              <Chip
                                size="small"
                                label={`${res.runsScored} runs scored`}
                                variant="outlined"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            </Box>

                            <Box
                              sx={{
                                textAlign: "center",
                                bgcolor:
                                  index === 0
                                    ? "#ff4757"
                                    : "background.default",
                                color: index === 0 ? "white" : "text.primary",
                                p: 1.5,
                                borderRadius: 2,
                                minWidth: 80,
                                border: index === 0 ? "none" : "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Typography
                                variant="h5"
                                fontWeight={900}
                                lineHeight={1}
                              >
                                {res.ballsFaced}
                              </Typography>
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                sx={{
                                  fontSize: "0.6rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                Balls
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    );
                  })()}

                  <IconButton
                    onClick={() => {
                      setSlowestIndex((prev) => {
                        const nextIndex = prev + cardsPerPage;
                        return nextIndex >= results.slowest.length
                          ? 0
                          : nextIndex;
                      });
                    }}
                    sx={{
                      display: "inline-flex",
                      position: "absolute",
                      right: { xs: -12, sm: 10 },
                      zIndex: 10,
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      backdropFilter: "blur(4px)",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
                      },
                      width: { xs: 32, sm: 48 },
                      height: { xs: 32, sm: 48 },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ChevronRightIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mb: 4,
                    flexWrap: "wrap",
                    maxWidth: "90%",
                    mx: "auto",
                  }}
                >
                  {(() => {
                    const numPages = Math.ceil(
                      results.slowest.length / cardsPerPage,
                    );
                    const activePageIndex = Math.floor(
                      slowestIndex / cardsPerPage,
                    );
                    return Array.from({ length: numPages }).map((_, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setSlowestIndex(idx * cardsPerPage)}
                        sx={{
                          width: idx === activePageIndex ? 24 : 8,
                          height: 8,
                          borderRadius: 4,
                          bgcolor:
                            idx === activePageIndex
                              ? "primary.main"
                              : "rgba(255, 255, 255, 0.2)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            bgcolor:
                              idx === activePageIndex
                                ? "primary.main"
                                : "rgba(255, 255, 255, 0.4)",
                          },
                        }}
                      />
                    ));
                  })()}
                </Box>
              </Box>
            )}
          </>
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
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={800}>
                  {selectedCard.playerName}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ opacity: 0.9, display: "block" }}
                >
                  {selectedCard.team} vs{" "}
                  {selectedCard.againstTeam || "Opponent"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.7, display: "block" }}
                >
                  {selectedCard.venue || "Stadium"} •{" "}
                  {formatDate(selectedCard.matchDate)}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent
              sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default" }}
            >
              <Box
                sx={{
                  mb: 4,
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={`Match Result: ${selectedCard.matchResult || "Unknown"}`}
                  sx={{
                    fontWeight: 800,
                    px: 2,
                    py: 2.5,
                    fontSize: "1rem",
                    bgcolor:
                      selectedCard.matchResult === "Won"
                        ? "success.main"
                        : selectedCard.matchResult === "Lost"
                          ? "error.main"
                          : "warning.main",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                />
                <Chip
                  label={`Strike Rate: ${((selectedCard.runsScored / selectedCard.ballsFaced) * 100).toFixed(2)}`}
                  sx={{
                    fontWeight: 800,
                    px: 2,
                    py: 2.5,
                    fontSize: "0.9rem",
                    bgcolor: "primary.main",
                    color: "white",
                  }}
                />
                <Chip
                  label={`Dot Balls: ${selectedCard.sequence?.filter((r) => r === 0).length || 0}`}
                  sx={{
                    fontWeight: 800,
                    px: 2,
                    py: 2.5,
                    fontSize: "0.9rem",
                    bgcolor: "text.secondary",
                    color: "white",
                  }}
                />
                {selectedCard.tossWinner && selectedCard.tossDecision && (
                  <Chip
                    label={`Toss: ${selectedCard.tossWinner} chose to ${selectedCard.tossDecision}`}
                    sx={{
                      fontWeight: 800,
                      px: 2,
                      py: 2.5,
                      fontSize: "0.9rem",
                      bgcolor: "info.main",
                      color: "white",
                    }}
                  />
                )}
              </Box>

              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      height: "100%",
                    }}
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

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Boundaries (4s & 6s)
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={900}
                        color="primary.main"
                      >
                        {selectedCard.boundariesRuns || 0} runs
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        ((selectedCard.boundariesRuns || 0) /
                          selectedCard.runsScored) *
                        100
                      }
                      sx={{ height: 8, borderRadius: 4, mb: 3 }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Strike Rotation (1s, 2s, 3s)
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={900}
                        color="secondary.main"
                      >
                        {selectedCard.rotationRuns || 0} runs
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        ((selectedCard.rotationRuns || 0) /
                          selectedCard.runsScored) *
                        100
                      }
                      color="secondary"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      height: "100%",
                    }}
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
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ width: 80 }}
                        >
                          Powerplay
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={
                              ((selectedCard.powerplayRuns || 0) /
                                selectedCard.runsScored) *
                              100
                            }
                            color="info"
                            sx={{ height: 12, borderRadius: 6 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={900}
                          sx={{ width: 40, textAlign: "right" }}
                        >
                          {selectedCard.powerplayRuns || 0}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ width: 80 }}
                        >
                          Middle
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={
                              ((selectedCard.middleRuns || 0) /
                                selectedCard.runsScored) *
                              100
                            }
                            color="warning"
                            sx={{ height: 12, borderRadius: 6 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={900}
                          sx={{ width: 40, textAlign: "right" }}
                        >
                          {selectedCard.middleRuns || 0}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ width: 80 }}
                        >
                          Death
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={
                              ((selectedCard.deathRuns || 0) /
                                selectedCard.runsScored) *
                              100
                            }
                            color="error"
                            sx={{ height: 12, borderRadius: 6 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={900}
                          sx={{ width: 40, textAlign: "right" }}
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
                  sx={{
                    mb: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    color: "secondary.main",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  🤯 Advanced Milestone Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: "rgba(239, 68, 68, 0.05)",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                        height: "100%",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="error.main"
                        textTransform="uppercase"
                        sx={{ display: "block" }}
                      >
                        Primary Victim
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={900}
                        sx={{ mt: 1 }}
                      >
                        {selectedCard.primaryVictim || "Unknown"}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ opacity: 0.8, mt: 0.5 }}
                      >
                        Destroyed for {selectedCard.victimRuns || 0} runs off{" "}
                        {selectedCard.victimBalls || 0} balls! (SR:{" "}
                        {selectedCard.victimBalls > 0
                          ? (
                              (selectedCard.victimRuns /
                                selectedCard.victimBalls) *
                              100
                            ).toFixed(0)
                          : "N/A"}
                        )
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: "rgba(16, 185, 129, 0.05)",
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                        height: "100%",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="success.main"
                        textTransform="uppercase"
                        sx={{ display: "block" }}
                      >
                        The Accelerator
                      </Typography>
                      <Box
                        sx={{
                          mt: 1.5,
                          display: "flex",
                          justifyContent: "space-around",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.7, display: "block" }}
                          >
                            First Half
                          </Typography>
                          <Typography variant="body1" fontWeight={900}>
                            {selectedCard.initialSR !== undefined
                              ? selectedCard.initialSR
                              : "N/A"}{" "}
                            SR
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.7, display: "block" }}
                          >
                            Second Half
                          </Typography>
                          <Typography variant="body1" fontWeight={900}>
                            {selectedCard.deathSR !== undefined
                              ? selectedCard.deathSR
                              : "N/A"}{" "}
                            SR
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: "rgba(59, 130, 246, 0.05)",
                        border: "1px solid rgba(59, 130, 246, 0.15)",
                        height: "100%",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="info.main"
                        textTransform="uppercase"
                        sx={{ display: "block" }}
                      >
                        Breathless Streaks
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{ mt: 1.5 }}
                      >
                        🔥 Max {selectedCard.maxBoundaryStreak || 0} boundaries
                        in a row
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{ mt: 0.5 }}
                      >
                        🚀 {selectedCard.maxNonDotStreak || 0} consecutive
                        scoring shots
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  mt: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  gutterBottom
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <span>Ball-by-Ball Sequence</span>
                  <Chip
                    size="small"
                    label={`${selectedCard.type} to ${selectedCard.runsScored} runs in ${selectedCard.ballsFaced} balls`}
                  />
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  {selectedCard.sequence?.map((runs, i) => {
                    let bgColor = "rgba(255,255,255,0.1)";
                    let color = "white";
                    if (runs === 4) {
                      bgColor = "#4dabf5";
                      color = "white";
                    }
                    if (runs === 6) {
                      bgColor = "#9c27b0";
                      color = "white";
                    }
                    if (runs === 0) {
                      color = "rgba(255,255,255,0.4)";
                    }

                    return (
                      <Box
                        key={i}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: bgColor,
                          color: color,
                          fontWeight: 800,
                          border:
                            runs === 0
                              ? "1px solid rgba(255,255,255,0.2)"
                              : "none",
                          boxShadow:
                            runs >= 4 ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                        }}
                      >
                        {runs}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default MilestoneExplorer;
