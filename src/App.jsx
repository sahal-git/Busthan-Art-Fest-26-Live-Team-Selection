import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEventState } from './lib/store';
import { Loader2 } from 'lucide-react';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teams from './pages/Teams';
import Categories from './pages/Categories';
import ActivityLog from './pages/ActivityLog';
import Settings from './pages/Settings';
import TeamLeaderPortal from './pages/TeamLeader';
import MainStageDisplay from './pages/MainStage';
import ShowcaseDisplay from './pages/Showcase';

function App() {
  const { state } = useEventState();

  if (!state.isLoaded) {
    return (
      <div className="h-[100dvh] bg-[#0a0a0a] flex items-center justify-center flex-col text-white">
        <Loader2 className="w-12 h-12 animate-spin text-event-gold mb-4" />
        <div className="text-sm uppercase tracking-widest font-bold text-white/50">Connecting to Live Server...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/live" replace />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="live" replace />} />
          <Route path="live" element={<AdminDashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teams" element={<Teams />} />
          <Route path="categories" element={<Categories />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/leader/:teamId" element={<TeamLeaderPortal />} />
        <Route path="/stage" element={<MainStageDisplay />} />
        <Route path="/showcase" element={<ShowcaseDisplay />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
