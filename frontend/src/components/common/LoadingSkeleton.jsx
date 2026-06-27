import React from "react";
import LoadingCard from "./LoadingCard.jsx";

export function CardSkeleton({
  message = "Loading card details...",
  minHeight = "180px",
}) {
  return <LoadingCard message={message} minHeight={minHeight} />;
}

export function TableSkeleton({
  rows = 5,
  message = "Fetching database records...",
}) {
  return <LoadingCard message={message} minHeight={`${120 + rows * 40}px`} />;
}

export function ChartSkeleton({
  message = "Plotting data visualizations...",
  minHeight = "350px",
}) {
  return (
    <LoadingCard
      transparent
      size="medium"
      message={message}
      minHeight={minHeight}
    />
  );
}

export function PageSkeleton({
  title = "Preparing Dashboard",
  message = "Fetching resources and stats...",
  minHeight = "500px",
}) {
  return <LoadingCard title={title} message={message} minHeight={minHeight} />;
}
