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
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
          py: 4,
        }}
      >
        {Icon && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: "50%",
              bgcolor: `${color}15`,
              color: color,
              display: "flex",
              mb: 1,
            }}
          >
            <Icon fontSize="medium" />
          </Box>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={700}
          sx={{ textTransform: "uppercase", letterSpacing: 1 }}
        >
          {title}
        </Typography>
        <Typography
          variant="h3"
          fontWeight={800}
          color="text.primary"
          sx={{ my: 0.5 }}
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
              fontWeight: 700,
              bgcolor:
                trend > 0
                  ? "success.light"
                  : trend < 0
                    ? "error.light"
                    : "action.hover",
              px: 1.5,
              py: 0.5,
              borderRadius: 4,
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
