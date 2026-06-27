import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Chip,
  Fade,
  Slide,
  IconButton,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchAutocomplete from "../components/common/SearchAutocomplete.jsx";

import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScienceIcon from "@mui/icons-material/Science";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import StadiumIcon from "@mui/icons-material/Stadium";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import SwordsIcon from "@mui/icons-material/Hardware";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const ALL_INSIGHTS = [
  {
    icon: "🧠",
    text: "CSK's home advantage (+12%) is the 2nd highest in IPL history.",
  },
  {
    icon: "📈",
    text: "Virat Kohli's 973 runs in the 2016 season remains the highest run aggregate in a single IPL edition.",
  },
  {
    icon: "💰",
    text: "Ruturaj Gaikwad generated 192x value relative to his auction cost for CSK.",
  },
  {
    icon: "⚔️",
    text: "MI vs CSK remains the most intense rivalry with 41 meetings and near-even results.",
  },
  {
    icon: "💥",
    text: "Chris Gayle's 175* against PWI in 2013 remains the highest individual score in T20 cricket.",
  },
  {
    icon: "🎯",
    text: "Amit Mishra holds the record for the most hat-tricks in IPL history with three.",
  },
  {
    icon: "⚡",
    text: "Lasith Malinga's career economy rate of 7.14 is the best among bowlers with over 150 IPL wickets.",
  },
  {
    icon: "🏆",
    text: "Sunil Narine is the only player to win the Most Valuable Player (MVP) award three times.",
  },
  {
    icon: "🚀",
    text: "Yashasvi Jaiswal holds the record for the fastest IPL fifty, reaching it in just 13 balls in 2023.",
  },
  {
    icon: "🔥",
    text: "Andre Russell holds the highest career strike rate in IPL history at over 174.",
  },
  {
    icon: "🌪️",
    text: "Kagiso Rabada reached 100 IPL wickets in the fewest matches (64).",
  },
  {
    icon: "🥇",
    text: "AB de Villiers has won the most 'Player of the Match' awards (25) in IPL history.",
  },
  {
    icon: "🏰",
    text: "Chennai Super Kings have qualified for the playoffs in 12 out of their 14 seasons played.",
  },
  {
    icon: "👑",
    text: "Rohit Sharma has won the IPL trophy six times as a player, the most by any individual.",
  },
  {
    icon: "📊",
    text: "Yuzvendra Chahal became the first bowler to take 200 wickets in the IPL.",
  },
  {
    icon: "🏏",
    text: "Harshal Patel took 32 wickets in 2021, equaling Dwayne Bravo's record for most wickets in a single season.",
  },
  {
    icon: "🧤",
    text: "MS Dhoni holds the record for the most dismissals by a wicketkeeper in IPL history.",
  },
  {
    icon: "🔥",
    text: "The highest successful run chase in IPL history is 262 by Punjab Kings against KKR in 2024.",
  },
  {
    icon: "💸",
    text: "Rajasthan Royals won the inaugural IPL in 2008 with the lowest franchise salary cap spend.",
  },
  {
    icon: "🌟",
    text: "Suresh Raina was the first player to cross 5000 runs in the IPL.",
  },
];

const TRENDING_CARDS = [
  {
    title: "Most Dominant Franchise",
    value: "CSK",
    subtitle: "Dynasty Rating: 96.4",
    badge: "95th percentile",
    color: "#ffb300",
  },
  {
    title: "Greatest Active Batter",
    value: "Virat Kohli",
    subtitle: "2024-2026 Peak",
    badge: "GOAT Rank #1",
    color: "#00e5ff",
  },
  {
    title: "Best Auction Steal",
    value: "Ruturaj Gaikwad",
    subtitle: "₹0.2 Cr → Massive Value Created",
    badge: "192x ROI",
    color: "#00e676",
  },
  {
    title: "Strongest Home Fortress",
    value: "CSK",
    subtitle: "Chepauk Stadium",
    badge: "65% Win Rate",
    color: "#ff1744",
  },
  {
    title: "Most Destructive Finisher",
    value: "Andre Russell",
    subtitle: "Career Strike Rate: 174+",
    badge: "99th percentile",
    color: "#ab47bc",
  },
  {
    title: "Smartest Auction Strategy",
    value: "Rajasthan Royals",
    subtitle: "2008 Inaugural Season",
    badge: "Lowest Spend",
    color: "#29b6f6",
  },
  {
    title: "Highest Peak Bowler",
    value: "Lasith Malinga",
    subtitle: "Best Economy for 150+ Wickets",
    badge: "Legend Rank",
    color: "#ffca28",
  },
  {
    title: "Fastest Rising Star",
    value: "Yashasvi Jaiswal",
    subtitle: "13-Ball Fifty Record",
    badge: "Generational",
    color: "#ef5350",
  },
];

