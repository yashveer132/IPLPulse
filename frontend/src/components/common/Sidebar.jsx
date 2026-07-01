import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InsightsIcon from "@mui/icons-material/Insights";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import { FRANCHISES } from "../../constants/index.js";

const DRAWER_WIDTH = 220;

const NAV_SECTIONS = [
  {
    title: "Core",
    items: [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
      { text: "Auction Explorer", icon: <PointOfSaleIcon />, path: "/players" },
    ],
  },
  {
    title: "Intelligence Hub",
    items: [
      {
        text: "Historical Archive",
        icon: <HistoryEduIcon />,
        path: "/flashpoints",
      },
      {
        text: "Season Intelligence",
        icon: <ManageSearchIcon />,
        path: "/seasons/intelligence",
      },
      {
        text: "Player Intelligence",
        icon: <PersonSearchIcon />,
        path: "/analytics/player-intelligence",
      },
      {
        text: "Player Value Rankings",
        icon: <InsightsIcon />,
        path: "/analytics/player-value",
      },
    ],
  },
  {
    title: "Advanced Analytics",
    items: [
      {
        text: "Head-to-Head Matchups",
        icon: <CompareArrowsIcon />,
        path: "/analytics/head-to-head",
      },
      {
        text: "Venue Mastery",
        icon: <EmojiEventsIcon />,
        path: "/analytics/venue-mastery",
      },
      {
        text: "Milestone Explorer",
        icon: <AutorenewIcon />,
        path: "/analytics/milestone-explorer",
      },
      {
        text: "Compare Teams",
        icon: <GroupIcon />,
        path: "/franchises/compare",
      },
    ],
  },
  {
    title: "Records & History",
    items: [
      // {
      //   text: "Best Purchases",
      //   icon: <SportsCricketIcon />,
      //   path: "/rankings/best-purchases",
      // },
      {
        text: "All-Time Records",
        icon: <EmojiEventsIcon />,
        path: "/rankings/leaderboards",
      },
    ],
  },
];

const getHeaderCardStyles = (title) => {
  const styles = {
    Core: {
      bg: "rgba(0, 229, 255, 0.05)",
      color: "#00e5ff",
      border: "1px solid rgba(0, 229, 255, 0.15)",
    },
    "Intelligence Hub": {
      bg: "rgba(168, 85, 247, 0.05)",
      color: "#c084fc",
      border: "1px solid rgba(168, 85, 247, 0.15)",
    },
    "Advanced Analytics": {
      bg: "rgba(16, 185, 129, 0.05)",
      color: "#10b981",
      border: "1px solid rgba(16, 185, 129, 0.15)",
    },
    "Records & History": {
      bg: "rgba(245, 158, 11, 0.05)",
      color: "#f59e0b",
      border: "1px solid rgba(245, 158, 11, 0.15)",
    },
    Teams: {
      bg: "rgba(244, 63, 94, 0.05)",
      color: "#fb7185",
      border: "1px solid rgba(244, 63, 94, 0.15)",
    },
  };
  return (
    styles[title] || {
      bg: "rgba(255,255,255,0.05)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.1)",
    }
  );
};

