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
