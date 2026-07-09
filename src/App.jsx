import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
