import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Plus,
  X,
  Save,
  RotateCcw,
  Download,
  Mail,
  Sparkles,
  MessageSquare,
  GripVertical,
  LayoutGrid,
  BarChart3,
  PieChart as LucidePieChart,
  LineChart as LucideLineChart,
  AlertTriangle,
  Settings,
  ChevronDown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomDashboard = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [mlPredictions, setMlPredictions] = useState(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [nlQuery, setNlQuery] = useState('');
  const [nlResults, setNlResults] = useState(null);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const availableWidgets = [
    { id: 'overview', name: 'Overview Stats', type: 'stats', icon: BarChart3 },
    { id: 'priority-pie', name: 'Priority Distribution', type: 'chart', icon: LucidePieChart },
    { id: 'status-bar', name: 'Status Breakdown', type: 'chart', icon: BarChart3 },
    { id: 'timeline', name: 'Tickets Timeline', type: 'chart', icon: LucideLineChart },
    { id: 'predictions', name: 'ML Predictions', type: 'chart', icon: Sparkles },
    { id: 'anomalies', name: 'Anomaly Detection', type: 'list', icon: AlertTriangle },
    { id: 'nl-search', name: 'Natural Language Search', type: 'search', icon: MessageSquare },
    { id: 'scheduled-reports', name: 'Email Reports', type: 'settings', icon: Mail },
  ];

  useEffect(() => {
    loadDashboard();
    fetchAnalytics();
    fetchMLPredictions();
    fetchScheduledReports();
  }, []);

  const loadDashboard = () => {
    const saved = localStorage.getItem(`dashboard-${user._id}`);
    if (saved) {
      const savedWidgets = JSON.parse(saved);
      setWidgets(savedWidgets);
    } else {
      const defaultWidgets = ['overview', 'priority-pie', 'timeline'];
      setWidgets(defaultWidgets);
    }
    setLoading(false);
  };

  const saveDashboard = () => {
    localStorage.setItem(
      `dashboard-${user._id}`,
      JSON.stringify(widgets)
    );
    toast.success('Dashboard saved successfully!');
  };

  const resetDashboard = () => {
    localStorage.removeItem(`dashboard-${user._id}`);
    loadDashboard();
    toast.success('Dashboard reset to default');
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/dashboard');
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchMLPredictions = async () => {
    try {
      const { data } = await api.get('/analytics/ml-predictions');
      setMlPredictions(data.data);
    } catch (error) {
      console.error('Failed to fetch ML predictions:', error);
    }
  };

  const fetchScheduledReports = async () => {
    try {
      const { data } = await api.get('/analytics/scheduled-reports');
      setScheduledReports(data.data || []);
    } catch (error) {
      console.error('Failed to fetch scheduled reports:', error);
    }
  };

  const addWidget = (widgetId) => {
    if (widgets.includes(widgetId)) {
      toast.error('Widget already added');
      return;
    }

    setWidgets([...widgets, widgetId]);
    setShowAddWidget(false);
    toast.success('Widget added successfully');
  };

  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter((w) => w !== widgetId));
    toast.success('Widget removed');
  };

  const moveWidget = (widgetId, direction) => {
    const index = widgets.indexOf(widgetId);
    if (direction === 'up' && index > 0) {
      const newWidgets = [...widgets];
      [newWidgets[index], newWidgets[index - 1]] = [newWidgets[index - 1], newWidgets[index]];
      setWidgets(newWidgets);
    } else if (direction === 'down' && index < widgets.length - 1) {
      const newWidgets = [...widgets];
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
      setWidgets(newWidgets);
    }
  };

  const handleDragStart = (e, widgetId, index) => {
    setDraggedWidget({ id: widgetId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedWidget(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedWidget && draggedWidget.index !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedWidget || draggedWidget.index === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(draggedWidget.index, 1);
    newWidgets.splice(dropIndex, 0, removed);

    setWidgets(newWidgets);
    setDraggedWidget(null);
    setDragOverIndex(null);
    toast.success('Widget moved');
  };

  const handleNLQuery = async () => {
    if (!nlQuery.trim()) {
      toast.error('Please enter a query');
      return;
    }

    try {
      const { data } = await api.post('/analytics/nl-query', { query: nlQuery });
      setNlResults(data);
      toast.success(`Found ${data.totalResults} results`);
    } catch (error) {
      console.error('NL Query failed:', error);
      toast.error('Failed to process query');
    }
  };

  const scheduleReport = async (frequency) => {
    try {
      await api.post('/analytics/schedule-report', { frequency });
      toast.success(`${frequency} report scheduled`);
      fetchScheduledReports();
    } catch (error) {
      console.error('Failed to schedule report:', error);
      toast.error('Failed to schedule report');
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await api.get('/analytics/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error('Failed to download PDF');
    }
  };

  const renderWidget = (widgetId) => {
    if (!analytics) return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );

    switch (widgetId) {
      case 'overview':
        return (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 rounded-xl p-4 border border-gray-800/60 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-400">Total</p>
                  <BarChart3 size={14} className="text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{analytics.overview.totalTickets}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-gray-800/60 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-400">Open</p>
                  <AlertCircle size={14} className="text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-amber-400">{analytics.overview.openTickets}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-gray-800/60 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-400">Closed</p>
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400">{analytics.overview.closedTickets}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-gray-800/60 hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-400">Avg Response</p>
                  <Clock size={14} className="text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{analytics.overview.avgResponseTime}m</p>
              </div>
            </div>
          </div>
        );

      case 'priority-pie':
        const priorityData = Object.entries(analytics.priorityBreakdown).map(([name, value]) => ({
          name,
          value,
        }));
        return (
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
        );

      case 'status-bar':
        const statusData = Object.entries(analytics.statusBreakdown).map(([name, value]) => ({
          name,
          value,
        }));
        return (
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
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
        );

      case 'timeline':
        const timelineData = analytics.ticketsOverTime.map((item) => ({
          date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: item.count,
        }));
        return (
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData}>
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
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'predictions':
        if (!mlPredictions) return (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        );
        return (
          <div className="p-5">
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Trend</span>
                  <span className={`font-semibold ${mlPredictions.insights?.trend === 'increasing' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                    {mlPredictions.insights?.trend}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">Avg Daily</span>
                  <span className="font-semibold text-white">{mlPredictions.insights?.avgDaily} tickets</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">Data Quality</span>
                  <span className="font-semibold text-white">{mlPredictions.insights?.dataQuality}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Next 7 Days Forecast</p>
                {mlPredictions.predictions?.slice(0, 3).map((pred) => (
                  <div key={pred.date} className="flex justify-between text-sm py-2 px-3 bg-black/40 rounded-lg border border-gray-800/60">
                    <span className="text-gray-400">{new Date(pred.date).toLocaleDateString()}</span>
                    <span className="font-semibold text-white">{pred.predictedCount} tickets</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'anomalies':
        if (!mlPredictions?.anomalies) return (
          <div className="p-8 text-center text-gray-400">No anomalies detected</div>
        );
        return (
          <div className="p-5">
            {mlPredictions.anomalies.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-emerald-400 mb-3" />
                <p className="text-gray-400">No anomalies detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mlPredictions.anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${anomaly.severity === 'high'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{new Date(anomaly.date).toLocaleDateString()}</p>
                      <span className={`text-sm font-medium ${anomaly.severity === 'high' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {anomaly.value} tickets (Z-score: {anomaly.zScore})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'nl-search':
        return (
          <div className="p-5">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNLQuery()}
                  placeholder="e.g., Show me high priority tickets from last week"
                  className="w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <button
                onClick={handleNLQuery}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-[1.02]"
              >
                <MessageSquare size={18} className="inline mr-2" />
                Search
              </button>
              {nlResults && (
                <div className="bg-black/40 rounded-xl p-4 border border-gray-800/60">
                  <p className="font-semibold text-white">Found {nlResults.totalResults} results</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Filters: {JSON.stringify(nlResults.parsedFilters)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'scheduled-reports':
        return (
          <div className="p-5">
            <div className="space-y-3">
              <button
                onClick={() => scheduleReport('daily')}
                className="w-full px-4 py-3 bg-black/40 hover:bg-gray-800/50 rounded-xl text-white transition-all border border-gray-800/60 hover:border-blue-500/30"
              >
                Schedule Daily Report
              </button>
              <button
                onClick={() => scheduleReport('weekly')}
                className="w-full px-4 py-3 bg-black/40 hover:bg-gray-800/50 rounded-xl text-white transition-all border border-gray-800/60 hover:border-blue-500/30"
              >
                Schedule Weekly Report
              </button>
              <button
                onClick={() => scheduleReport('monthly')}
                className="w-full px-4 py-3 bg-black/40 hover:bg-gray-800/50 rounded-xl text-white transition-all border border-gray-800/60 hover:border-blue-500/30"
              >
                Schedule Monthly Report
              </button>
              {scheduledReports.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800/60">
                  <p className="text-xs text-gray-500 mb-2">Active Schedules:</p>
                  {scheduledReports.map((report, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400 py-1">
                      <Mail size={14} className="text-blue-400" />
                      <span className="capitalize">{report.frequency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div className="p-8 text-center text-gray-400">Unknown widget</div>;
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
        <p className="mt-6 text-gray-400 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Custom Dashboard
            </h1>
            <p className="text-gray-400 mt-1.5">Build your personalized analytics dashboard</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/40 text-gray-400 rounded-lg border border-gray-700/50 hover:border-gray-600 hover:text-white transition-all"
            >
              <Download size={18} />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => setShowAddWidget(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Widget</span>
            </button>
            <button
              onClick={saveDashboard}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
            >
              <Save size={18} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={resetDashboard}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/40 text-gray-400 rounded-lg border border-gray-700/50 hover:border-gray-600 hover:text-white transition-all"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Widgets Grid */}
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900/30 rounded-xl border-2 border-dashed border-gray-700/50">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <LayoutGrid size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No widgets added</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              Start building your custom dashboard by adding widgets
            </p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
            >
              <Plus size={18} className="inline mr-2" />
              Add Your First Widget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgets.map((widgetId, index) => {
              const widgetInfo = availableWidgets.find((w) => w.id === widgetId);
              const Icon = widgetInfo?.icon || LayoutGrid;

              return (
                <div
                  key={widgetId}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, widgetId, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border-2 transition-all duration-300 overflow-hidden ${dragOverIndex === index
                    ? 'border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.02]'
                    : 'border-gray-800/60 hover:border-gray-700/60'
                    } ${draggedWidget?.index === index ? 'opacity-40' : 'opacity-100'}`}
                  style={{ cursor: 'grab' }}
                >
                  {/* Widget Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-black/40 border-b border-gray-800/60 cursor-grab active:cursor-grabbing"
                    style={{ touchAction: 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical size={16} className="text-gray-500" />
                      <div className="w-6 h-6 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                        <Icon size={14} className="text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {widgetInfo?.name || widgetId}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveWidget(widgetId, 'up')}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white"
                        title="Move up"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveWidget(widgetId, 'down')}
                        disabled={index === widgets.length - 1}
                        className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white"
                        title="Move down"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeWidget(widgetId)}
                        className="p-1.5 hover:bg-rose-500/20 rounded-lg transition-all text-gray-400 hover:text-rose-400 ml-1"
                        title="Remove"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Widget Content */}
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar" style={{ pointerEvents: draggedWidget ? 'none' : 'auto' }}>
                    {renderWidget(widgetId)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Widget Modal */}
        {showAddWidget && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-2xl border-2 border-gray-700/70 max-w-md w-full shadow-2xl shadow-black/50 shadow-[0_0_50px_rgba(59,130,246,0.08)] hover:shadow-[0_0_60px_rgba(59,130,246,0.15)] transition-shadow duration-500">
              <div className="p-6 border-b-2 border-gray-700/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/30"></div>
                      <h2 className="text-xl font-bold text-white">Add Widget</h2>
                    </div>
                    <p className="text-sm text-gray-400 ml-4">Choose a widget to add to your dashboard</p>
                  </div>
                  <button
                    onClick={() => setShowAddWidget(false)}
                    className="p-2 hover:bg-gray-800/50 rounded-lg transition-all text-gray-400 hover:text-white border-2 border-transparent hover:border-gray-700/50"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  {availableWidgets.map((widget) => {
                    const Icon = widget.icon || LayoutGrid;
                    const isAdded = widgets.includes(widget.id);
                    return (
                      <button
                        key={widget.id}
                        onClick={() => addWidget(widget.id)}
                        disabled={isAdded}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all border-2 ${isAdded
                            ? 'bg-gray-800/50 border-gray-700/50 opacity-50 cursor-not-allowed'
                            : 'bg-black/40 border-gray-700/50 hover:border-blue-500/60 hover:bg-gray-800/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border-2 ${isAdded
                              ? 'bg-gray-700/30 border-gray-700/50'
                              : 'bg-blue-600/10 border-blue-500/30 hover:border-blue-500/50'
                            }`}>
                            <Icon size={18} className={isAdded ? 'text-gray-500' : 'text-blue-400'} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isAdded ? 'text-gray-500' : 'text-white'}`}>
                              {widget.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{widget.type}</p>
                          </div>
                          {isAdded && (
                            <span className="text-xs text-gray-500">Added</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t-2 border-gray-700/70 bg-gray-900/30">
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="w-full py-2.5 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50 border-2 border-transparent hover:border-gray-700/50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDashboard;