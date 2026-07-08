import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  FolderOpen,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  BarChart3,
  Grid3x3,
  MessageSquare,
  FileText,
  Star
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);

  const isActive = (path) => window.location.pathname === path;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar – width transition with will-change for smoother animation */}
      <aside
        className={`fixed h-full overflow-y-auto z-10 bg-black backdrop-blur-md border-r border-gray-800/80 transition-all duration-300 ease-in-out will-change-[width] ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ overflowX: 'hidden' }} // prevent horizontal scroll during width change
      >
        {/* Inner container ensures no content overflows */}
        <div className="flex flex-col h-full min-w-0">
          {/* Brand */}
          <div className="p-4 border-b border-gray-800/60 flex items-center gap-3 h-20 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">
              SD
            </div>
            <div
              className={`overflow-hidden whitespace-nowrap transition-opacity duration-300 ${
                isExpanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h2 className="text-xl font-bold text-white">IntelliAssist</h2>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 min-w-0">
            <NavItem
              to="/"
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              active={isActive('/')}
              expanded={isExpanded}
            />
            <NavItem
              to="/tickets"
              icon={<Ticket size={20} />}
              label="Tickets"
              active={isActive('/tickets')}
              expanded={isExpanded}
            />
            <NavItem
              to="/analytics"
              icon={<BarChart3 size={20} />}
              label="Analytics"
              active={isActive('/analytics')}
              expanded={isExpanded}
            />
            <NavItem
              to="/dashboard/custom"
              icon={<Grid3x3 size={20} />}
              label="Custom Dashboard"
              active={isActive('/dashboard/custom')}
              expanded={isExpanded}
            />
            <NavItem
              to="/surveys"
              icon={<Star size={20} />}
              label="Surveys"
              active={isActive('/surveys')}
              expanded={isExpanded}
            />

            {(user?.role === 'admin' || user?.role === 'agent') && (
              <>
                <NavItem
                  to="/saved-replies"
                  icon={<MessageSquare size={20} />}
                  label="Saved Replies"
                  active={isActive('/saved-replies')}
                  expanded={isExpanded}
                />
                <NavItem
                  to="/ticket-templates"
                  icon={<FileText size={20} />}
                  label="Ticket Templates"
                  active={isActive('/ticket-templates')}
                  expanded={isExpanded}
                />
              </>
            )}

            {(user?.role === 'admin' || user?.role === 'agent') && (
              <>
                <NavItem
                  to="/departments"
                  icon={<FolderOpen size={20} />}
                  label="Departments"
                  active={isActive('/departments')}
                  expanded={isExpanded}
                />
                <NavItem
                  to="/statuses"
                  icon={<Settings size={20} />}
                  label="Statuses"
                  active={isActive('/statuses')}
                  expanded={isExpanded}
                />
              </>
            )}

            {(user?.role === 'admin' || user?.role === 'agent') && (
              <NavItem
                to="/users"
                icon={<Users size={20} />}
                label="Users"
                active={isActive('/users')}
                expanded={isExpanded}
              />
            )}

            {user?.role === 'admin' && (
              <NavItem
                to="/escalations"
                icon={<TrendingUp size={20} />}
                label="Escalation Rules"
                active={isActive('/escalations')}
                expanded={isExpanded}
              />
            )}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-gray-800/60 min-w-0">
            <div className={`flex items-center gap-3 ${!isExpanded ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div
                className={`overflow-hidden whitespace-nowrap transition-opacity duration-300 ${
                  isExpanded ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <p className="font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            {isExpanded && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full mt-4 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/20 hover:border-red-500/40"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
            {!isExpanded && (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full mt-4 px-2 py-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/20 hover:border-red-500/40"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content – margin slides with sidebar */}
      <main
        className={`flex-1 overflow-y-auto h-full bg-black transition-all duration-300 ease-in-out will-change-[margin-left] ${
          isExpanded ? 'ml-64' : 'ml-20'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

// NavItem – renders icon always, label only when expanded
const NavItem = ({ to, icon, label, active = false, expanded = false }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-600/10'
          : 'text-gray-400 hover:bg-gray-800/60 hover:text-white hover:border-gray-700/50'
      } border border-transparent ${!expanded ? 'justify-center' : ''}`}
      title={!expanded ? label : ''}
    >
      <span className="shrink-0">{icon}</span>
      {expanded && <span className="overflow-hidden whitespace-nowrap">{label}</span>}
      {active && expanded && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
      )}
      {active && !expanded && (
        <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
      )}
    </Link>
  );
};

export default Layout;