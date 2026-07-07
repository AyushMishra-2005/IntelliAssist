import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown,
  Calendar,
  AlertCircle,
  Clock,
  Tag
} from 'lucide-react';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
  });
  const [departments, setDepartments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchDepartments();
    fetchStatuses();
  }, [search, filters]);

  const fetchTickets = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.department && { department: filters.department }),
      });

      const { data } = await api.get(`/tickets?${params}`);
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
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

  const fetchStatuses = async () => {
    try {
      const { data } = await api.get('/statuses');
      setStatuses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    }
  };

  const getPriorityClasses = (priority) => {
    const classes = {
      low: 'bg-green-500/20 text-green-400 border border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return classes[priority.toLowerCase()] || classes.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: <AlertCircle size={14} />,
      medium: <Clock size={14} />,
      high: <AlertCircle size={14} />,
      critical: <AlertCircle size={14} />
    };
    return icons[priority.toLowerCase()] || icons.medium;
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', department: '' });
    setSearch('');
  };

  const hasActiveFilters = filters.status || filters.priority || filters.department || search;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Tickets</h1>
          <p className="text-gray-400 mt-1">Manage and track all support tickets</p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-600/20 transition-all hover:scale-105"
        >
          <Plus size={20} />
          Create Ticket
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tickets by title, ticket number, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                : 'bg-black/50 text-gray-400 border-gray-700/50 hover:border-gray-600'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            )}
            <ChevronDown 
              size={16} 
              className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800/60">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status._id} value={status._id}>
                      {status.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Priority</label>
              <div className="relative">
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Department</label>
              <div className="relative">
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && tickets.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            {pagination.total && ` · ${pagination.total} total`}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900/30 rounded-xl border border-gray-800/60">
          <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
            <Ticket size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No tickets found</h3>
          <p className="text-gray-400 text-center max-w-md mb-6">
            {hasActiveFilters 
              ? 'No tickets match your current filters. Try adjusting your search criteria.'
              : 'Get started by creating your first support ticket.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to="/tickets/new"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-600/20 transition-all"
            >
              Create Ticket
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Ticket Grid */}
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/tickets/${ticket._id}`}
                className="group bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-5 hover:border-blue-500/30 hover:bg-gray-900/70 transition-all hover:shadow-lg hover:shadow-blue-600/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-blue-400 bg-blue-600/10 px-3 py-1 rounded-lg border border-blue-500/20">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: ticket.status?.color }}
                      >
                        {ticket.status?.title}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {ticket.title}
                    </h3>
                    {ticket.description && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${getPriorityClasses(ticket.priority)}`}>
                        {getPriorityIcon(ticket.priority)}
                        {ticket.priority}
                      </span>
                    </div>
                    
                    {ticket.department && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Tag size={14} />
                        <span>{ticket.department.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{new Date(ticket.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              <button
                onClick={() => fetchTickets(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800/60 text-gray-400 hover:text-white hover:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  let pageNum;
                  const current = pagination.page;
                  const total = pagination.pages;
                  
                  if (total <= 7) {
                    pageNum = i + 1;
                  } else if (current <= 4) {
                    pageNum = i + 1;
                  } else if (current >= total - 3) {
                    pageNum = total - 6 + i;
                  } else {
                    pageNum = current - 3 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchTickets(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        pageNum === pagination.page
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-gray-900/50 border border-gray-800/60 text-gray-400 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => fetchTickets(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800/60 text-gray-400 hover:text-white hover:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicketList;