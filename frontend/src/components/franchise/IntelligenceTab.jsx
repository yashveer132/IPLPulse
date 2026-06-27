import {
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Avatar,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import CastleIcon from "@mui/icons-material/Castle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import StarIcon from "@mui/icons-material/Star";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  useFranchiseIntelligence,
  useFranchiseLegends,
  useFranchiseRivalries,
  useHomeFortress,
  useAuctionIntelligence,
} from "../../hooks/useFranchise.js";
import { CardSkeleton } from "../common/LoadingSkeleton.jsx";

const ConfidenceTooltip = ({ confidence, placement = "top" }) => {
  if (!confidence) return null;
  return (
    <Tooltip
      placement={placement}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "#0f172a",
            border: "1px solid #1e293b",
            p: 1.5,
            minWidth: 220,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          },
        },
      }}
      title={
        <Box>
          <Typography
            variant="subtitle2"
            color="success.main"
            fontWeight={900}
            mb={1}
          >
            {confidence.score}% Confidence
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={800}
            display="block"
            mb={0.5}
          >
            BASED ON
          </Typography>
          {confidence.reasons?.map((r, i) => (
            <Typography
              key={i}
              variant="caption"
              display="block"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 0.5,
                mt: 0.5,
                color: "#e2e8f0",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#4ade80" }}>✓</span> {r}
            </Typography>
          ))}
        </Box>
      }
    >
      <Chip
        size="small"
        variant="outlined"
        color="success"
        label={`${confidence.score}% Confidence`}
        sx={{ cursor: "help", fontWeight: 700 }}
      />
    </Tooltip>
  );
};

