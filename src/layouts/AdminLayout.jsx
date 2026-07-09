import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, MonitorPlay, Users, Shield, List, History, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Live Event', path: '/admin/live', icon: MonitorPlay },
  { name: 'Students', path: '/admin/students', icon: Users },
  { name: 'Teams', path: '/admin/teams', icon: Shield },
  { name: 'Categories', path: '/admin/categories', icon: List },
  { name: 'Activity Log', path: '/admin/activity', icon: History },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === '123654') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasscode('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-event-gold/5 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="glass-panel p-10 rounded-[32px] border border-white/5 flex flex-col items-center relative z-10 w-full max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-event-gold text-charcoal font-bold flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(255,215,0,0.3)]">B</div>
          <h1 className="text-xl font-bold text-white mb-2 tracking-widest uppercase text-center">Admin Access</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center mb-8">Enter authorization code</p>
          
          <form onSubmit={handlePasscodeSubmit} className="w-full flex flex-col gap-4">
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                maxLength={6}
                placeholder="••••••"
                className={clsx(
                  "w-full bg-[#121212] border rounded-xl px-4 py-4 text-center text-2xl text-white font-mono tracking-[0.5em] focus:outline-none transition-all placeholder:text-white/10",
                  error ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] text-red-500" : "border-white/10 focus:border-event-gold focus:shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                )}
                autoFocus
              />
              {error && <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">Invalid Passcode</div>}
            </div>
            
            <button
              type="submit"
              disabled={passcode.length < 6}
              className="mt-6 w-full py-4 bg-event-gold/10 text-event-gold hover:bg-event-gold hover:text-charcoal transition-all rounded-xl text-xs font-bold uppercase tracking-widest border border-event-gold/20 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-event-gold/10 disabled:hover:text-event-gold disabled:hover:shadow-none"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={clsx("bg-[#121212] border-r border-white/5 flex flex-col z-30 transition-all duration-300 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)]", isCollapsed ? "w-20" : "w-64")}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-[#121212] border border-white/10 rounded-full p-1 text-white/50 hover:text-white hover:border-event-gold z-40 transition-colors shadow-md"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={clsx("h-16 flex items-center border-b border-white/5 transition-all", isCollapsed ? "justify-center px-0" : "px-6")}>
          <div className="w-8 h-8 rounded-lg bg-event-gold text-charcoal font-bold flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.4)]">B</div>
          {!isCollapsed && <span className="font-bold tracking-widest uppercase text-sm ml-3 truncate transition-opacity duration-300">Busthan Admin</span>}
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center rounded-xl transition-all font-medium text-sm overflow-hidden whitespace-nowrap relative group",
                  isCollapsed ? "justify-center py-3 px-0 w-12 mx-auto" : "gap-3 px-4 py-3 w-full",
                  isActive 
                    ? "bg-white/5 text-event-gold shadow-[inset_3px_0_0_0_#FFD700] border border-white/5" 
                    : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute inset-0 bg-event-gold/5 blur-sm rounded-xl"></div>}
                    <Icon className={clsx("w-5 h-5 shrink-0 relative z-10", isActive && "drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]")} />
                    {!isCollapsed && <span className="truncate relative z-10 uppercase tracking-wider text-xs font-bold">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-0">
        <Outlet />
      </div>
    </div>
  );
}
