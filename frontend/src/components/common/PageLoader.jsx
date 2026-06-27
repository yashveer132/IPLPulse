import React from "react";
import LoadingCard from "./LoadingCard.jsx";

const PageLoader = ({
  fullscreen = true,
  title = "IPLPulse",
  message = "Initializing application & data structures...",
}) => {
  return (
    <LoadingCard fullscreen={fullscreen} title={title} message={message} />
  );
};

export default PageLoader;
