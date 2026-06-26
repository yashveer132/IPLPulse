import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemButton,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useDynamicRecord } from "../hooks/useRecords.js";
import PageHeader from "../components/common/PageHeader.jsx";

const RECORDS_CONFIG = [
  {
    categoryId: "batting-career",
    title: "🏏 Career Batting",
    records: [
      {
        id: "career-runs",
        title: "Most Career Runs",
        desc: "The absolute run machines of IPL.",
        icon: "👑",
      },
      {
        id: "career-100s",
        title: "Most Hundreds",
        desc: "Triple digit milestones.",
        icon: "💯",
      },
      {
        id: "career-50s",
        title: "Most Fifties",
        desc: "Consistent half-centuries.",
        icon: "🏏",
      },
      {
        id: "career-sixes",
        title: "Most Career Sixes",
        desc: "Sending the ball into orbit.",
        icon: "🚀",
      },
      {
        id: "career-fours",
        title: "Most Career Fours",
        desc: "Finding the gaps perfectly.",
        icon: "🎯",
      },
      {
        id: "career-strike-rate",
        title: "Highest Strike Rate",
        desc: "Min 500 balls faced.",
        icon: "⚡",
      },
      {
        id: "career-average",
        title: "Highest Career Average",
        desc: "Min 30 innings batted.",
        icon: "📈",
      },
    ],
  },
  {
    categoryId: "batting-consistency",
    title: "🛡️ Consistency",
    records: [
      {
        id: "consecutive-50s",
        title: "Most Consecutive 50+ Scores",
        desc: "Unbroken half-century streaks.",
        icon: "🔥",
      },
      {
        id: "consecutive-30s",
        title: "Most Consecutive 30+ Scores",
        desc: "Reliable starts.",
        icon: "🏏",
      },
      {
        id: "seasons-500",
        title: "Most Seasons with 500+ Runs",
        desc: "Year after year dominance.",
        icon: "⭐",
      },
      {
        id: "orange-caps",
        title: "Most Orange Caps",
        desc: "Highest run-getters of the season.",
        icon: "🧢",
      },
    ],
  },
  {
    categoryId: "batting-innings",
    title: "🏏 Innings Batting",
    records: [
      {
        id: "highest-score",
        title: "Highest Individual Score",
        desc: "The greatest single knocks.",
        icon: "🔥",
      },
      {
        id: "fastest-50",
        title: "Fastest 50+ Knocks",
        desc: "Highest Strike Rate (min 50 runs).",
        icon: "🚀",
      },
      {
        id: "fastest-100",
        title: "Fastest 100+ Knocks",
        desc: "Highest Strike Rate (min 100 runs).",
        icon: "💯",
      },
      {
        id: "most-sixes-innings",
        title: "Most Sixes in an Innings",
        desc: "Utter destruction.",
        icon: "🎇",
      },
      {
        id: "most-boundaries-innings",
        title: "Most Boundaries in an Innings",
        desc: "Relentless assault.",
        icon: "⚔️",
      },
    ],
  },
  {
    categoryId: "power-hitting",
    title: "⚡ Power-Hitting",
    records: [
      {
        id: "boundary-runs",
        title: "Most Runs in Boundaries",
        desc: "Total career runs strictly in 4s and 6s.",
        icon: "🎆",
      },
      {
        id: "sixes-per-innings",
        title: "Most Sixes per Innings",
        desc: "Highest average sixes per match (min 30 inns).",
        icon: "🛸",
      },
      {
        id: "six-frequency",
        title: "Six-Hitting Frequency",
        desc: "Most sixes per 100 balls faced.",
        icon: "⚾",
      },
      {
        id: "boundary-percentage",
        title: "Boundary Addiction",
        desc: "Highest % of runs in boundaries.",
        icon: "🤯",
      },
      {
        id: "death-runs",
        title: "Most Death Over Runs",
        desc: "Overs 16-20 total runs.",
        icon: "☠️",
      },
      {
        id: "death-sr",
        title: "Highest Death SR",
        desc: "Striking in the final overs.",
        icon: "📈",
      },
      {
        id: "finisher-chases",
        title: "Most Successful Chases",
        desc: "Not-out in a successful run chase.",
        icon: "👑",
      },
    ],
  },
  {
    categoryId: "bowling-career",
    title: "🎯 Bowling Mastery",
    records: [
      {
        id: "career-wickets",
        title: "Most Career Wickets",
        desc: "The deadliest bowlers in history.",
        icon: "🏹",
      },
      {
        id: "best-figures",
        title: "Best Bowling Figures",
        desc: "Greatest individual spells.",
        icon: "🪄",
      },
      {
        id: "career-dot-balls",
        title: "Most Dot Balls",
        desc: "Creating immense pressure.",
        icon: "🛑",
      },
      {
        id: "career-maidens",
        title: "Most Maidens",
        desc: "Perfect scoreless overs.",
        icon: "🔒",
      },
      {
        id: "career-5w",
        title: "Most 5-Wicket Hauls",
        desc: "Taking half the team down.",
        icon: "🖐️",
      },
      {
        id: "powerplay-wickets",
        title: "Most Powerplay Wickets",
        desc: "Striking with the new ball.",
        icon: "🌪️",
      },
    ],
  },
  {
    categoryId: "venue-records",
    title: "🏟️ Venue Records",
    records: [
      {
        id: "venue-runs",
        title: "Highest Run Scorer at Venue",
        desc: "Masters of their home ground.",
        icon: "🏰",
      },
      {
        id: "venue-wickets",
        title: "Most Wickets at Venue",
        desc: "Deadliest bowlers at a single ground.",
        icon: "🎯",
      },
      {
        id: "venue-sr",
        title: "Highest SR at Venue",
        desc: "Explosive batting at specific stadiums (min 200 balls).",
        icon: "⚡",
      },
      {
        id: "venue-sixes",
        title: "Most Sixes at Venue",
        desc: "Clearing the ropes repeatedly.",
        icon: "🎇",
      },
    ],
  },
  {
    categoryId: "fielding",
    title: "🧤 Fielding Records",
    records: [
      {
        id: "career-catches",
        title: "Most Catches",
        desc: "Safest hands in the tournament.",
        icon: "👐",
      },
      {
        id: "career-stumpings",
        title: "Most Stumpings",
        desc: "Lightning fast behind the stumps.",
        icon: "⚡",
      },
      {
        id: "career-runouts",
        title: "Most Run Outs",
        desc: "Bullseye hits.",
        icon: "🎯",
      },
    ],
  },
  {
    categoryId: "unique",
    title: "🧠 Unique & Crazy Records",
    records: [
      {
        id: "silent-assassin",
        title: "Silent Assassin",
        desc: "Most runs scored with fewest boundaries.",
        icon: "🥷",
      },
      {
        id: "one-man-army",
        title: "One-Man Army",
        desc: "Highest % of team runs in a season.",
        icon: "🛡️",
      },
      {
        id: "nervous-90s",
        title: "Nervous 90s",
        desc: "Most times dismissed in the 90s.",
        icon: "💔",
      },
      {
        id: "dot-ball-survivor",
        title: "Dot Ball Survivor",
        desc: "Most runs despite highest dot-ball percentage.",
        icon: "🐢",
      },
      {
        id: "runs-without-cap",
        title: "Most Runs Without Orange Cap",
        desc: "Consistent excellence, but no cap.",
        icon: "🧢",
      },
      {
        id: "superstar-ducks",
        title: "Most Ducks by a Superstar",
        desc: "Zeros for players with 2000+ career runs.",
        icon: "🦆",
      },
      {
        id: "losing-runs",
        title: "Most Runs in Losing Causes",
        desc: "Heartbreak knocks.",
        icon: "💔",
      },
      {
        id: "losing-wickets",
        title: "Most Wickets in Losing Causes",
        desc: "Lone warriors with the ball.",
        icon: "🗡️",
      },
      {
        id: "runs-before-100",
        title: "Most Runs Before First 100",
        desc: "The longest wait for a century.",
        icon: "⏳",
      },
    ],
  },
];

