import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Divider,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { useFranchises, useCompareFranchises } from "../hooks/useFranchise.js";
import StatCard from "../components/common/StatCard.jsx";
import { ChartSkeleton } from "../components/common/LoadingSkeleton.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SecurityIcon from "@mui/icons-material/Security";
import ExploreIcon from "@mui/icons-material/Explore";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`h2h-tabpanel-${index}`}
      aria-labelledby={`h2h-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 4, overflowX: "auto", maxWidth: "100%" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LeaderboardCard = ({
  title,
  data,
  icon,
  renderItem,
  color = "primary.main",
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, sm: 3 },
      borderRadius: 4,
      height: "100%",
      width: "100%",
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-4px)" },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        mb: 3,
        width: "100%",
      }}
    >
      <Box
        sx={{
          p: 1.2,
          borderRadius: "50%",
          bgcolor: `${color}15`,
          color: color,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 1.5,
          width: 48,
          height: 48,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        fontWeight={800}
        color="text.primary"
        sx={{ textAlign: "center", width: "100%" }}
      >
        {title}
      </Typography>
    </Box>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        flexGrow: 1,
        width: "100%",
      }}
    >
      {data && data.length > 0 ? (
        data.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={900}
              color="text.disabled"
              sx={{ width: 36, flexShrink: 0 }}
            >
              #{idx + 1}
            </Typography>
            <Box sx={{ flexGrow: 1, minWidth: 0, mx: 2 }}>
              <Typography variant="body1" fontWeight={700} noWrap>
                {item.name}
              </Typography>
              {item.team && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", lineHeight: 1.6 }}
                >
                  {item.team}
                </Typography>
              )}
            </Box>
            <Typography
              variant="h6"
              fontWeight={800}
              color={color}
              sx={{ flexShrink: 0 }}
            >
              {renderItem(item)}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No data available
        </Typography>
      )}
    </Box>
  </Paper>
);

const FormTimeline = ({ matches, f1, f2 }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 1,
      mt: 2,
      mb: 2,
      width: "100%",
    }}
  >
    {matches.map((m, i) => {
      const isF1Win = m.winner === f1.shortName;
      const isF2Win = m.winner === f2.shortName;
      let color = "text.disabled";
      let label = "T";
      if (isF1Win) {
        color = f1.color;
        label = f1.shortName[0];
      }
      if (isF2Win) {
        color = f2.color;
        label = f2.shortName[0];
      }

      return (
        <Box
          key={i}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              boxShadow: `0 0 10px ${color}80`,
            }}
          >
            {label}
          </Box>
        </Box>
      );
    })}
  </Box>
);

const FlowBox = ({ title, subtitle, color, isMain }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 3,
      border: `2px solid ${color}`,
      bgcolor: `${color}10`,
      textAlign: "center",
      flex: 1,
      minWidth: 120,
    }}
  >
    <Typography variant={isMain ? "h5" : "h6"} fontWeight={900} color={color}>
      {title}
    </Typography>
    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      sx={{ textTransform: "uppercase" }}
    >
      {subtitle}
    </Typography>
  </Box>
);

const CompactStat = ({ title, value, icon: Icon, color = "primary.main" }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.default",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      },
    }}
  >
    {Icon && (
      <Box
        sx={{
          p: 1,
          borderRadius: "50%",
          bgcolor: `${color}15`,
          color: color,
          display: "flex",
          mb: 1,
        }}
      >
        <Icon fontSize="small" />
      </Box>
    )}
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={700}
      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
    >
      {title}
    </Typography>
    <Typography
      variant="h5"
      fontWeight={800}
      color="text.primary"
      sx={{ mt: 0.5 }}
    >
      {value}
    </Typography>
  </Paper>
);

function FranchiseComparison() {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const { data: franchises } = useFranchises();
  const { data: comparisonData, isLoading } = useCompareFranchises([
    team1,
    team2,
  ]);

  const f1 = comparisonData?.franchises?.[0];
  const f2 = comparisonData?.franchises?.[1];
  const h2h = comparisonData?.h2h;
  const causality = h2h?.causality;

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  return (
    <Box>
      <PageHeader
        title="Franchise Rivalry Matrix"
        subtitle="Compare head-to-head records and stats between franchises"
      />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 8px 32px rgba(0,0,0,0.03)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 2, sm: 4 },
            width: "100%",
          }}
        >
          <Box sx={{ width: { xs: "100%", sm: 280 } }}>
            <TextField
              select
              fullWidth
              size="small"
              variant="outlined"
              label="Select Team 1"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontWeight: 700,
                },
                "& .MuiSelect-select": {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                    },
                  },
                },
              }}
            >
              {franchises
                ?.filter((f) => f.shortName !== team2)
                .map((f) => (
                  <MenuItem
                    key={f.shortName}
                    value={f.shortName}
                    sx={{
                      justifyContent: "center",
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    {f.name}
                  </MenuItem>
                ))}
            </TextField>
          </Box>

          <Typography
            variant="h4"
            fontWeight={900}
            color="text.disabled"
            sx={{ fontStyle: "italic", letterSpacing: 2, py: { xs: 1, sm: 0 } }}
          >
            VS
          </Typography>

          <Box sx={{ width: { xs: "100%", sm: 280 } }}>
            <TextField
              select
              fullWidth
              size="small"
              variant="outlined"
              label="Select Team 2"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontWeight: 700,
                },
                "& .MuiSelect-select": {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                    },
                  },
                },
              }}
            >
              {franchises
                ?.filter((f) => f.shortName !== team1)
                .map((f) => (
                  <MenuItem
                    key={f.shortName}
                    value={f.shortName}
                    sx={{
                      justifyContent: "center",
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    {f.name}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
        </Box>
      </Paper>

      {isLoading ? (
        <ChartSkeleton message="Comparing franchise rosters and match histories..." />
      ) : f1 && f2 && h2h ? (
        <>
          <Box
            sx={{
              borderBottom: 2,
              borderColor: "divider",
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              textColor="primary"
              indicatorColor="primary"
              sx={{
                width: "100%",
                "& .MuiTab-root": {
                  fontSize: "1rem",
                  textTransform: "none",
                  px: 3,
                  minWidth: "auto",
                },
              }}
            >
              <Tab
                label="H2H Overview"
                sx={{ fontWeight: tabValue === 0 ? 800 : 500 }}
              />
              <Tab
                label="Causality Engine"
                sx={{ fontWeight: tabValue === 1 ? 800 : 500 }}
              />
              <Tab
                label="Tactical Dominance"
                sx={{ fontWeight: tabValue === 2 ? 800 : 500 }}
              />
              <Tab
                label="Player Hall of Fame"
                sx={{ fontWeight: tabValue === 3 ? 800 : 500 }}
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: `${f1.color}08`,
                    borderRadius: 4,
                    height: "100%",
                    borderTop: `6px solid ${f1.color}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      mb: 3,
                      width: "100%",
                    }}
                  >
                    {f1.logoUrl && (
                      <Avatar
                        src={f1.logoUrl}
                        alt={f1.shortName}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: "white",
                          p: 0.8,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    )}
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      color={f1.color}
                      sx={{ letterSpacing: "-1px" }}
                    >
                      {f1.shortName}
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CompactStat
                        title="Total Titles"
                        value={f1.titles}
                        color="#FFD700"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CompactStat
                        title="Total Matches"
                        value={f1.lifetimeStats?.totalMatches}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CompactStat
                        title="Overall Win %"
                        value={`${f1.lifetimeStats?.winPct}%`}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: `${f2.color}08`,
                    borderRadius: 4,
                    height: "100%",
                    borderTop: `6px solid ${f2.color}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      mb: 3,
                      width: "100%",
                    }}
                  >
                    {f2.logoUrl && (
                      <Avatar
                        src={f2.logoUrl}
                        alt={f2.shortName}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: "white",
                          p: 0.8,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    )}
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      color={f2.color}
                      sx={{ letterSpacing: "-1px" }}
                    >
                      {f2.shortName}
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CompactStat
                        title="Total Titles"
                        value={f2.titles}
                        color="#FFD700"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CompactStat
                        title="Total Matches"
                        value={f2.lifetimeStats?.totalMatches}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CompactStat
                        title="Overall Win %"
                        value={`${f2.lifetimeStats?.winPct}%`}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ width: "100%" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 4,
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{ textAlign: { xs: "center", md: "left" }, flex: 1 }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        mb={0.5}
                        color="text.primary"
                      >
                        Head to Head
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: 1.5,
                          fontWeight: 700,
                        }}
                      >
                        {h2h.totalMatches} Encounters
                      </Typography>
                    </Box>

                    <Box sx={{ width: "100%", flex: 2, maxWidth: { md: 500 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1.5,
                          alignItems: "flex-end",
                        }}
                      >
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          color={f1.color}
                        >
                          {h2h[f1.shortName].wins} {f1.shortName}
                        </Typography>
                        <Chip
                          label={`${h2h.ties} TIES`}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          color={f2.color}
                        >
                          {f2.shortName} {h2h[f2.shortName].wins}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (h2h[f1.shortName].wins / (h2h.totalMatches || 1)) *
                          100
                        }
                        sx={{
                          height: 16,
                          borderRadius: 8,
                          bgcolor: `${f2.color}90`,
                          "& .MuiLinearProgress-bar": { bgcolor: f1.color },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        textAlign: "center",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.secondary"
                        sx={{
                          letterSpacing: 1,
                          display: "block",
                          mb: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        RECENT FORM (LAST 5)
                      </Typography>
                      {h2h.last5Matches && (
                        <FormTimeline
                          matches={h2h.last5Matches}
                          f1={f1}
                          f2={f2}
                        />
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {causality && (
              <Box sx={{ width: "100%" }}>
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} sx={{ mb: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 3,
                        width: "100%",
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color="primary.main"
                        sx={{ textAlign: "center" }}
                      >
                        The Toss Blueprint (Decision &rarr; Win Probability)
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {[f1, f2].map((f) => {
                        const t = causality[f.shortName].toss;
                        if (!t) return null;
                        return (
                          <Grid item xs={12} md={6} key={f.shortName}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 4,
                                border: `2px solid ${f.color}40`,
                                bgcolor: `${f.color}05`,
                                width: "100%",
                              }}
                            >
                              <Typography
                                variant="h6"
                                fontWeight={800}
                                color={f.color}
                                mb={3}
                                sx={{ textAlign: "center" }}
                              >
                                {f.name} Toss Matrix
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: { xs: "column", sm: "row" },
                                  alignItems: "center",
                                  gap: 2,
                                  width: "100%",
                                }}
                              >
                                <FlowBox
                                  title={`${t.tossWins}`}
                                  subtitle="Tosses Won"
                                  color={f.color}
                                  isMain
                                />
                                <Box
                                  sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    width: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 2,
                                      width: "100%",
                                    }}
                                  >
                                    <FlowBox
                                      title={`${t.chooseBatPct}%`}
                                      subtitle="Choose Bat"
                                      color="#FF9800"
                                    />
                                    <Typography
                                      variant="h6"
                                      color="text.secondary"
                                    >
                                      &rarr;
                                    </Typography>
                                    <FlowBox
                                      title={`${t.batWinProb}%`}
                                      subtitle="Win Prob"
                                      color="#4CAF50"
                                    />
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 2,
                                      width: "100%",
                                    }}
                                  >
                                    <FlowBox
                                      title={`${t.chooseFieldPct}%`}
                                      subtitle="Choose Field"
                                      color="#2196F3"
                                    />
                                    <Typography
                                      variant="h6"
                                      color="text.secondary"
                                    >
                                      &rarr;
                                    </Typography>
                                    <FlowBox
                                      title={`${t.fieldWinProb}%`}
                                      subtitle="Win Prob"
                                      color="#4CAF50"
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid
                  container
                  spacing={4}
                  justifyContent="center"
                  sx={{ mt: 2, width: "100%" }}
                >
                  <Grid
                    item
                    xs={12}
                    md={5.5}
                    lg={5}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ mb: 2, width: "100%", textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        color="secondary.main"
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      >
                        The Pitch Dictator
                      </Typography>
                    </Box>
                    {causality.venue && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          width: "100%",
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={800}
                          sx={{
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                          }}
                          mb={0.5}
                        >
                          Most Frequent Battleground
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          fontWeight={900}
                          color="text.primary"
                          mb={2}
                          sx={{ fontSize: { xs: "0.9rem", sm: "1.1rem" } }}
                        >
                          {causality.venue.name} ({causality.venue.matches}{" "}
                          matches)
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            width: "100%",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              bgcolor: "background.default",
                              border: "1px solid",
                              borderColor: "divider",
                              textAlign: "center",
                              flex: 1,
                            }}
                          >
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#FF9800"
                              sx={{ fontSize: { xs: "1.5rem", sm: "2.2rem" } }}
                            >
                              {causality.venue.batFirstWinProb}%
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                lineHeight: 1.2,
                              }}
                            >
                              Bat First Win
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              bgcolor: "background.default",
                              border: "1px solid",
                              borderColor: "divider",
                              textAlign: "center",
                              flex: 1,
                            }}
                          >
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              color="#2196F3"
                              sx={{ fontSize: { xs: "1.5rem", sm: "2.2rem" } }}
                            >
                              {causality.venue.fieldFirstWinProb}%
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                lineHeight: 1.2,
                              }}
                            >
                              Field First Win
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    )}
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={6.5}
                    lg={6}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ mb: 2, width: "100%", textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        color="error.main"
                        sx={{
                          textAlign: "center",
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        X-Factor Dependency
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "center",
                        alignItems: "stretch",
                        gap: 2,
                        width: "100%",
                        flexGrow: 1,
                      }}
                    >
                      {[f1, f2].map((f) => {
                        const x = causality[f.shortName].xFactor;
                        if (!x) return null;
                        return (
                          <Paper
                            key={f.shortName}
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 4,
                              border: `2px solid ${f.color}40`,
                              bgcolor: `${f.color}03`,
                              flex: 1,
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={800}
                              color={f.color}
                              sx={{
                                textTransform: "uppercase",
                                display: "block",
                                fontSize: "0.7rem",
                              }}
                            >
                              {f.shortName} Anchor
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={900}
                              mb={2}
                              sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                            >
                              {x.name}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                width: "100%",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  p: 1,
                                  bgcolor: "#4CAF5015",
                                  borderRadius: 2,
                                  border: "1px solid #4CAF5040",
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  sx={{
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  }}
                                >
                                  Scores 30+
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={900}
                                  color="#4CAF50"
                                  sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  }}
                                >
                                  {x.bigWinProb}% Win
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  p: 1,
                                  bgcolor: "#F4433615",
                                  borderRadius: 2,
                                  border: "1px solid #F4433640",
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  sx={{
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  }}
                                >
                                  Fails (&lt;30)
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={900}
                                  color="#F44336"
                                  sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  }}
                                >
                                  {x.failWinProb}% Win
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "center",
                alignItems: { xs: "center", md: "stretch" },
                gap: 4,
                width: "100%",
                mb: 6,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "2px solid #FF980040",
                  bgcolor: "#FF980005",
                  width: "100%",
                  maxWidth: 360,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <ExploreIcon
                  sx={{
                    fontSize: 48,
                    color: "#FF9800",
                    mb: 2,
                    opacity: 0.9,
                  }}
                />
                <Typography variant="h3" fontWeight={900} color="#FF9800">
                  {h2h.tossImpact}%
                </Typography>
                <Typography
                  variant="body1"
                  color="text.primary"
                  fontWeight={800}
                  mt={2}
                >
                  Overall Toss Impact
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  mt={0.5}
                  sx={{ maxWidth: 220 }}
                >
                  Influence of toss wins on match outcome
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "2px solid #9C27B040",
                  bgcolor: "#9C27B005",
                  width: "100%",
                  maxWidth: 360,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#9C27B0"
                  mb={3}
                >
                  Home Dominance
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    width: "100%",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight={900} color={f1.color}>
                      {h2h.f1HomeWins}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{ display: "block", mt: 1, lineHeight: 1.2 }}
                    >
                      {f1.shortName} Home Wins
                    </Typography>
                  </Box>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ borderRightWidth: 2, opacity: 0.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight={900} color={f2.color}>
                      {h2h.f2HomeWins}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{ display: "block", mt: 1, lineHeight: 1.2 }}
                    >
                      {f2.shortName} Home Wins
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "2px solid #2196F340",
                  bgcolor: "#2196F305",
                  width: "100%",
                  maxWidth: 360,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <ExploreIcon
                  sx={{
                    fontSize: 48,
                    color: "#2196F3",
                    mb: 2,
                    opacity: 0.9,
                    transform: "rotate(45deg)",
                  }}
                />
                <Typography variant="h3" fontWeight={900} color="#2196F3">
                  {h2h.totalMatches - h2h.f1HomeWins - h2h.f2HomeWins}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.primary"
                  fontWeight={800}
                  mt={2}
                >
                  Neutral Ground Battles
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  mt={0.5}
                  sx={{ maxWidth: 220 }}
                >
                  Matches played at neutral stadiums
                </Typography>
              </Paper>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "center",
                alignItems: "stretch",
                gap: 4,
                width: "100%",
                mt: 4,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  maxWidth: { xs: "100%", md: 480 },
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    border: `2px solid ${f1.color}30`,
                    bgcolor: `${f1.color}05`,
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color={f1.color}
                    textAlign="center"
                  >
                    {f1.shortName} Win Profile
                  </Typography>
                  <Box sx={{ height: { xs: 16, sm: 28 } }} />
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={6}>
                      <StatCard
                        title="Bat First Wins"
                        value={h2h[f1.shortName].batFirstWins}
                        color={f1.color}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Bat Second Wins"
                        value={h2h[f1.shortName].batSecondWins}
                        color={f1.color}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Largest Win (Runs)"
                        value={
                          h2h[f1.shortName].largestRunWin > 0
                            ? `${h2h[f1.shortName].largestRunWin} runs`
                            : "-"
                        }
                        color={f1.color}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Largest Win (Wkts)"
                        value={
                          h2h[f1.shortName].largestWicketWin > 0
                            ? `${h2h[f1.shortName].largestWicketWin} wkts`
                            : "-"
                        }
                        color={f1.color}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  maxWidth: { xs: "100%", md: 480 },
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    border: `2px solid ${f2.color}30`,
                    bgcolor: `${f2.color}05`,
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color={f2.color}
                    textAlign="center"
                  >
                    {f2.shortName} Win Profile
                  </Typography>
                  <Box sx={{ height: { xs: 16, sm: 28 } }} />
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={6}>
                      <StatCard
                        title="Bat First Wins"
                        value={h2h[f2.shortName].batFirstWins}
                        color={f2.color}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Bat Second Wins"
                        value={h2h[f2.shortName].batSecondWins}
                        color={f2.color}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Largest Win (Runs)"
                        value={
                          h2h[f2.shortName].largestRunWin > 0
                            ? `${h2h[f2.shortName].largestRunWin} runs`
                            : "-"
                        }
                        color={f2.color}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Largest Win (Wkts)"
                        value={
                          h2h[f2.shortName].largestWicketWin > 0
                            ? `${h2h[f2.shortName].largestWicketWin} wkts`
                            : "-"
                        }
                        color={f2.color}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 3,
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
                "& > *": { minWidth: 0 },
              }}
            >
              <LeaderboardCard
                title="Most Runs"
                data={h2h.topRunScorers}
                icon={<SportsCricketIcon />}
                color="#2196F3"
                renderItem={(item) => item.runs}
              />
              <LeaderboardCard
                title="Most Wickets"
                data={h2h.topWicketTakers}
                icon={<Typography fontWeight={900}>W</Typography>}
                color="#F44336"
                renderItem={(item) => item.wickets}
              />
              <LeaderboardCard
                title="Most PoTM Awards"
                data={h2h.topPotm}
                icon={<EmojiEventsIcon />}
                color="#FFD700"
                renderItem={(item) => item.awards}
              />
              <LeaderboardCard
                title="Highest Scores"
                data={h2h.highestScores}
                icon={<StarIcon />}
                color="#FF9800"
                renderItem={(item) => `${item.runs} (${item.balls})`}
              />
              <LeaderboardCard
                title="Best Bowling"
                data={h2h.bestBowling}
                icon={<StarIcon />}
                color="#4CAF50"
                renderItem={(item) => `${item.wickets}/${item.runsConceded}`}
              />
              <LeaderboardCard
                title="Fielding Supremacy"
                data={h2h.topFielders}
                icon={<EmojiEventsIcon />}
                color="#FFC107"
                renderItem={(item) => `${item.catches} catches`}
              />
              <LeaderboardCard
                title="Highest Strike Rate (min 50r)"
                data={h2h.topStrikeRates}
                icon={<ShowChartIcon />}
                color="#E91E63"
                renderItem={(item) => item.sr.toFixed(1)}
              />
              <LeaderboardCard
                title="Boundary Dependency (min 100r)"
                data={h2h.topBoundaryDep}
                icon={<Typography fontWeight={900}>%</Typography>}
                color="#FF5722"
                renderItem={(item) => `${item.boundPct.toFixed(1)}%`}
              />
              <LeaderboardCard
                title="The Ironmen (Matches)"
                data={h2h.topIronmen}
                icon={<SportsCricketIcon />}
                color="#607D8B"
                renderItem={(item) => item.matchesPlayed}
              />
              <LeaderboardCard
                title="Best Economy (min 8 overs)"
                data={h2h.topEconomyRates}
                icon={<SecurityIcon />}
                color="#009688"
                renderItem={(item) => item.eco.toFixed(2)}
              />
              <LeaderboardCard
                title="Bowling Strike Rate (min 5w)"
                data={h2h.topBowlingSr}
                icon={<Typography fontWeight={900}>W</Typography>}
                color="#795548"
                renderItem={(item) => item.bowlSr.toFixed(1)}
              />
              <LeaderboardCard
                title="Dot Ball Masters (min 60b)"
                data={h2h.topDotBallers}
                icon={<Typography fontWeight={900}>O</Typography>}
                color="#9E9E9E"
                renderItem={(item) => `${item.dotPct.toFixed(1)}%`}
              />
              <LeaderboardCard
                title="Most Fours"
                data={h2h.topFourHitters}
                icon={<Typography fontWeight={900}>4</Typography>}
                color="#3F51B5"
                renderItem={(item) => item.fours}
              />
              <LeaderboardCard
                title="Most Sixes"
                data={h2h.topSixHitters}
                icon={<Typography fontWeight={900}>6</Typography>}
                color="#9C27B0"
                renderItem={(item) => item.sixes}
              />
              <LeaderboardCard
                title="Fielding Supremacy (Catches)"
                data={h2h.topFielders}
                icon={<EmojiEventsIcon />}
                color="#FFC107"
                renderItem={(item) => item.catches}
              />
            </Box>
          </TabPanel>
        </>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            border: "1px dashed rgba(255, 255, 255, 0.1)",
            bgcolor: "rgba(255,255,255,0.01)",
            mt: 4,
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            Select Teams to Compare
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose two franchises from the dropdown menus above to compare their
            historical records, head-to-head match stats, and tactical metrics.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default FranchiseComparison;
