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
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
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
      p: 3,
      borderRadius: 4,
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-4px)" },
    }}
  >
    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
      <Box
        sx={{
          p: 1,
          borderRadius: "50%",
          bgcolor: `${color}15`,
          color: color,
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={800} color="text.primary">
        {title}
      </Typography>
    </Box>
    <Box display="flex" flexDirection="column" gap={2}>
      {data && data.length > 0 ? (
        data.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
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
              sx={{ width: 30 }}
            >
              #{idx + 1}
            </Typography>
            <Box flexGrow={1} ml={1}>
              <Typography variant="body1" fontWeight={700}>
                {item.name}
              </Typography>
              {item.team && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase" }}
                >
                  {item.team}
                </Typography>
              )}
            </Box>
            <Typography variant="h6" fontWeight={800} color={color}>
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
    display="flex"
    justifyContent="center"
    alignItems="center"
    gap={1}
    mt={2}
    mb={2}
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

function FranchiseComparison() {
  const [team1, setTeam1] = useState("MI");
  const [team2, setTeam2] = useState("CSK");
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
      <Box mb={5} textAlign="center">
        <Typography
          variant="h3"
          fontWeight={900}
          gutterBottom
          sx={{
            background: "linear-gradient(45deg, #FF6B6B 10%, #6B66FF 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-1.5px",
          }}
        >
          Clash of the Titans
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400}>
          The ultimate, world-class analytical breakdown of legendary rivalries
        </Typography>
      </Box>

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
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label="Select Team 1"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontWeight: 700,
                },
              }}
            >
              {franchises?.map((f) => (
                <MenuItem key={f.shortName} value={f.shortName}>
                  {f.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2} textAlign="center">
            <Typography
              variant="h4"
              fontWeight={900}
              color="text.disabled"
              sx={{ fontStyle: "italic", letterSpacing: 2 }}
            >
              VS
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label="Select Team 2"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontWeight: 700,
                },
              }}
            >
              {franchises?.map((f) => (
                <MenuItem key={f.shortName} value={f.shortName}>
                  {f.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <ChartSkeleton />
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
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  fontSize: "1rem",
                  textTransform: "none",
                  px: 3,
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
              <Tab
                label="Advanced Analytics"
                sx={{ fontWeight: tabValue === 4 ? 800 : 500 }}
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 4,
                    bgcolor: `${f1.color}08`,
                    borderRadius: 4,
                    height: "100%",
                    borderTop: `6px solid ${f1.color}`,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={4}>
                    {f1.logoUrl && (
                      <Avatar
                        src={f1.logoUrl}
                        alt={f1.shortName}
                        sx={{
                          width: 72,
                          height: 72,
                          bgcolor: "white",
                          p: 1,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    )}
                    <Typography
                      variant="h3"
                      fontWeight={900}
                      color={f1.color}
                      sx={{ letterSpacing: "-1px" }}
                    >
                      {f1.shortName}
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <StatCard
                        title="Total Titles"
                        value={f1.titles}
                        icon={EmojiEventsIcon}
                        color="#FFD700"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Total Matches"
                        value={f1.lifetimeStats?.totalMatches}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Overall Win %"
                        value={`${f1.lifetimeStats?.winPct}%`}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    mb={1}
                    color="text.primary"
                  >
                    Head to Head
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    mb={4}
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      fontWeight: 700,
                    }}
                  >
                    {h2h.totalMatches} Encounters
                  </Typography>

                  <Box sx={{ width: "100%", mb: 5 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mb={1.5}
                      alignItems="flex-end"
                    >
                      <Typography
                        variant="h4"
                        fontWeight={900}
                        color={f1.color}
                      >
                        {h2h[f1.shortName].wins}
                      </Typography>
                      <Chip
                        label={`${h2h.ties} TIES`}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                      <Typography
                        variant="h4"
                        fontWeight={900}
                        color={f2.color}
                      >
                        {h2h[f2.shortName].wins}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (h2h[f1.shortName].wins / (h2h.totalMatches || 1)) * 100
                      }
                      sx={{
                        height: 24,
                        borderRadius: 12,
                        bgcolor: `${f2.color}90`,
                        "& .MuiLinearProgress-bar": { bgcolor: f1.color },
                      }}
                    />
                  </Box>

                  <Divider sx={{ width: "100%", mb: 3 }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: 1 }}
                  >
                    RECENT FORM (LAST 5)
                  </Typography>
                  {h2h.last5Matches && (
                    <FormTimeline matches={h2h.last5Matches} f1={f1} f2={f2} />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 4,
                    bgcolor: `${f2.color}08`,
                    borderRadius: 4,
                    height: "100%",
                    borderTop: `6px solid ${f2.color}`,
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={4}
                    justifyContent="flex-end"
                  >
                    <Typography
                      variant="h3"
                      fontWeight={900}
                      color={f2.color}
                      sx={{ letterSpacing: "-1px" }}
                    >
                      {f2.shortName}
                    </Typography>
                    {f2.logoUrl && (
                      <Avatar
                        src={f2.logoUrl}
                        alt={f2.shortName}
                        sx={{
                          width: 72,
                          height: 72,
                          bgcolor: "white",
                          p: 1,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <StatCard
                        title="Total Titles"
                        value={f2.titles}
                        icon={EmojiEventsIcon}
                        color="#FFD700"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Total Matches"
                        value={f2.lifetimeStats?.totalMatches}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Overall Win %"
                        value={`${f2.lifetimeStats?.winPct}%`}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {causality && (
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="primary.main"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <AccountTreeIcon /> The Toss Blueprint (Decision {"->"}{" "}
                      Win Probability)
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
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight={800}
                              color={f.color}
                              mb={3}
                            >
                              {f.name} Toss Matrix
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={2}
                              flexWrap="wrap"
                            >
                              <FlowBox
                                title={`${t.tossWins}`}
                                subtitle="Tosses Won"
                                color={f.color}
                                isMain
                              />
                              <Box
                                flexGrow={1}
                                display="flex"
                                flexDirection="column"
                                gap={2}
                              >
                                <Box display="flex" alignItems="center" gap={2}>
                                  <FlowBox
                                    title={`${t.chooseBatPct}%`}
                                    subtitle="Choose Bat"
                                    color="#FF9800"
                                  />
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                  >
                                    →
                                  </Typography>
                                  <FlowBox
                                    title={`${t.batWinProb}%`}
                                    subtitle="Win Prob"
                                    color="#4CAF50"
                                  />
                                </Box>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <FlowBox
                                    title={`${t.chooseFieldPct}%`}
                                    subtitle="Choose Field"
                                    color="#2196F3"
                                  />
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                  >
                                    →
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

                <Grid item xs={12} md={5}>
                  <Box mb={2}>
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="secondary.main"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <ExploreIcon /> The Pitch Dictator
                    </Typography>
                  </Box>
                  {causality.venue && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={800}
                        sx={{ letterSpacing: 1, textTransform: "uppercase" }}
                        mb={1}
                      >
                        Most Frequent Battleground
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color="text.primary"
                        mb={4}
                      >
                        {causality.venue.name} ({causality.venue.matches}{" "}
                        matches)
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: "background.default",
                              border: "1px solid",
                              borderColor: "divider",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="h3"
                              fontWeight={900}
                              color="#FF9800"
                            >
                              {causality.venue.batFirstWinProb}%
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="text.secondary"
                              mt={1}
                            >
                              Bat First Win Prob
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: "background.default",
                              border: "1px solid",
                              borderColor: "divider",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="h3"
                              fontWeight={900}
                              color="#2196F3"
                            >
                              {causality.venue.fieldFirstWinProb}%
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="text.secondary"
                              mt={1}
                            >
                              Field First Win Prob
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}
                </Grid>

                <Grid item xs={12} md={7}>
                  <Box mb={2}>
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="error.main"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <AutoGraphIcon /> X-Factor Dependency
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {[f1, f2].map((f) => {
                      const x = causality[f.shortName].xFactor;
                      if (!x) return null;
                      return (
                        <Grid item xs={12} sm={6} key={f.shortName}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 4,
                              border: `2px solid ${f.color}40`,
                              height: "100%",
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={800}
                              color={f.color}
                              sx={{ textTransform: "uppercase" }}
                            >
                              {f.shortName} Anchor
                            </Typography>
                            <Typography variant="h6" fontWeight={900} mb={3}>
                              {x.name}
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={2}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p={1.5}
                                bgcolor="#4CAF5015"
                                borderRadius={2}
                                border="1px solid #4CAF5040"
                              >
                                <Typography variant="body2" fontWeight={700}>
                                  Scores 30+ Runs
                                </Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight={900}
                                  color="#4CAF50"
                                >
                                  {x.bigWinProb}% Win
                                </Typography>
                              </Box>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p={1.5}
                                bgcolor="#F4433615"
                                borderRadius={2}
                                border="1px solid #F4433640"
                              >
                                <Typography variant="body2" fontWeight={700}>
                                  Fails ({"<"}30 Runs)
                                </Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight={900}
                                  color="#F44336"
                                >
                                  {x.failWinProb}% Win
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={4} mb={4}>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ExploreIcon
                    sx={{
                      fontSize: 60,
                      color: "text.secondary",
                      mb: 2,
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="h4" fontWeight={900}>
                    {h2h.tossImpact}%
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    fontWeight={600}
                    mt={1}
                  >
                    Overall Toss Impact
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={800} mb={3}>
                    Home Dominance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography
                        variant="h4"
                        fontWeight={900}
                        color={f1.color}
                      >
                        {h2h.f1HomeWins}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        {f1.shortName} Home Wins
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="h4"
                        fontWeight={900}
                        color={f2.color}
                      >
                        {h2h.f2HomeWins}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        {f2.shortName} Home Wins
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={800} mb={3}>
                    Neutral Venues
                  </Typography>
                  <Typography variant="h3" fontWeight={900}>
                    {h2h.totalMatches - h2h.f1HomeWins - h2h.f2HomeWins}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={600}
                    mt={1}
                  >
                    Matches played at Neutral Venues
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: `2px solid ${f1.color}30`,
                    bgcolor: `${f1.color}05`,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color={f1.color}
                    mb={4}
                    textAlign="center"
                  >
                    {f1.name} Win Profile
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <StatCard
                        title="Bat First Wins"
                        value={h2h[f1.shortName].batFirstWins}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Bat Second Wins"
                        value={h2h[f1.shortName].batSecondWins}
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
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: `2px solid ${f2.color}30`,
                    bgcolor: `${f2.color}05`,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color={f2.color}
                    mb={4}
                    textAlign="center"
                  >
                    {f2.name} Win Profile
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <StatCard
                        title="Bat First Wins"
                        value={h2h[f2.shortName].batFirstWins}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatCard
                        title="Bat Second Wins"
                        value={h2h[f2.shortName].batSecondWins}
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
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Most Runs"
                  data={h2h.topRunScorers}
                  icon={<SportsCricketIcon />}
                  color="#2196F3"
                  renderItem={(item) => item.runs}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Most Wickets"
                  data={h2h.topWicketTakers}
                  icon={<Typography fontWeight={900}>W</Typography>}
                  color="#F44336"
                  renderItem={(item) => item.wickets}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Most PoTM Awards"
                  data={h2h.topPotm}
                  icon={<EmojiEventsIcon />}
                  color="#FFD700"
                  renderItem={(item) => item.awards}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LeaderboardCard
                  title="Highest Scores"
                  data={h2h.highestScores}
                  icon={<StarIcon />}
                  color="#FF9800"
                  renderItem={(item) => `${item.runs} (${item.balls})`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LeaderboardCard
                  title="Best Bowling"
                  data={h2h.bestBowling}
                  icon={<StarIcon />}
                  color="#4CAF50"
                  renderItem={(item) => `${item.wickets}/${item.runsConceded}`}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Highest Strike Rate (min 50r)"
                  data={h2h.topStrikeRates}
                  icon={<ShowChartIcon />}
                  color="#E91E63"
                  renderItem={(item) => item.sr.toFixed(1)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Boundary Dependency (min 100r)"
                  data={h2h.topBoundaryDep}
                  icon={<Typography fontWeight={900}>%</Typography>}
                  color="#FF5722"
                  renderItem={(item) => `${item.boundPct.toFixed(1)}%`}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="The Ironmen (Matches)"
                  data={h2h.topIronmen}
                  icon={<SportsCricketIcon />}
                  color="#607D8B"
                  renderItem={(item) => item.matchesPlayed}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Best Economy (min 8 overs)"
                  data={h2h.topEconomyRates}
                  icon={<SecurityIcon />}
                  color="#009688"
                  renderItem={(item) => item.eco.toFixed(2)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Bowling Strike Rate (min 5w)"
                  data={h2h.topBowlingSr}
                  icon={<Typography fontWeight={900}>W</Typography>}
                  color="#795548"
                  renderItem={(item) => item.bowlSr.toFixed(1)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Dot Ball Masters (min 60b)"
                  data={h2h.topDotBallers}
                  icon={<Typography fontWeight={900}>O</Typography>}
                  color="#9E9E9E"
                  renderItem={(item) => `${item.dotPct.toFixed(1)}%`}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Most Fours"
                  data={h2h.topFourHitters}
                  icon={<Typography fontWeight={900}>4</Typography>}
                  color="#3F51B5"
                  renderItem={(item) => item.fours}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Most Sixes"
                  data={h2h.topSixHitters}
                  icon={<Typography fontWeight={900}>6</Typography>}
                  color="#9C27B0"
                  renderItem={(item) => item.sixes}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <LeaderboardCard
                  title="Fielding Supremacy (Catches)"
                  data={h2h.topFielders}
                  icon={<EmojiEventsIcon />}
                  color="#FFC107"
                  renderItem={(item) => item.catches}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </>
      ) : null}
    </Box>
  );
}

export default FranchiseComparison;
