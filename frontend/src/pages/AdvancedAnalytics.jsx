import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  RefreshCw,
  Sparkles,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Filter,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
    fetchDepartments();
    fetchPredictions();
  }, [dateRange, selectedDepartment]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalytics();
        fetchPredictions();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, dateRange, selectedDepartment]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const { data } = await api.get(`/analytics/dashboard?${params}`);
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
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

  const fetchPredictions = async () => {
    try {
      const { data } = await api.get('/analytics/predictions');
      setPredictions(data.data);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    }
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setShowExportDropdown(false);
      
      const params = new URLSearchParams();
      params.append('format', format);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await api.get(`/analytics/export?${params}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${Date.now()}.${format === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !analytics) {
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

  const { overview, priorityBreakdown, statusBreakdown, ticketsOverTime } = analytics;

  const priorityData = Object.entries(priorityBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(statusBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const combinedTimeData = [
    ...ticketsOverTime.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: item.count,
      predicted: null,
    })),
    ...(predictions?.predictions || []).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: null,
      predicted: item.predictedCount,
    })),
  ];

  return (
    <div className="bg-black min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Analytics</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Advanced Analytics
            </h1>
            <p className="text-gray-400 mt-1.5">Deep insights and predictive analytics for your support team</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                showFilters || dateRange.startDate || dateRange.endDate || selectedDepartment
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                  : 'bg-black/40 text-gray-400 border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
              {(dateRange.startDate || dateRange.endDate || selectedDepartment) && (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                autoRefresh
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                  : 'bg-black/40 text-gray-400 border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Auto Refresh</span>
            </button>

            {/* Export Button with Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown size={16} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
              
              {showExportDropdown && !exporting && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-20">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-400" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors border-t border-gray-800/60"
                  >
                    <FileText size={16} className="text-blue-400" />
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Date Range</label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Department</label>
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
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
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDateRange({ startDate: '', endDate: '' });
                    setSelectedDepartment('');
                  }}
                  className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Predictive Insights Banner */}
        {predictions && (
          <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 rounded-xl border border-blue-500/20 p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30">
                <Sparkles size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-3">Predictive Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400">Expected Daily Average</p>
                    <p className="text-2xl font-bold text-white">
                      {predictions.insights.avgTicketsPerDay} <span className="text-sm font-normal text-gray-400">tickets</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Trend</p>
                    <div className="flex items-center gap-2">
                      {predictions.insights.trend === 'increasing' ? (
                        <TrendingUp className="text-rose-400" size={20} />
                      ) : predictions.insights.trend === 'decreasing' ? (
                        <TrendingDown className="text-emerald-400" size={20} />
                      ) : null}
                      <p className="text-2xl font-bold text-white capitalize">
                        {predictions.insights.trend}
                      </p>
                      <span className={`text-sm font-medium ${
                        predictions.insights.trendPercentage > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {predictions.insights.trendPercentage > 0 ? '+' : ''}
                        {predictions.insights.trendPercentage}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last 90 Days Total</p>
                    <p className="text-2xl font-bold text-white">
                      {predictions.insights.totalLast90Days} <span className="text-sm font-normal text-gray-400">tickets</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-400">Total</p>
              <BarChart3 size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview.totalTickets}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-400">Open</p>
              <AlertCircle size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview.openTickets}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-400">Closed</p>
              <CheckCircle size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview.closedTickets}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-400">Avg Response</p>
              <Clock size={16} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview.avgResponseTime}m</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-400">Avg Resolution</p>
              <Activity size={16} className="text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview.avgResolutionTime}h</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Timeline Chart */}
          <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Ticket Timeline & Forecast</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={combinedTimeData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  name="Actual Tickets"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                  name="Predicted Tickets"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Priority Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
              <TrendingUp size={16} />
              <span className="text-sm">Resolution Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {overview.totalTickets > 0 ? Math.round((overview.closedTickets / overview.totalTickets) * 100) : 0}%
            </p>
          </div>
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
              <Users size={16} />
              <span className="text-sm">Active Agents</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {analytics.agentPerformance?.length || 0}
            </p>
          </div>
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-purple-400 mb-1">
              <Zap size={16} />
              <span className="text-sm">Peak Day</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {ticketsOverTime.length > 0 ? Math.max(...ticketsOverTime.map(t => t.count)) : 0}
            </p>
          </div>
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-rose-400 mb-1">
              <AlertCircle size={16} />
              <span className="text-sm">Urgent Tickets</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.entries(priorityBreakdown)
                .filter(([key]) => key === 'High' || key === 'Critical')
                .reduce((sum, [, value]) => sum + value, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;