const MODULES = [
  {
    title: "Player Intelligence",
    icon: <PersonIcon sx={{ fontSize: 40 }} />,
    path: "/analytics/player-intelligence",
    desc: "Deep dive into player peaks, value, and DNA.",
    color: "#00e5ff",
  },
  {
    title: "Franchise Intelligence",
    icon: <GroupIcon sx={{ fontSize: 40 }} />,
    path: "/analytics/franchise-intelligence",
    desc: "Analyze franchise dynasty ratings and ROI.",
    color: "#ffb300",
  },
  {
    title: "Rivalry Lab",
    icon: <SwordsIcon sx={{ fontSize: 40 }} />,
    path: "/analytics/head-to-head",
    desc: "Head-to-head franchise and player battles.",
    color: "#ff1744",
  },
  {
    title: "Venue Mastery",
    icon: <StadiumIcon sx={{ fontSize: 40 }} />,
    path: "/analytics/venue-mastery",
    desc: "Discover pitch tendencies and home fortresses.",
    color: "#00e676",
  },
  {
    title: "Auction Intelligence",
    icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
    path: "/players",
    desc: "Track spending efficiency and historic steals.",
    color: "#b388ff",
  },
  {
    title: "Legacy Leaderboards",
    icon: <FormatListNumberedIcon sx={{ fontSize: 40 }} />,
    path: "/rankings/leaderboards",
    desc: "The ultimate GOAT rankings across eras.",
    color: "#ff8a65",
  },
];

const FACTS = [
  "Did you know? MS Dhoni has more matches for CSK than any player in franchise history.",
  "Did you know? RCB's championship breakthrough came after 17 seasons.",
  "Did you know? Chepauk produces one of the strongest spin advantages in IPL history.",
  "Did you know? Virat Kohli is the only player to score over 900 runs in a single IPL season (973).",
  "Did you know? Amit Mishra has three IPL hat-tricks, the most by any bowler.",
  "Did you know? Sunil Narine is the only player to win MVP three times.",
  "Did you know? Chris Gayle's 175* featured a record 17 sixes in one innings.",
  "Did you know? Yashasvi Jaiswal holds the record for the fastest IPL fifty, off just 13 balls.",
  "Did you know? Lasith Malinga was the first bowler to take 150 and 170 wickets in the IPL.",
  "Did you know? AB de Villiers has won the 'Player of the Match' award 25 times.",
  "Did you know? Bhuvneshwar Kumar won the Purple Cap in two consecutive seasons (2016, 2017).",
  "Did you know? The lowest total successfully defended in IPL history is 116 by CSK against KXIP in 2009.",
  "Did you know? Piyush Chawla has bowled the most dot balls in IPL history.",
];