function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const collapsed = false;
  const location = useLocation();
  const navigate = useNavigate();

  const width = DRAWER_WIDTH;

  const prefetchPage = (path) => {
    if (path === "/") {
      import("../../pages/Dashboard.jsx");
    } else if (path === "/players") {
      import("../../pages/AuctionExplorer.jsx");
    } else if (path === "/flashpoints") {
      import("../../pages/Flashpoints.jsx");
    } else if (path === "/seasons/intelligence") {
      import("../../pages/SeasonIntelligence.jsx");
    } else if (path === "/analytics/player-intelligence") {
      import("../../pages/PlayerIntelligence.jsx");
    } else if (path === "/analytics/player-value") {
      import("../../pages/PlayerValueRankings.jsx");
    } else if (path === "/analytics/head-to-head") {
      import("../../pages/HeadToHeadMatchups.jsx");
    } else if (path === "/analytics/venue-mastery") {
      import("../../pages/VenueMastery.jsx");
    } else if (path === "/analytics/milestone-explorer") {
      import("../../pages/MilestoneExplorer.jsx");
    } else if (path === "/franchises/compare") {
      import("../../pages/FranchiseComparison.jsx");
    } else if (path === "/rankings/leaderboards") {
      import("../../pages/Leaderboards.jsx");
    } else if (path.startsWith("/franchises/")) {
      import("../../pages/FranchiseDashboard.jsx");
    }
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          py: 1,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "80px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            height: "100%",
          }}
        >
          <img
            src="/logo.svg"
            alt="IPLPulse Logo"
            style={{ height: "100%", maxHeight: "60px", width: "auto" }}
          />
          <Typography variant="h6" fontWeight={800} color="primary.main">
            IPLPulse
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        {NAV_SECTIONS.map((section, idx) => (
          <Box key={section.title} sx={{ mb: 1 }}>
            {!collapsed && (
              <Box
                sx={{
                  mx: 1.5,
                  mt: 2,
                  mb: 1,
                  py: 0.75,
                  px: 1.5,
                  borderRadius: 2,
                  bgcolor: getHeaderCardStyles(section.title).bg,
                  border: getHeaderCardStyles(section.title).border,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: getHeaderCardStyles(section.title).color,
                    fontWeight: 800,
                    display: "block",
                    fontSize: "0.72rem",
                    letterSpacing: 1.2,
                    lineHeight: 1.2,
                  }}
                >
                  {section.title}
                </Typography>
              </Box>
            )}
            {collapsed && idx !== 0 && <Divider sx={{ my: 1, mx: 2 }} />}
            <List sx={{ px: 1, py: 0 }}>
              {section.items.map((item) => {
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname === item.path ||
                      location.pathname.startsWith(item.path + "/");
                return (
                  <ListItem
                    key={item.text}
                    disablePadding
                    sx={{
                      mb: 0.5,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      pb: 0.5,
                    }}
                  >
                    <Tooltip
                      title={collapsed ? item.text : ""}
                      placement="right"
                      arrow
                      disableInteractive
                    >
                      <ListItemButton
                        onMouseEnter={() => prefetchPage(item.path)}
                        onClick={() => {
                          navigate(item.path);
                          if (mobileOpen && handleDrawerToggle)
                            handleDrawerToggle();
                        }}
                        selected={isActive}
                        sx={{
                          borderRadius: 2,
                          justifyContent: "center",
                          px: 2,
                          minHeight: { xs: 44, md: 40 },
                          textAlign: "center",
                          "&.Mui-selected": {
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            "&:hover": { bgcolor: "primary.dark" },
                            "& .MuiListItemIcon-root": {
                              color: "primary.contrastText",
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 1.5,
                            justifyContent: "center",
                            color: isActive ? "inherit" : "text.secondary",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {!collapsed && (
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontSize: "0.85rem",
                                  fontWeight: isActive ? 600 : 500,
                                  textAlign: "center",
                                }}
                              >
                                {item.text}
                              </Typography>
                            }
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}

        <Divider sx={{ my: 1 }} />

        {!collapsed && (
          <Box
            sx={{
              mx: 1.5,
              mt: 2,
              mb: 1,
              py: 0.75,
              px: 1.5,
              borderRadius: 2,
              bgcolor: getHeaderCardStyles("Teams").bg,
              border: getHeaderCardStyles("Teams").border,
              textAlign: "center",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: getHeaderCardStyles("Teams").color,
                fontWeight: 800,
                display: "block",
                fontSize: "0.72rem",
                letterSpacing: 1.2,
                lineHeight: 1.2,
              }}
            >
              Teams
            </Typography>
          </Box>
        )}

        <List sx={{ px: 1 }}>
          {FRANCHISES.map((team) => {
            const isTeamActive =
              location.pathname === `/franchises/${team.key}`;
            return (
              <ListItem
                key={team.key}
                disablePadding
                sx={{
                  mb: 0.5,
                  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                  pb: 0.5,
                }}
              >
                <Tooltip
                  title={collapsed ? team.name : ""}
                  placement="right"
                  arrow
                  disableInteractive
                >
                  <ListItemButton
                    onMouseEnter={() => prefetchPage(`/franchises/${team.key}`)}
                    onClick={() => {
                      navigate(`/franchises/${team.key}`);
                      if (mobileOpen && handleDrawerToggle)
                        handleDrawerToggle();
                    }}
                    selected={isTeamActive}
                    sx={{
                      borderRadius: 2,
                      justifyContent: "center",
                      px: 2,
                      minHeight: { xs: 44, md: 40 },
                      textAlign: "center",
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": { bgcolor: "primary.dark" },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 1.5,
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "4px",
                          bgcolor: team.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: "bold",
                        }}
                      >
                        {team.key[0]}
                      </Box>
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={
                          <Typography
                            sx={{ fontSize: "0.875rem", textAlign: "center" }}
                          >
                            {team.name}
                          </Typography>
                        }
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: width },
        flexShrink: { md: 0 },
        transition: "width 0.2s",
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            bgcolor: "background.paper",
            backgroundImage: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            transition: "width 0.2s",
            overflowX: "hidden",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;
