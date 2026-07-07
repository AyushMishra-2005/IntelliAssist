import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, ChevronDown, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    isHidden: false,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filtered = departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDepartments(filtered);
  }, [searchTerm, departments]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/departments?includeHidden=true');
      setDepartments(data.data);
      setFilteredDepartments(data.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept._id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', formData);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      console.error('Failed to save department:', error);
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      email: dept.email,
      isHidden: dept.isHidden,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.error('Failed to delete department');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      email: '',
      isHidden: false,
    });
    setEditingDept(null);
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
        <p className="mt-6 text-gray-400 font-medium">Loading departments...</p>
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
              Departments
            </h1>
            <p className="text-gray-400 mt-1.5">Manage your organization departments</p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Plus size={20} />
            Add Department
          </button>
        </div>

        {/* Search */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 md:p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search departments by name, email, or description..."
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

        {/* Departments Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 border-b-2 border-gray-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredDepartments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-medium text-white">{dept.name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-400">{dept.email}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-400">{dept.description || '-'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${
                        dept.isHidden
                          ? 'text-gray-400 bg-gray-400/10 border-gray-400/20'
                          : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                      }`}>
                        {dept.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        {dept.isHidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept._id)}
                          className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete"
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

          {filteredDepartments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <Eye size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No departments found</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                {searchTerm 
                  ? 'No departments match your search criteria. Try adjusting your search.'
                  : 'Get started by creating your first department.'}
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
                  Add your first department
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
                        {editingDept ? 'Edit Department' : 'Add Department'}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-400 ml-4">
                      {editingDept ? 'Update department details' : 'Create a new department'}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g., Technical Support"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g., support@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    rows="3"
                    placeholder="Brief description of the department"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isHidden"
                    checked={formData.isHidden}
                    onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700/50 bg-black/40 text-blue-500 focus:ring-blue-500/20 focus:ring-2"
                  />
                  <label htmlFor="isHidden" className="text-sm text-gray-400 cursor-pointer">
                    Hide from users (admin only)
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-800/60">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-[1.02]"
                  >
                    {editingDept ? 'Update Department' : 'Create Department'}
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

export default Departments;