const AutoScrollCarousel = ({ children, speed = 0.5 }) => {
  const scrollRef = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(true);

    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  React.useEffect(() => {
    if (isMobile) return;
    let animationFrameId;
    const scroll = () => {
      if (scrollRef.current && !isHovered && !isDragging) {
        scrollRef.current.scrollLeft += speed;
        const maxScroll =
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        if (scrollRef.current.scrollLeft >= maxScroll - 1) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging, speed, isMobile]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleMouseDown = (e) => {
    if (isMobile) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsDragging(false);
    setIsHovered(false);
  };
  const handleMouseUp = () => {
    if (isMobile) return;
    setIsDragging(false);
  };
  const handleMouseMove = (e) => {
    if (!isDragging || isMobile) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleArrowClick = (direction) => {
    if (scrollRef.current) {
      const cardWidth = isMobile ? 260 : 300;
      const scrollAmount = cardWidth + 24;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%", px: { xs: 1, sm: 0 } }}>
      {isMobile && showLeftArrow && (
        <IconButton
          onClick={() => handleArrowClick("left")}
          sx={{
            position: "absolute",
            left: { xs: 0, sm: -20 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: "rgba(255, 23, 68, 0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: "#ff1744",
              borderColor: "#ffffff",
              color: "#ffffff",
              transform: "translateY(-50%) scale(1.1)",
            },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      )}

      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          cursor: isMobile ? "default" : isDragging ? "grabbing" : "grab",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          userSelect: "none",
          py: 2,
          px: { xs: 1, sm: 0 },
          scrollSnapType: { xs: "x mandatory", sm: "none" },
          scrollBehavior: "smooth",
        }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              sx: {
                ...child.props.sx,
                scrollSnapAlign: { xs: "center", sm: "none" },
                scrollSnapStop: { xs: "always", sm: "normal" },
              },
            });
          }
          return child;
        })}
      </Box>

      {isMobile && showRightArrow && (
        <IconButton
          onClick={() => handleArrowClick("right")}
          sx={{
            position: "absolute",
            right: { xs: 0, sm: -20 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: "rgba(255, 23, 68, 0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: "#ff1744",
              borderColor: "#ffffff",
              color: "#ffffff",
              transform: "translateY(-50%) scale(1.1)",
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}
    </Box>
  );
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [factIndex, setFactIndex] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [shuffledInsights, setShuffledInsights] = useState([]);
  const [slideIn, setSlideIn] = useState(true);

  useEffect(() => {
    setShuffledInsights(shuffleArray(ALL_INSIGHTS));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (shuffledInsights.length === 0) return;
    const interval = setInterval(() => {
      setSlideIn(false);
      setTimeout(() => {
        setInsightIndex((prev) => (prev + 4) % shuffledInsights.length);
        setSlideIn(true);
      }, 500);
    }, 7000);
    return () => clearInterval(interval);
  }, [shuffledInsights]);

  const currentInsights =
    shuffledInsights.length > 0
      ? [
          shuffledInsights[insightIndex % shuffledInsights.length],
          shuffledInsights[(insightIndex + 1) % shuffledInsights.length],
          shuffledInsights[(insightIndex + 2) % shuffledInsights.length],
          shuffledInsights[(insightIndex + 3) % shuffledInsights.length],
        ]
      : [];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        pb: 10,
      }}
    >
      <Box
        sx={{
          pt: { xs: 3, md: 5 },
          pb: { xs: 3, md: 5 },
          px: 2,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 100%), url(https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{ position: "relative", zIndex: 1, maxWidth: 800, mx: "auto" }}
        >
          <Typography
            variant="h1"
            sx={{
              mb: 0.5,
              fontSize: "clamp(1.8rem, 5vw + 0.5rem, 4.5rem)",
              color: "#fff",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            IPLPulse
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 0,
              fontWeight: 400,
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            Advanced IPL Performance Metrics & Franchise Intelligence
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, mt: 2.5 }}>
        <Box sx={{ mb: 4.5, overflow: "hidden" }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: { xs: 1.2, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              whiteSpace: "nowrap",
            }}
          >
            <TipsAndUpdatesIcon fontSize="small" color="primary" /> Discovery
            Feed
          </Typography>
          <AutoScrollCarousel speed={0.5}>
            {[...ALL_INSIGHTS, ...ALL_INSIGHTS].map(
              (insight, idx) => (
                <Card
                  key={idx}
                  sx={{
                    width: { xs: 260, sm: 300 },
                    flexShrink: 0,
                    bgcolor: "rgba(0, 229, 255, 0.02)",
                    borderColor: "rgba(0, 229, 255, 0.1)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "rgba(0, 229, 255, 0.3)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ mb: 1, textAlign: "center" }}
                    >
                      {insight?.icon}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6, textAlign: "center" }}
                    >
                      {insight?.text}
                    </Typography>
                  </CardContent>
                </Card>
              ),
            )}
          </AutoScrollCarousel>
        </Box>

        <Box sx={{ mb: 4.5 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: { xs: 1.2, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              whiteSpace: "nowrap",
            }}
          >
            <TrendingUpIcon fontSize="small" color="secondary" /> Trending
            Intelligence
          </Typography>
          <AutoScrollCarousel speed={0.5}>
            {[...TRENDING_CARDS, ...TRENDING_CARDS].map(
              (card, idx) => (
                <Card
                  key={idx}
                  sx={{
                    width: { xs: 240, sm: 280 },
                    flexShrink: 0,
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    borderTop: `2px solid ${card.color}`,
                    "&:hover": { boxShadow: `0 8px 24px ${card.color}20` },
                  }}
                >
                  <CardContent sx={{ pt: 4 }}>
                    <Chip
                      label={card.badge}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        bgcolor: `${card.color}20`,
                        color: card.color,
                        fontWeight: 700,
                        borderRadius: "6px",
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mb: 1,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, mb: 0.5, color: card.color }}
                    >
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              ),
            )}
          </AutoScrollCarousel>
        </Box>

        <Box sx={{ mb: 4.5 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: { xs: 1.2, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              whiteSpace: "nowrap",
            }}
          >
            <ScienceIcon fontSize="small" sx={{ color: "#b388ff" }} /> Explore
            Intelligence Modules
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {MODULES.map((mod, idx) => (
              <Card
                key={idx}
                sx={{
                  height: "100%",
                  "&:hover": {
                    borderColor: mod.color,
                    "& .icon-box": {
                      color: mod.color,
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(mod.path)}
                  sx={{ height: "100%", p: 2 }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Box
                      className="icon-box"
                      sx={{
                        mb: 2,
                        color: "text.secondary",
                        transition: "all 0.3s",
                      }}
                    >
                      {mod.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                      {mod.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, flexGrow: 1 }}
                    >
                      {mod.desc}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Card
            sx={{
              bgcolor: "rgba(0, 229, 255, 0.03)",
              borderColor: "rgba(0, 229, 255, 0.2)",
              width: "100%",
              maxWidth: { xs: "100%", md: 650, lg: 750 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: { xs: 3, sm: 4 },
              textAlign: "center",
            }}
          >
            <CardContent
              sx={{ width: "100%", p: 0, "&:last-child": { pb: 0 } }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    color: "#000",
                    width: 40,
                    height: 40,
                  }}
                >
                  <EmojiObjectsIcon />
                </Avatar>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ fontWeight: 700 }}
                >
                  Did You Know?
                </Typography>
              </Box>
              <Box
                sx={{
                  minHeight: { xs: 80, sm: 60 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  px: { xs: 1, sm: 3 },
                }}
              >
                <Fade in={true} key={factIndex} timeout={800}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1.1rem" },
                      fontStyle: "italic",
                      lineHeight: 1.6,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    "{FACTS[factIndex]}"
                  </Typography>
                </Fade>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
