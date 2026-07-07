import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Users as UsersIcon, 
  Shield, 
  User, 
  Mail, 
  Search, 
  X,
  Calendar,
  CheckCircle,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/users');
      setUsers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      agent: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      user: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    };
    return classes[role] || classes.user;
  };

  const getRoleIcon = (role) => {
    if (role === 'admin') return <Shield size={14} />;
    if (role === 'agent') return <UsersIcon size={14} />;
    return <User size={14} />;
  };

  const getAuthProviderBadge = (provider) => {
    const badges = {
      google: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      local: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      github: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    };
    return badges[provider] || badges.local;
  };

  const getStatusBadge = (user) => {
    if (user.isEmailVerified) {
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
    return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  };

  const getStatusIcon = (user) => {
    if (user.isEmailVerified) {
      return <CheckCircle size={14} />;
    }
    return <Clock size={14} />;
  };

  const getStatusText = (user) => {
    if (user.isEmailVerified) {
      return 'Verified';
    }
    return 'Pending';
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    agents: users.filter((u) => u.role === 'agent').length,
    verified: users.filter((u) => u.isEmailVerified).length,
    googleAuth: users.filter((u) => u.authProvider === 'google').length,
  };

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'agent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
          <Shield size={32} className="text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
        <p className="text-gray-400 text-center max-w-md">
          You don't have permission to access this page.
        </p>
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
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Users
            </h1>
            <p className="text-gray-400 mt-1.5">Manage and monitor user accounts</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              Total: <span className="text-white font-semibold">{stats.total}</span>
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400 font-medium">Total</p>
              <UsersIcon size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400 font-medium">Admins</p>
              <Shield size={16} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.admins}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400 font-medium">Agents</p>
              <UsersIcon size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.agents}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400 font-medium">Verified</p>
              <CheckCircle size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.verified}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400 font-medium">Google Auth</p>
              <Mail size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.googleAuth}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  filter === 'all'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                    : 'bg-black/40 text-gray-400 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  filter === 'admin'
                    ? 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                    : 'bg-black/40 text-gray-400 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                Admins ({stats.admins})
              </button>
              <button
                onClick={() => setFilter('agent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  filter === 'agent'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                    : 'bg-black/40 text-gray-400 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                Agents ({stats.agents})
              </button>
              <button
                onClick={() => setFilter('user')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  filter === 'user'
                    ? 'bg-gray-600/20 text-gray-400 border-gray-500/30'
                    : 'bg-black/40 text-gray-400 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                Users ({stats.total - stats.admins - stats.agents})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-400 font-medium">Loading users...</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/40 border-b-2 border-gray-800/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Auth
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-3">
                            <UserX size={24} className="text-gray-500" />
                          </div>
                          <p className="text-gray-400">No users found</p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full border-2 border-gray-700/50"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Mail size={14} />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {getRoleIcon(user.role)}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${getStatusBadge(
                              user
                            )}`}
                          >
                            {getStatusIcon(user)}
                            {getStatusText(user)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${getAuthProviderBadge(
                              user.authProvider || 'local'
                            )}`}
                          >
                            {(user.authProvider || 'local').charAt(0).toUpperCase() + 
                             (user.authProvider || 'local').slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar size={14} />
                            <span className="text-sm">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;