import React from "react";
import { Box, Card, Typography } from "@mui/material";
import { motion } from "framer-motion";

const LoadingCard = ({
  logo,
  title = "IPLPulse",
  message = "Loading the latest statistics...",
  size = "medium",
  fullscreen = false,
  compact = false,
  overlay = false,
  transparent = false,
  minHeight,
}) => {
  const loaderSizes = {
    small: { circle: 20, logo: 0, border: 2 },
    medium: { circle: 64, logo: 36, border: 3 },
    large: { circle: 96, logo: 54, border: 4 },
  };

  const currentSize = loaderSizes[size] || loaderSizes.medium;

  const AnimatedIndicator = () => {
    const isTiny = currentSize.logo === 0;

    return (
      <Box
        sx={{
          position: "relative",
          width: isTiny ? currentSize.circle : currentSize.circle + 24,
          height: isTiny ? currentSize.circle : currentSize.circle + 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: compact ? 0 : 3,
        }}
      >
        {!isTiny && (
          <motion.div
            style={{
              position: "absolute",
              width: currentSize.circle + 16,
              height: currentSize.circle + 16,
              borderRadius: "50%",
              border: "2px solid rgba(99, 102, 241, 0.2)",
            }}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {!isTiny && (
          <motion.div
            style={{
              position: "absolute",
              width: currentSize.circle,
              height: currentSize.circle,
              borderRadius: "50%",
              border: "1px dashed rgba(245, 158, 11, 0.4)",
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        <motion.div
          style={{
            position: "absolute",
            width: isTiny ? currentSize.circle : currentSize.circle - 8,
            height: isTiny ? currentSize.circle : currentSize.circle - 8,
            borderRadius: "50%",
            border: `${currentSize.border}px solid transparent`,
            borderTopColor: "#6366f1",
            borderRightColor: "#818cf8",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {!isTiny && (
          <motion.div
            animate={{
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            {logo ? (
              logo
            ) : (
              <img
                src="/logo.svg"
                alt="IPL Pulse Logo"
                style={{
                  height: currentSize.logo,
                  width: "auto",
                  filter: "drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.5))",
                }}
              />
            )}
          </motion.div>
        )}
      </Box>
    );
  };

  if (compact) {
    const isTiny = currentSize.logo === 0;
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: message ? 2 : 0,
          p: isTiny ? 0 : 1.5,
          minHeight: minHeight || "auto",
        }}
      >
        <AnimatedIndicator />
        {message && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  const cardContent = (
    <Card
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "24px",
        background: transparent
          ? "transparent"
          : "linear-gradient(135deg, rgba(17, 24, 39, 0.7) 0%, rgba(10, 14, 26, 0.8) 100%)",
        backdropFilter: transparent ? "none" : "blur(20px)",
        border: transparent ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: transparent
          ? "none"
          : "0 20px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
        maxWidth: 420,
        width: "90%",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": transparent
          ? null
          : {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #6366f1, #fbbf24, #6366f1)",
              backgroundSize: "200% auto",
              animation: "shimmer 3s linear infinite",
            },
        "@keyframes shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      <AnimatedIndicator />

      {title && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: "linear-gradient(90deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </Typography>
      )}

      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            maxWidth: 280,
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      )}
    </Card>
  );

  if (fullscreen) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          background:
            "radial-gradient(circle at center, #0e1324 0%, #05070f 100%)",
        }}
      >
        {cardContent}
      </Box>
    );
  }

  if (overlay) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          background: "rgba(10, 14, 26, 0.6)",
          backdropFilter: "blur(8px)",
          borderRadius: "inherit",
        }}
      >
        {cardContent}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: minHeight || "350px",
        width: "100%",
        py: 4,
      }}
    >
      {cardContent}
    </Box>
  );
};

export default LoadingCard;
