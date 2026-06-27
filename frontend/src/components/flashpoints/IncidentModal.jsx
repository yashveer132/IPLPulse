import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "92%", sm: "85%", md: 800 },
  maxWidth: "95vw",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: 24,
  p: { xs: 2.5, sm: 4 },
  borderRadius: 4,
};

const getSeverityLabel = (severity) => {
  if (severity >= 9) return { label: "Historic Scandal", color: "error" };
  if (severity >= 7) return { label: "League Defining", color: "warning" };
  if (severity >= 4) return { label: "Major Controversy", color: "info" };
  return { label: "Minor Incident", color: "default" };
};

const IncidentModal = ({ open, handleClose, incident }) => {
  if (!incident) return null;

  const { label, color } = getSeverityLabel(incident.severity);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
              <Chip label={label} color={color} size="small" />
              <Chip
                label={`Impact: ${incident.impactType}`}
                variant="outlined"
                size="small"
              />
              <Chip label={incident.category} size="small" />
              <Chip
                label={`Status: ${incident.resolutionStatus}`}
                size="small"
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {incident.title}{" "}
              <Typography component="span" variant="h4" color="text.secondary">
                ({incident.year})
              </Typography>
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="body1"
          sx={{ fontSize: "1.1rem", lineHeight: 1.8, mb: 4 }}
        >
          {incident.fullStory}
        </Typography>

        <Box
          sx={{
            mb: 4,
            p: 3,
            bgcolor: "rgba(229, 46, 113, 0.05)",
            borderRadius: 2,
            borderLeft: "4px solid #e52e71",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ChangeHistoryIcon color="primary" /> What Changed After This?
          </Typography>
          <List dense disablePadding>
            {incident.whatChanged?.map((change, idx) => (
              <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <VerifiedUserIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={change} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="overline" color="text.secondary">
              Affected Teams
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {incident.affectedTeams.length > 0 ? (
                incident.affectedTeams.map((t) => (
                  <Chip key={t} label={t} size="small" />
                ))
              ) : (
                <Typography variant="body2">None</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="overline" color="text.secondary">
              Affected Players
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {incident.affectedPlayers.length > 0 ? (
                incident.affectedPlayers.map((p) => (
                  <Chip key={p} label={p} size="small" />
                ))
              ) : (
                <Typography variant="body2">None</Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Source Transparency
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {incident.sourceUrls?.map((url, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <LinkIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  component="a"
                  href={url}
                  target="_blank"
                  color="primary"
                  sx={{
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {new URL(url).hostname.replace("www.", "")}
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2 }}
          >
            Reliability Score: {incident.reliability}/10
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default IncidentModal;
