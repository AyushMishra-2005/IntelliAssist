import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Ticket, 
  Users, 
  FolderOpen, 
  TrendingUp, 
  Plus, 
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    myTickets: 0,
    escalatedTickets: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/tickets?limit=5');
      setRecentTickets(data.data);

      const total = data.pagination.total;
      const open = data.data.filter(t => t.status?.includeInActive).length;
      const mine = data.data.filter(t =>
        t.createdBy?._id === user._id || t.assignedTo?._id === user._id
      ).length;
      const escalated = data.data.filter(t => t.status?.title === 'Escalated').length;

      setStats({
        totalTickets: total,
        openTickets: open,
        myTickets: mine,
        escalatedTickets: escalated,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Priority color mapping for badges
  const getPriorityColor = (priority) => {
    const map = {
      low: 'text-green-400 bg-green-950/40 border-green-800',
      medium: 'text-yellow-400 bg-yellow-950/40 border-yellow-800',
      high: 'text-orange-400 bg-orange-950/40 border-orange-800',
      critical: 'text-red-400 bg-red-950/40 border-red-800',
    };
    return map[priority?.toLowerCase()] || 'text-gray-400 bg-gray-800 border-gray-700';
  };

  // Format date relative
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-black min-h-screen p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-gray-800 rounded"></div>
            <div className="h-10 w-32 bg-gray-800 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-900/60 p-6 rounded-2xl h-24"></div>
            ))}
          </div>
          <div className="bg-gray-900/60 p-6 rounded-2xl h-64"></div>
        </div>
      </div>
    );
  }

  // Stats data for mapping
  const statItems = [
    { 
      key: 'total', 
      label: 'Total Tickets', 
      value: stats.totalTickets, 
      icon: Ticket, 
      color: 'text-blue-400', 
      bg: 'bg-blue-950/30',
      border: 'border-blue-800/40'
    },
    { 
      key: 'open', 
      label: 'Open', 
      value: stats.openTickets, 
      icon: FolderOpen, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-950/30',
      border: 'border-indigo-800/40'
    },
    { 
      key: 'my', 
      label: 'My Tickets', 
      value: stats.myTickets, 
      icon: Users, 
      color: 'text-purple-400', 
      bg: 'bg-purple-950/30',
      border: 'border-purple-800/40'
    },
    { 
      key: 'escalated', 
      label: 'Escalated', 
      value: stats.escalatedTickets, 
      icon: TrendingUp, 
      color: 'text-rose-400', 
      bg: 'bg-rose-950/30',
      border: 'border-rose-800/40'
    },
  ];

  return (
    <div className="bg-black min-h-screen text-white p-6 md:p-8">
      {/* Header with user greeting and FAB */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Clock size={14} /> 
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        {/* Floating action style button */}
        <Link
          to="/tickets/new"
          className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          New Ticket
        </Link>
      </div>

      {/* Stats Grid with new layout - larger cards with icons on top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statItems.map((item) => (
          <div 
            key={item.key}
            className={`relative overflow-hidden bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border ${item.border} hover:border-opacity-100 transition-all hover:shadow-lg hover:shadow-${item.color.split('-')[1]}-900/20 group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">{item.label}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{item.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.bg} border ${item.border} group-hover:scale-110 transition-transform`}>
                <item.icon size={22} className={item.color} />
              </div>
            </div>
            {/* Subtle progress bar at bottom */}
            <div className="mt-4 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${item.color.replace('text', 'from')} to-${item.color.split('-')[1]}-400/40`}
                style={{ width: `${Math.min(100, (item.value / (stats.totalTickets || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tickets Table - new layout */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            Recent Activity
          </h2>
          <Link to="/tickets" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/40 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Ticket</th>
                <th className="px-6 py-3 text-left font-medium">Title</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Priority</th>
                <th className="px-6 py-3 text-left font-medium">Department</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr 
                    key={ticket._id}
                    className="hover:bg-gray-800/30 transition-colors group cursor-pointer"
                    onClick={() => window.location.href = `/tickets/${ticket._id}`}
                  >
                    <td className="px-6 py-4 font-mono text-blue-400 group-hover:text-blue-300">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-6 py-4 text-white max-w-xs truncate">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium inline-block"
                        style={{ 
                          backgroundColor: ticket.status?.color || '#6b7280',
                          color: '#fff'
                        }}
                      >
                        {ticket.status?.title || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {ticket.department?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;