const RoleRow = ({ title, players, color }) => {
  if (!players || players.length === 0) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        fontWeight={800}
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: 1 }}
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
        {players.map((p) => (
          <Box
            key={p.player.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "background.paper",
              px: 2,
              py: 1,
              borderRadius: 2,
              border: `1px solid ${color}40`,
              transition: "all 0.2s",
              "&:hover": { bgcolor: `${color}20`, borderColor: color },
            }}
          >
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: color,
                fontSize: "0.8rem",
              }}
            >
              {p.player.name.charAt(0)}
            </Avatar>
            <Typography variant="body2" fontWeight={800}>
              {p.player.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default function IntelligenceTab({ id, franchise }) {
  const { data: intelligenceRes, isLoading: loadingInt } =
    useFranchiseIntelligence(id);
  const { data: legendsRes, isLoading: loadingLeg } = useFranchiseLegends(id);
  const { data: rivalriesRes, isLoading: loadingRiv } =
    useFranchiseRivalries(id);
  const { data: fortressRes, isLoading: loadingFort } = useHomeFortress(id);
  const { data: auctionRes, isLoading: loadingAuc } =
    useAuctionIntelligence(id);

  if (loadingInt || loadingLeg || loadingRiv || loadingFort || loadingAuc)
    return <CardSkeleton />;

  const intelligence = intelligenceRes?.data || intelligenceRes;
  const legends = legendsRes?.data || legendsRes;
  const rivalries = rivalriesRes?.data || rivalriesRes;
  const fortress = fortressRes?.data || fortressRes;
  const auctions = auctionRes?.data || auctionRes;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>

      <Grid container spacing={4} justifyContent="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <Typography variant="h5" fontWeight={900} align="center" mb={6}>
              What Makes Them Unique?
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {intelligence?.uniqueTraits?.map((trait, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                >
                  <StarIcon sx={{ color: "#f59e0b", fontSize: 20, mt: 0.5 }} />
                  <Typography variant="body1" fontWeight={600} lineHeight={1.6}>
                    {trait}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                mb: 5,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={900}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <EmojiEventsIcon sx={{ color: franchise.color }} /> Era
                Composition
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                pl: 2,
                borderLeft: `2px solid ${franchise.color}40`,
              }}
            >
              {intelligence?.eraAnalysis?.map((era) => {
                const isPeak =
                  Math.max(...intelligence.eraAnalysis.map((e) => e.score)) ===
                  era.score;
                return (
                  <Box
                    key={era.name}
                    sx={{
                      position: "relative",
                      pl: 3,
                      bgcolor: isPeak
                        ? "rgba(255,255,255,0.03)"
                        : "transparent",
                      p: isPeak ? 2 : 0,
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: isPeak ? -27 : -21,
                        top: isPeak ? 12 : 10,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: isPeak ? "#f59e0b" : franchise.color,
                        border: "3px solid #0f172a",
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color={isPeak ? "#f59e0b" : franchise.color}
                    >
                      {era.period} {isPeak && "★ PEAK ERA"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight={900}>
                        {era.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        color={isPeak ? "#f59e0b" : "text.disabled"}
                      >
                        {era.score}/100
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}
                    >
                      <Chip
                        size="small"
                        icon={<EmojiEventsIcon />}
                        label={`${era.titles} Titles`}
                        color={era.titles > 0 ? "secondary" : "default"}
                      />
                      <Chip
                        size="small"
                        label={`Win Rate: ${era.winRate}%`}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      <span style={{ fontWeight: 800 }}>Key Players:</span>{" "}
                      {era.core.replace(/, /g, " • ")}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" fontWeight={900} mt={2} align="center">
        Franchise Mount Rushmore
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {legends?.mountRushmore?.map((goat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={goat.player.id}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: "center",
                background: `linear-gradient(180deg, ${franchise.color}20 0%, #0f172a 100%)`,
                border: `1px solid ${franchise.color}30`,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  bgcolor: franchise.color,
                  fontSize: "2rem",
                  border: "3px solid #fff",
                }}
              >
                {goat.player.name.charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight={900}>
                {goat.player.name}
              </Typography>
              <Typography
                variant="caption"
                color="primary"
                fontWeight={800}
                display="block"
                mt={0.5}
              >
                {goat.legacyText}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={700}
                display="block"
                mt={1}
                sx={{ minHeight: "40px" }}
              >
                {goat.achievementText}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} sx={{ mt: 1 }} justifyContent="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              borderRadius: 4,
              background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
              border: "1px solid rgba(255,255,255,0.05)",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight={800} color="white">
                All-Time Greatest XI
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <RoleRow
                title="Openers"
                players={legends?.greatestXI?.openers}
                color={franchise.color}
              />
              <RoleRow
                title="Batters"
                players={legends?.greatestXI?.batters}
                color={franchise.color}
              />
              <RoleRow
                title="Wicket Keeper"
                players={legends?.greatestXI?.wicketKeeper}
                color={franchise.color}
              />
              <RoleRow
                title="All-Rounders"
                players={legends?.greatestXI?.allRounders}
                color={franchise.color}
              />
              <RoleRow
                title="Bowlers"
                players={legends?.greatestXI?.bowlers}
                color={franchise.color}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={800} align="center" mb={5}>
              Career GOAT Rankings
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {legends?.goatRankings?.map((goat, i) => (
                <Box
                  key={goat.player.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderColor: "primary.main",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor:
                        i === 0
                          ? "#f59e0b"
                          : i === 1
                            ? "#94a3b8"
                            : i === 2
                              ? "#b45309"
                              : "rgba(255,255,255,0.1)",
                      color: i < 3 ? "#000" : "#fff",
                      fontWeight: 900,
                      fontSize: "1.2rem",
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight={800}>
                      {goat.player.name}
                    </Typography>
                    <Tooltip
                      title={`Longevity: ${goat.breakdown?.longevity} | Perf: ${goat.breakdown?.performance} | Peak: ${goat.breakdown?.peak} | Impact: ${goat.breakdown?.impact}`}
                      placement="top"
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          borderBottom: "1px dotted",
                          cursor: "help",
                          display: "inline-block",
                        }}
                      >
                        Score: {Math.round(goat.franchiseScore || 0)} / 100
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          mt: 2,
          mb: 1,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={900}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <MonetizationOnIcon sx={{ color: "#10b981" }} /> Auction Intelligence
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ mt: 0.5, letterSpacing: 1 }}
        >
          (Auction data considered from 2013-2022)
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              borderRadius: 3,
              borderTop: "4px solid #10b981",
              bgcolor: "rgba(16, 185, 129, 0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={800} align="center" mb={3}>
              Best Value Signings
            </Typography>
            {auctions?.bestPurchases?.length > 0 ? (
              auctions.bestPurchases.map((p) => (
                <Box
                  key={p.player.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={800}>
                        {p.player.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        ₹{p.priceInCr} Cr Cost
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        fontWeight={700}
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {p.runs} Runs{" "}
                        {p.wickets > 0 && `• ${p.wickets} Wickets`} •{" "}
                        {p.matches} Matches
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography
                        variant="body1"
                        fontWeight={900}
                        color="#10b981"
                      >
                        {p.valueScore} / 100
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Value Score
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    color="primary"
                    fontWeight={700}
                    display="block"
                    mt={1}
                  >
                    {p.valueText}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No data.</Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              borderRadius: 3,
              borderTop: "4px solid #ef4444",
              bgcolor: "rgba(239, 68, 68, 0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={800} align="center" mb={3}>
              Lowest Value Signings
            </Typography>
            {auctions?.worstPurchases?.length > 0 ? (
              auctions.worstPurchases.map((p) => (
                <Box
                  key={p.player.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={800}>
                        {p.player.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        ₹{p.priceInCr} Cr Cost
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        fontWeight={700}
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {p.runs} Runs{" "}
                        {p.wickets > 0 && `• ${p.wickets} Wickets`} •{" "}
                        {p.matches} Matches
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography
                        variant="body1"
                        fontWeight={900}
                        color="#ef4444"
                      >
                        {p.valueScore} / 100
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Value Score
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    color="error"
                    fontWeight={700}
                    display="block"
                    mt={1}
                  >
                    {p.valueText}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No data.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight={900} mt={2} align="center">
        Contextual Analytics
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, height: "100%" }}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 3,
              }}
            >
              <ShowChartIcon color="error" /> Greatest Rivalry
            </Typography>
            {rivalries && rivalries.length > 0 ? (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 3,
                    mb: 4,
                  }}
                >
                  <Typography variant="h4" fontWeight={900} align="center">
                    {franchise.shortName}{" "}
                    <span style={{ color: "#ef4444" }}>VS</span>{" "}
                    {rivalries[0].opponentFullName}
                  </Typography>
                </Box>
                <Grid container spacing={2} align="center">
                  <Grid size={4}>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      color={franchise.color}
                    >
                      {rivalries[0].wins}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                    >
                      WINS
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="h4" fontWeight={900}>
                      {rivalries[0].matches}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                    >
                      MATCHES
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      color="error.main"
                    >
                      {rivalries[0].losses}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                    >
                      LOSSES
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No match history available.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <CastleIcon color="success" /> Home Fortress
              </Typography>
            </Box>
            {fortress ? (
              <Box align="center">
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="text.secondary"
                  mb={1}
                >
                  {fortress.fortressName}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="primary.main"
                  display="block"
                  align="center"
                  mb={4}
                >
                  Rank #{fortress.rank} of 10 Franchises
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={800}>
                    Home Win Rate
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={900}
                    color="success.main"
                  >
                    {Math.round(fortress.homeWinRate)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={fortress.homeWinRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 3,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": { bgcolor: "success.main" },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={800}>
                    League Average
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={900}
                    color="text.secondary"
                  >
                    {Math.round(fortress.leagueAverage)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={fortress.leagueAverage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 4,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": { bgcolor: "text.disabled" },
                  }}
                />

                <Box
                  sx={{
                    p: 2,
                    bgcolor:
                      fortress.advantage > 0 ? "success.dark" : "error.dark",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  <Typography variant="body1" fontWeight={800}>
                    {fortress.advantage > 0 ? "+" : ""}
                    {Math.round(fortress.advantage)}% Home Advantage
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No fortress data available.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
