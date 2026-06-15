import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PlayerProfile from './pages/PlayerProfile.jsx';
import FranchiseDashboard from './pages/FranchiseDashboard.jsx';
import AuctionExplorer from './pages/AuctionExplorer.jsx';
import BestPurchases from './pages/BestPurchases.jsx';
import FranchiseComparison from './pages/FranchiseComparison.jsx';
import TeamDevelopment from './pages/TeamDevelopment.jsx';
import SeasonIntelligence from './pages/SeasonIntelligence.jsx';
import PlayerIntelligence from './pages/PlayerIntelligence.jsx';
import PlayerValueRankings from './pages/PlayerValueRankings.jsx';
import PlayerValueDetail from './pages/PlayerValueDetail.jsx';
import Leaderboards from './pages/Leaderboards.jsx';
import MilestoneExplorer from './pages/MilestoneExplorer.jsx';
import HeadToHeadMatchups from './pages/HeadToHeadMatchups.jsx';
import VenueMastery from './pages/VenueMastery.jsx';
import Flashpoints from './pages/Flashpoints.jsx';
import FlashpointDetail from './pages/FlashpointDetail.jsx';
import EntityDetail from './pages/EntityDetail.jsx';
import NotFound from './pages/NotFound.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/players" element={<AuctionExplorer />} />
        <Route path="/players/:id" element={<PlayerProfile />} />
        <Route path="/franchises" element={<Dashboard />} />
        <Route path="/franchises/compare" element={<FranchiseComparison />} />
        <Route path="/franchises/:id" element={<FranchiseDashboard />} />
        <Route path="/seasons/intelligence" element={<SeasonIntelligence />} />
        <Route path="/rankings/best-purchases" element={<BestPurchases />} />
        <Route path="/rankings/leaderboards" element={<Leaderboards />} />
        <Route path="/analytics/team-development" element={<TeamDevelopment />} />
        <Route path="/analytics/player-intelligence" element={<PlayerIntelligence />} />
        <Route path="/analytics/player-intelligence/:id" element={<PlayerIntelligence />} />
        <Route path="/analytics/player-value" element={<PlayerValueRankings />} />
        <Route path="/analytics/player-value/:id" element={<PlayerValueDetail />} />
        <Route path="/analytics/milestone-explorer" element={<MilestoneExplorer />} />
        <Route path="/analytics/head-to-head" element={<HeadToHeadMatchups />} />
        <Route path="/analytics/venue-mastery" element={<VenueMastery />} />
        <Route path="/flashpoints" element={<Flashpoints />} />
        <Route path="/flashpoints/:id" element={<FlashpointDetail />} />
        <Route path="/entities/:id" element={<EntityDetail />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
