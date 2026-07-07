import { useState, useEffect } from 'react';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye, 
  Trash2, 
  Filter, 
  Calendar,
  ChevronDown,
  X,
  Users,
  BarChart3,
  Smile,
  Frown,
  Meh,
  Award
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Surveys = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'completed',
    agent: '',
    department: '',
    startDate: '',
    endDate: '',
    minRating: '',
    maxRating: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchSurveys();
    fetchAnalytics();
  }, [filters]);

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`${API_URL}/surveys?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.agent) params.append('agent', filters.agent);
      if (filters.department) params.append('department', filters.department);

      const response = await axios.get(`${API_URL}/surveys/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleViewDetails = (survey) => {
    setSelectedSurvey(survey);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setFilters({
      status: 'completed',
      agent: '',
      department: '',
      startDate: '',
      endDate: '',
      minRating: '',
      maxRating: '',
    });
  };

  const hasActiveFilters = filters.status !== 'completed' || 
    filters.agent || 
    filters.department || 
    filters.startDate || 
    filters.endDate || 
    filters.minRating || 
    filters.maxRating;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  const getNPSBadge = (category) => {
    const badges = {
      promoter: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      passive: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      detractor: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    };
    return badges[category] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const getNPSIcon = (category) => {
    if (category === 'promoter') return <TrendingUp size={14} />;
    if (category === 'detractor') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      expired: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    };
    return badges[status] || badges.pending;
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
        <p className="mt-6 text-gray-400 font-medium">Loading surveys...</p>
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
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Feedback</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Customer Satisfaction Surveys
            </h1>
            <p className="text-gray-400 mt-1.5">Track and analyze customer feedback</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                  : 'bg-black/40 text-gray-400 border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
              <ChevronDown 
                size={16} 
                className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400 font-medium">Total Surveys</p>
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <BarChart3 size={16} className="text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.totalSurveys}</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400 font-medium">Average Rating</p>
                <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                  <Star size={16} className="text-amber-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">
                  {analytics.averageRatings?.overall?.toFixed(1) || '0.0'}
                </p>
                {renderStars(Math.round(analytics.averageRatings?.overall || 0))}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400 font-medium">NPS Score</p>
                <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                  <Award size={16} className="text-purple-400" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${
                (analytics.nps?.score || 0) >= 50
                  ? 'text-emerald-400'
                  : (analytics.nps?.score || 0) >= 0
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {analytics.nps?.score || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.nps?.promoters || 0} promoters · {analytics.nps?.detractors || 0} detractors
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400 font-medium">5-Star Ratings</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                  <Smile size={16} className="text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.ratingDistribution?.[5] || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.totalSurveys > 0
                  ? Math.round(((analytics.ratingDistribution?.[5] || 0) / analytics.totalSurveys) * 100)
                  : 0}
                % of total
              </p>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Surveys Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 border-b-2 border-gray-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    NPS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {surveys.map((survey) => (
                  <tr key={survey._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-400">
                        #{survey.ticket?.ticketNumber}
                      </div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {survey.ticket?.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{survey.customer?.name}</div>
                      <div className="text-sm text-gray-500">{survey.customer?.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{survey.agent?.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{survey.ratings.overall}</span>
                        {renderStars(survey.ratings.overall)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {survey.npsCategory ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${getNPSBadge(
                            survey.npsCategory
                          )}`}
                        >
                          {getNPSIcon(survey.npsCategory)}
                          {survey.npsCategory}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${getStatusBadge(survey.status || 'completed')}`}>
                        {survey.status || 'completed'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {survey.completedAt
                        ? new Date(survey.completedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Pending'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(survey)}
                        className="p-2 hover:bg-gray-800/50 rounded-lg transition-all text-gray-400 hover:text-blue-400"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {surveys.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <BarChart3 size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No surveys found</h3>
              <p className="text-gray-400 text-center max-w-md">
                {hasActiveFilters 
                  ? 'No surveys match your current filters. Try adjusting your search criteria.'
                  : 'No surveys have been submitted yet.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedSurvey && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-2xl border-2 border-gray-700/70 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 shadow-[0_0_50px_rgba(59,130,246,0.08)]">
              <div className="p-6 border-b-2 border-gray-700/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/30"></div>
                      <h2 className="text-xl font-bold text-white">Survey Details</h2>
                    </div>
                    <p className="text-sm text-gray-400 ml-4">
                      Ticket #{selectedSurvey.ticket?.ticketNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-800/50 rounded-lg transition-all text-gray-400 hover:text-white border-2 border-transparent hover:border-gray-700/50"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer & Agent Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 rounded-xl p-4 border border-gray-800/60">
                    <p className="text-xs text-gray-500 font-medium mb-1">Customer</p>
                    <p className="text-white font-medium">{selectedSurvey.customer?.name}</p>
                    <p className="text-sm text-gray-400">{selectedSurvey.customer?.email}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 border border-gray-800/60">
                    <p className="text-xs text-gray-500 font-medium mb-1">Agent</p>
                    <p className="text-white font-medium">{selectedSurvey.agent?.name}</p>
                  </div>
                </div>

                {/* Ratings */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Ratings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-black/40 rounded-xl p-3 border border-gray-800/60">
                      <span className="text-sm text-gray-400">Overall</span>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedSurvey.ratings.overall)}
                        <span className="font-bold text-white">{selectedSurvey.ratings.overall}/5</span>
                      </div>
                    </div>
                    {selectedSurvey.ratings.responseTime && (
                      <div className="flex justify-between items-center bg-black/40 rounded-xl p-3 border border-gray-800/60">
                        <span className="text-sm text-gray-400">Response Time</span>
                        <div className="flex items-center gap-2">
                          {renderStars(selectedSurvey.ratings.responseTime)}
                          <span className="font-bold text-white">
                            {selectedSurvey.ratings.responseTime}/5
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedSurvey.ratings.professionalism && (
                      <div className="flex justify-between items-center bg-black/40 rounded-xl p-3 border border-gray-800/60">
                        <span className="text-sm text-gray-400">Professionalism</span>
                        <div className="flex items-center gap-2">
                          {renderStars(selectedSurvey.ratings.professionalism)}
                          <span className="font-bold text-white">
                            {selectedSurvey.ratings.professionalism}/5
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* NPS */}
                {selectedSurvey.npsScore !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Net Promoter Score</h3>
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800/60 flex items-center gap-4">
                      <span className="text-3xl font-bold text-white">{selectedSurvey.npsScore}/10</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border-2 ${getNPSBadge(
                          selectedSurvey.npsCategory
                        )}`}
                      >
                        {getNPSIcon(selectedSurvey.npsCategory)}
                        {selectedSurvey.npsCategory}
                      </span>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {(selectedSurvey.feedback?.positive ||
                  selectedSurvey.feedback?.improvement ||
                  selectedSurvey.feedback?.general) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Feedback</h3>
                    <div className="space-y-3">
                      {selectedSurvey.feedback.positive && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                          <p className="text-xs font-medium text-emerald-400 mb-1">What we did well</p>
                          <p className="text-sm text-white">{selectedSurvey.feedback.positive}</p>
                        </div>
                      )}
                      {selectedSurvey.feedback.improvement && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                          <p className="text-xs font-medium text-amber-400 mb-1">Areas for improvement</p>
                          <p className="text-sm text-white">{selectedSurvey.feedback.improvement}</p>
                        </div>
                      )}
                      {selectedSurvey.feedback.general && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <p className="text-xs font-medium text-blue-400 mb-1">Additional comments</p>
                          <p className="text-sm text-white">{selectedSurvey.feedback.general}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="pt-4 border-t border-gray-800/60">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800/50 border-2 border-transparent hover:border-gray-700/50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Surveys;