function RecordModal({ open, onClose, categoryId, record }) {
  const navigate = useNavigate();
  const { data: recordData, isLoading } = useDynamicRecord(
    open ? categoryId : null,
    open ? record?.id : null,
  );

  if (!record) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ textAlign: "center" }}
          >
            {record.icon} {record.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ opacity: 0.8, textAlign: "center" }}
          >
            {record.desc}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress />
          </Box>
        ) : !recordData || recordData.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No data found or record calculation not implemented yet.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {recordData.map((item, index) => (
              <ListItem key={item.player?.id || index} disablePadding divider>
                <ListItemButton
                  onClick={() => navigate(`/players/${item.player?.id}`)}
                  sx={{ py: 2, "&:hover": { bgcolor: "action.hover" } }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          index === 0
                            ? "#f1c40f"
                            : index === 1
                              ? "#bdc3c7"
                              : index === 2
                                ? "#cd7f32"
                                : "grey.200",
                        color: index < 3 ? "black" : "text.primary",
                        width: 36,
                        height: 36,
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={800}>
                        {item.player?.name}
                      </Typography>
                    }
                    secondary={item.context || ""}
                  />
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="primary.main"
                    >
                      {item.value}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Leaderboards() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleOpenRecord = (categoryId, record) => {
    setSelectedCategory(categoryId);
    setSelectedRecord(record);
  };

  const handleClose = () => {
    setSelectedRecord(null);
  };

  const activeCategory = RECORDS_CONFIG[activeTab];

  return (
    <Box sx={{ mx: "auto", p: 2 }}>
      <PageHeader
        title="IPL Records Explorer"
        subtitle="Dive deep into the most comprehensive collection of IPL records ever assembled."
      />

      <Paper sx={{ mb: 4, borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          centered={false}
          sx={{
            "& .MuiTab-root": { fontWeight: 700, fontSize: "1rem", py: 2 },
            "& .MuiTabs-flexContainer": { justifyContent: "center" },
          }}
        >
          {RECORDS_CONFIG.map((cat, idx) => (
            <Tab key={cat.categoryId} label={cat.title} value={idx} />
          ))}
        </Tabs>
      </Paper>

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
        {activeCategory.records.map((record) => (
          <Paper
            key={record.id}
            onClick={() => handleOpenRecord(activeCategory.categoryId, record)}
            sx={{
              p: 3,
              borderRadius: 4,
              cursor: "pointer",
              height: "100%",
              transition: "all 0.2s",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
                borderColor: "primary.main",
                bgcolor: "rgba(0,0,0,0.02)",
              },
            }}
          >
            <Typography variant="h3" mb={2}>
              {record.icon}
            </Typography>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              {record.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {record.desc}
            </Typography>
          </Paper>
        ))}
      </Box>

      <RecordModal
        open={Boolean(selectedRecord)}
        onClose={handleClose}
        categoryId={selectedCategory}
        record={selectedRecord}
      />
    </Box>
  );
}

export default Leaderboards;
