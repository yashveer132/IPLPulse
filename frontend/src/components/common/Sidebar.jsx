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

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

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
      {
        text: "Team Progression Index",
        icon: <TrendingUpIcon />,
        path: "/analytics/team-development",
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
      {
        text: "Best Purchases",
        icon: <SportsCricketIcon />,
        path: "/rankings/best-purchases",
      },
      {
        text: "All-Time Records",
        icon: <EmojiEventsIcon />,
        path: "/rankings/leaderboards",
      },
    ],
  },
];

function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const width = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SportsBaseballIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" fontWeight={800} color="primary.main">
              IPLPulse
            </Typography>
          </Box>
        )}
        {collapsed && (
          <SportsBaseballIcon
            sx={{ color: "primary.main", cursor: "pointer" }}
            onClick={() => setCollapsed(false)}
          />
        )}
        {!collapsed && (
          <IconButton onClick={() => setCollapsed(true)} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
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
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  pt: 1.5,
                  pb: 0.5,
                  color: "text.secondary",
                  fontWeight: 700,
                  display: "block",
                  fontSize: "0.7rem",
                  letterSpacing: 1,
                }}
              >
                {section.title}
              </Typography>
            )}
            {collapsed && idx !== 0 && <Divider sx={{ my: 1, mx: 2 }} />}
            <List sx={{ px: 1, py: 0 }}>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip
                      title={collapsed ? item.text : ""}
                      placement="right"
                      arrow
                      disableInteractive
                    >
                      <ListItemButton
                        onClick={() => navigate(item.path)}
                        selected={isActive}
                        sx={{
                          borderRadius: 2,
                          justifyContent: collapsed ? "center" : "flex-start",
                          px: collapsed ? 0 : 2,
                          minHeight: 40,
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
                            mr: collapsed ? 0 : 2,
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
          <Typography
            variant="overline"
            sx={{ px: 3, pt: 1, color: "text.secondary", fontWeight: 600 }}
          >
            Teams
          </Typography>
        )}

        <List sx={{ px: 1 }}>
          {FRANCHISES.map((team) => (
            <ListItem key={team.key} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip
                title={collapsed ? team.name : ""}
                placement="right"
                arrow
                disableInteractive
              >
                <ListItemButton
                  onClick={() => navigate(`/franchises/${team.key}`)}
                  sx={{
                    borderRadius: 2,
                    justifyContent: collapsed ? "center" : "flex-start",
                    px: collapsed ? 0 : 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
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
                        <Typography sx={{ fontSize: "0.875rem" }}>
                          {team.name}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {collapsed && (
        <Box
          sx={{ mt: "auto", p: 1, display: "flex", justifyContent: "center" }}
        >
          <IconButton onClick={() => setCollapsed(false)}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
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
