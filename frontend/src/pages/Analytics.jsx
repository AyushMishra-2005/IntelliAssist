import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchDepartments();
  }, [dateRange, selectedDepartment]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('department', selectedDepartment);

      const { data } = await api.get(`/analytics/dashboard?${params}`);
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-400 font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  const { overview, priorityBreakdown, statusBreakdown, departmentBreakdown, ticketsOverTime, agentPerformance, recentTickets } = analytics;

  return (
    <div className="bg-black min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Analytics</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-1.5">Monitor ticket performance and team metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/analytics/advanced"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
            >
              <Sparkles size={18} />
              Advanced Analytics
            </Link>
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/60 border-2 border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Total Tickets</span>
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                <BarChart3 size={16} className="text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{overview.totalTickets}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-amber-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Open Tickets</span>
              <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                <AlertCircle size={16} className="text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{overview.openTickets}</p>
            <p className="text-xs text-gray-500 mt-1">
              {overview.totalTickets > 0
                ? `${Math.round((overview.openTickets / overview.totalTickets) * 100)}% of total`
                : 'No tickets'}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Closed Tickets</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={16} className="text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{overview.closedTickets}</p>
            <p className="text-xs text-gray-500 mt-1">
              {overview.totalTickets > 0
                ? `${Math.round((overview.closedTickets / overview.totalTickets) * 100)}% resolved`
                : 'No tickets'}
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Avg Response</span>
              <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                <Clock size={16} className="text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{overview.avgResponseTime}</p>
            <p className="text-xs text-gray-500 mt-1">minutes</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-rose-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Avg Resolution</span>
              <div className="w-8 h-8 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center">
                <TrendingUp size={16} className="text-rose-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{overview.avgResolutionTime}</p>
            <p className="text-xs text-gray-500 mt-1">hours</p>
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Priority Breakdown */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Tickets by Priority</h2>
            <div className="space-y-4">
              {Object.entries(priorityBreakdown).map(([priority, count]) => {
                const percentage = overview.totalTickets > 0 ? (count / overview.totalTickets) * 100 : 0;
                const colors = {
                  Low: 'bg-emerald-500',
                  Medium: 'bg-amber-500',
                  High: 'bg-orange-500',
                  Critical: 'bg-rose-500',
                };
                const textColors = {
                  Low: 'text-emerald-400',
                  Medium: 'text-amber-400',
                  High: 'text-orange-400',
                  Critical: 'text-rose-400',
                };
                return (
                  <div key={priority}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm font-medium ${textColors[priority] || 'text-gray-300'}`}>{priority}</span>
                      <span className="text-sm text-gray-400">{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-gray-800/50 rounded-full h-2">
                      <div
                        className={`${colors[priority] || 'bg-blue-500'} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Tickets by Status</h2>
            <div className="space-y-4">
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const percentage = overview.totalTickets > 0 ? (count / overview.totalTickets) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-300">{status}</span>
                      <span className="text-sm text-gray-400">{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-gray-800/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        {Object.keys(departmentBreakdown).length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Tickets by Department</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(departmentBreakdown).map(([dept, count]) => (
                <div key={dept} className="p-4 bg-black/40 rounded-xl border border-gray-800/60">
                  <p className="text-sm text-gray-400 mb-1">{dept}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tickets Over Time */}
        {ticketsOverTime.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Tickets Over Time (Last 30 Days)</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {ticketsOverTime.map((item) => {
                const maxCount = Math.max(...ticketsOverTime.map(t => t.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item._id} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg hover:from-blue-500 hover:to-purple-500 transition-all cursor-pointer relative group"
                      style={{ height: `${Math.max(height, 10)}%`, minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700/50">
                        {item.count} tickets
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Performance */}
        {user?.role !== 'user' && agentPerformance.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users size={24} className="text-blue-400" />
              Agent Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40 border-b-2 border-gray-800/60">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Agent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Assigned</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Resolved</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Pending</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Avg Resolution</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {agentPerformance.map((agent) => {
                    const successRate = agent.totalAssigned > 0
                      ? Math.round((agent.resolved / agent.totalAssigned) * 100)
                      : 0;
                    return (
                      <tr key={agent.name} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{agent.name}</td>
                        <td className="px-4 py-3 text-gray-400">{agent.totalAssigned}</td>
                        <td className="px-4 py-3 text-emerald-400">{agent.resolved}</td>
                        <td className="px-4 py-3 text-amber-400">{agent.pending}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {Math.round(agent.avgResolutionTime / (1000 * 60 * 60))}h
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-800/50 rounded-full h-2 max-w-[100px]">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  successRate >= 80 ? 'bg-emerald-500' :
                                  successRate >= 60 ? 'bg-amber-500' :
                                  'bg-rose-500'
                                }`}
                                style={{ width: `${successRate}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-400">{successRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Tickets */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Tickets</h2>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 rounded-xl border border-gray-800/60 hover:border-blue-500/30 hover:bg-gray-800/20 transition-all duration-300 gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-sm font-mono text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-white font-medium">{ticket.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{ticket.createdBy}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                    ticket.priority === 'Critical' || ticket.priority === 'High'
                      ? 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                      : ticket.priority === 'Medium'
                      ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                      : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span 
                    className="px-3 py-1 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: ticket.status?.color || '#3b82f6' }}
                  >
                    {ticket.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;