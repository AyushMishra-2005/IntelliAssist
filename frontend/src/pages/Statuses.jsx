import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lock, Search, X, ChevronDown } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Statuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [filteredStatuses, setFilteredStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    color: '#3B82F6',
    includeInActive: true,
    autoClose: false,
    autoCloseAfterDays: 7,
    order: 0,
  });

  useEffect(() => {
    fetchStatuses();
  }, []);

  useEffect(() => {
    const filtered = statuses.filter(status =>
      status.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStatuses(filtered);
  }, [searchTerm, statuses]);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/statuses');
      setStatuses(data.data);
      setFilteredStatuses(data.data);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
      toast.error('Failed to load statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStatus) {
        await api.put(`/statuses/${editingStatus._id}`, formData);
        toast.success('Status updated successfully');
      } else {
        await api.post('/statuses', formData);
        toast.success('Status created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchStatuses();
    } catch (error) {
      console.error('Failed to save status:', error);
      toast.error(error.response?.data?.message || 'Failed to save status');
    }
  };

  const handleEdit = (status) => {
    if (status.isSystem) {
      toast.error('Cannot edit system status');
      return;
    }
    setEditingStatus(status);
    setFormData({
      title: status.title,
      color: status.color,
      includeInActive: status.includeInActive,
      autoClose: status.autoClose,
      autoCloseAfterDays: status.autoCloseAfterDays || 7,
      order: status.order,
    });
    setShowModal(true);
  };

  const handleDelete = async (status) => {
    if (status.isSystem) {
      toast.error('Cannot delete system status');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this status?')) return;

    try {
      await api.delete(`/statuses/${status._id}`);
      toast.success('Status deleted successfully');
      fetchStatuses();
    } catch (error) {
      console.error('Failed to delete status:', error);
      toast.error('Failed to delete status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      color: '#3B82F6',
      includeInActive: true,
      autoClose: false,
      autoCloseAfterDays: 7,
      order: 0,
    });
    setEditingStatus(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const clearSearch = () => {
    setSearchTerm('');
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
        <p className="mt-6 text-gray-400 font-medium">Loading statuses...</p>
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
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Settings</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ticket Statuses
            </h1>
            <p className="text-gray-400 mt-1.5">Manage ticket status configurations</p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Plus size={20} />
            Add Status
          </button>
        </div>

        {/* Search */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 md:p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search statuses by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Statuses Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 border-b-2 border-gray-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Auto Close
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredStatuses.map((status) => (
                  <tr key={status._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-gray-400">{status.order}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white inline-block border-2 border-transparent"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.title}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-gray-700/50"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm text-gray-400 font-mono">{status.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${
                        status.includeInActive
                          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                          : 'text-gray-400 bg-gray-400/10 border-gray-400/20'
                      }`}>
                        {status.includeInActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {status.autoClose ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 text-blue-400 bg-blue-400/10 border-blue-400/20">
                          {status.autoCloseAfterDays} days
                        </span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {status.isSystem && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border-2 text-gray-400 bg-gray-400/10 border-gray-400/20">
                          <Lock size={12} />
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(status)}
                          disabled={status.isSystem}
                          className={`p-2 rounded-lg transition-all ${
                            status.isSystem
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                          }`}
                          title={status.isSystem ? 'Cannot edit system status' : 'Edit'}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(status)}
                          disabled={status.isSystem}
                          className={`p-2 rounded-lg transition-all ${
                            status.isSystem
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-400 hover:text-rose-400 hover:bg-rose-500/10'
                          }`}
                          title={status.isSystem ? 'Cannot delete system status' : 'Delete'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStatuses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <Lock size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No statuses found</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                {searchTerm 
                  ? 'No statuses match your search criteria. Try adjusting your search.'
                  : 'Get started by creating your first ticket status.'}
              </p>
              {searchTerm ? (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
                >
                  <Plus size={18} className="inline mr-2" />
                  Add your first status
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-2xl border-2 border-gray-700/70 max-w-md w-full shadow-2xl shadow-black/50 shadow-[0_0_50px_rgba(59,130,246,0.08)]">
              <div className="p-6 border-b-2 border-gray-700/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/30"></div>
                      <h2 className="text-xl font-bold text-white">
                        {editingStatus ? 'Edit Status' : 'Add Status'}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-400 ml-4">
                      {editingStatus ? 'Update status details' : 'Create a new ticket status'}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-800/50 rounded-lg transition-all text-gray-400 hover:text-white border-2 border-transparent hover:border-gray-700/50"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g., In Progress"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Color *
                  </label>
                  <div className="flex gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-14 h-14 rounded-lg border-2 border-gray-700/50 cursor-pointer bg-transparent p-1"
                      />
                      <div 
                        className="absolute inset-0 rounded-lg border-2 border-gray-700/50 pointer-events-none"
                        style={{ backgroundColor: formData.color }}
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      placeholder="#3B82F6"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="0"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeInActive"
                      checked={formData.includeInActive}
                      onChange={(e) => setFormData({ ...formData, includeInActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-700/50 bg-black/40 text-blue-500 focus:ring-blue-500/20 focus:ring-2"
                    />
                    <label htmlFor="includeInActive" className="text-sm text-gray-400 cursor-pointer">
                      Include in active tickets
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoClose"
                      checked={formData.autoClose}
                      onChange={(e) => setFormData({ ...formData, autoClose: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-700/50 bg-black/40 text-blue-500 focus:ring-blue-500/20 focus:ring-2"
                    />
                    <label htmlFor="autoClose" className="text-sm text-gray-400 cursor-pointer">
                      Auto-close tickets
                    </label>
                  </div>
                </div>

                {formData.autoClose && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Auto-close after (days)
                    </label>
                    <input
                      type="number"
                      value={formData.autoCloseAfterDays}
                      onChange={(e) => setFormData({ ...formData, autoCloseAfterDays: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      min="1"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-800/60">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-[1.02]"
                  >
                    {editingStatus ? 'Update Status' : 'Create Status'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-800/50 text-gray-400 rounded-lg font-medium hover:bg-gray-800/70 hover:text-white transition-all border border-gray-700/50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statuses;