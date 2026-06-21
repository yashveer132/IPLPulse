import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import PageLoader from "./components/common/PageLoader.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";

const Dashboard = React.lazy(() => import("./pages/Dashboard.jsx"));
const PlayerProfile = React.lazy(() => import("./pages/PlayerProfile.jsx"));
const FranchiseDashboard = React.lazy(
  () => import("./pages/FranchiseDashboard.jsx"),
);
const AuctionExplorer = React.lazy(() => import("./pages/AuctionExplorer.jsx"));
const BestPurchases = React.lazy(() => import("./pages/BestPurchases.jsx"));
const FranchiseComparison = React.lazy(
  () => import("./pages/FranchiseComparison.jsx"),
);
const SeasonIntelligence = React.lazy(
  () => import("./pages/SeasonIntelligence.jsx"),
);
const PlayerIntelligence = React.lazy(
  () => import("./pages/PlayerIntelligence.jsx"),
);
const PlayerValueRankings = React.lazy(
  () => import("./pages/PlayerValueRankings.jsx"),
);
const PlayerValueDetail = React.lazy(
  () => import("./pages/PlayerValueDetail.jsx"),
);
const Leaderboards = React.lazy(() => import("./pages/Leaderboards.jsx"));
const MilestoneExplorer = React.lazy(
  () => import("./pages/MilestoneExplorer.jsx"),
);
const HeadToHeadMatchups = React.lazy(
  () => import("./pages/HeadToHeadMatchups.jsx"),
);
const VenueMastery = React.lazy(() => import("./pages/VenueMastery.jsx"));
const Flashpoints = React.lazy(() => import("./pages/Flashpoints.jsx"));
const FlashpointDetail = React.lazy(
  () => import("./pages/FlashpointDetail.jsx"),
);
const EntityDetail = React.lazy(() => import("./pages/EntityDetail.jsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.jsx"));

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<AuctionExplorer />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/franchises" element={<Dashboard />} />
            <Route
              path="/franchises/compare"
              element={<FranchiseComparison />}
            />
            <Route path="/franchises/:id" element={<FranchiseDashboard />} />
            <Route
              path="/seasons/intelligence"
              element={<SeasonIntelligence />}
            />
            <Route
              path="/rankings/best-purchases"
              element={<BestPurchases />}
            />
            <Route path="/rankings/leaderboards" element={<Leaderboards />} />
            <Route
              path="/analytics/player-intelligence"
              element={<PlayerIntelligence />}
            />
            <Route
              path="/analytics/player-intelligence/:id"
              element={<PlayerIntelligence />}
            />
            <Route
              path="/analytics/player-value"
              element={<PlayerValueRankings />}
            />
            <Route
              path="/analytics/player-value/:id"
              element={<PlayerValueDetail />}
            />
            <Route
              path="/analytics/milestone-explorer"
              element={<MilestoneExplorer />}
            />
            <Route
              path="/analytics/head-to-head"
              element={<HeadToHeadMatchups />}
            />
            <Route path="/analytics/venue-mastery" element={<VenueMastery />} />
            <Route path="/flashpoints" element={<Flashpoints />} />
            <Route path="/flashpoints/:id" element={<FlashpointDetail />} />
            <Route path="/entities/:id" element={<EntityDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRoutes;
