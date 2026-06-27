import { Card, CardContent, Typography, Box } from "@mui/material";

function StatCard({
  title,
  value,
  icon: Icon,
  color = "primary.main",
  trend = null,
}) {
  return (
    <Card
      sx={{
        width: "100%",
        minHeight: { xs: 100, sm: 115, md: 125 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          textAlign: "center",
          p: { xs: 2, sm: 3 },
          "&:last-child": { pb: { xs: 2, sm: 3 } },
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
              mb: 0.5,
            }}
          >
            <Icon fontSize="small" />
          </Box>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={800}
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontSize: { xs: "0.65rem", sm: "0.75rem" },
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography
          fontWeight={900}
          color="text.primary"
          sx={{
            my: 0.5,
            fontSize: { xs: "1.1rem", sm: "1.5rem", md: "1.75rem" },
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              color:
                trend > 0
                  ? "success.main"
                  : trend < 0
                    ? "error.main"
                    : "text.secondary",
              fontWeight: 800,
              bgcolor:
                trend > 0
                  ? "success.light"
                  : trend < 0
                    ? "error.light"
                    : "action.hover",
              px: 1,
              py: 0.2,
              borderRadius: 4,
              fontSize: "0.65rem",
            }}
          >
            {trend > 0 ? "+" : ""}
            {trend}% from previous
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
