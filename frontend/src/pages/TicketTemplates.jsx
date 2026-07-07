import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  TrendingUp,
  Filter,
  FileText,
  Bug,
  Lightbulb,
  CreditCard,
  Key,
  Lock,
  Wrench,
  Download,
  Plug,
  Gauge,
  Shield,
  UserX,
  HelpCircle,
  Settings,
  Zap,
  Target,
  ChevronDown,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TicketTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    tags: '',
    visibility: 'private',
    department: '',
    isPublic: false,
    icon: 'FileText',
    color: '#3B82F6',
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' },
    { value: 'account', label: 'Account' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'general', label: 'General' },
    { value: 'other', label: 'Other' },
  ];

  const iconOptions = [
    { name: 'FileText', component: FileText },
    { name: 'Bug', component: Bug },
    { name: 'Lightbulb', component: Lightbulb },
    { name: 'CreditCard', component: CreditCard },
    { name: 'Key', component: Key },
    { name: 'Lock', component: Lock },
    { name: 'Wrench', component: Wrench },
    { name: 'Download', component: Download },
    { name: 'Plug', component: Plug },
    { name: 'Gauge', component: Gauge },
    { name: 'Shield', component: Shield },
    { name: 'UserX', component: UserX },
    { name: 'HelpCircle', component: HelpCircle },
    { name: 'Settings', component: Settings },
    { name: 'Zap', component: Zap },
    { name: 'Target', component: Target },
  ];
  
  const colors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#6366F1',
  ];

  const renderIcon = (iconName, size = 24, className = '') => {
    const iconOption = iconOptions.find((opt) => opt.name === iconName);
    if (iconOption) {
      const IconComponent = iconOption.component;
      return <IconComponent size={size} className={className} />;
    }
    return <FileText size={size} className={className} />;
  };

  useEffect(() => {
    fetchTemplates();
    fetchDepartments();
  }, [selectedCategory, searchTerm]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_URL}/ticket-templates?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data);
      setFilteredTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        department: formData.visibility === 'department' ? formData.department : undefined,
      };

      if (editingTemplate) {
        await axios.put(`${API_URL}/ticket-templates/${editingTemplate._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Template updated successfully');
      } else {
        await axios.post(`${API_URL}/ticket-templates`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Template created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.message || 'Error saving template');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/ticket-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Error deleting template');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/ticket-templates/${id}/duplicate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Error duplicating template');
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/ticket-templates/${template._id}/usage`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate('/tickets/create', { state: { template } });
    } catch (error) {
      console.error('Error recording usage:', error);
      navigate('/tickets/create', { state: { template } });
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      title: template.title,
      content: template.content,
      category: template.category,
      priority: template.priority,
      tags: template.tags?.join(', ') || '',
      visibility: template.visibility,
      department: template.department?._id || '',
      isPublic: template.isPublic || false,
      icon: template.icon || 'FileText',
      color: template.color || '#3B82F6',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      tags: '',
      visibility: 'private',
      department: '',
      isPublic: false,
      icon: 'FileText',
      color: '#3B82F6',
    });
    setEditingTemplate(null);
  };

  const getVisibilityBadge = (visibility) => {
    const badges = {
      private: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
      department: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      global: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      public: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    };
    return badges[visibility] || badges.private;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
      medium: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      urgent: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    };
    return badges[priority] || badges.medium;
  };

  const getCategoryBadge = (category) => {
    const badges = {
      technical: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      billing: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      account: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      feature_request: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      bug_report: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
      general: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
      other: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    };
    return badges[category] || badges.general;
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-400 font-medium">Loading templates...</p>
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
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Templates</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ticket Templates
            </h1>
            <p className="text-gray-400 mt-1.5">Create tickets faster with pre-defined templates</p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Plus size={20} />
            New Template
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search templates by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="md:w-64 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearSearch}
                className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900/30 rounded-xl border border-gray-800/60">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <FileText size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {hasActiveFilters 
                ? 'No templates match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first template.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearSearch}
                className="px-6 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
              >
                <Plus size={18} className="inline mr-2" />
                Create your first template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template._id}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 hover:border-blue-500/40 hover:bg-gray-900/70 transition-all hover:shadow-lg hover:shadow-blue-600/5 overflow-hidden group"
              >
                <div
                  className="h-1.5"
                  style={{ backgroundColor: template.color || '#3B82F6' }}
                ></div>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="p-2.5 rounded-xl border border-gray-700/50 group-hover:border-blue-500/30 transition-all"
                      style={{ backgroundColor: `${template.color}15` }}
                    >
                      <span style={{ color: template.color || '#3B82F6' }}>
                        {renderIcon(template.icon, 24)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1 truncate">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border-2 ${getVisibilityBadge(
                            template.visibility
                          )}`}
                        >
                          {template.visibility}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border-2 ${getPriorityBadge(
                            template.priority
                          )}`}
                        >
                          {template.priority}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border-2 ${getCategoryBadge(
                            template.category
                          )}`}
                        >
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Ticket Title:</p>
                    <p className="text-sm text-gray-300 line-clamp-1">{template.title}</p>
                  </div>

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded-lg border border-gray-700/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      <span>Used {template.usageCount || 0} times</span>
                    </div>
                    {template.department && (
                      <span className="text-blue-400">{template.department.name}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-600/20 transition-all text-sm font-medium hover:scale-[1.02]"
                    >
                      <FileText size={16} />
                      Use Template
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="px-3 py-2 bg-black/40 text-gray-400 rounded-lg hover:bg-gray-800/50 hover:text-white transition-all border border-gray-700/50 hover:border-gray-600"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template._id)}
                      className="px-3 py-2 bg-black/40 text-gray-400 rounded-lg hover:bg-gray-800/50 hover:text-white transition-all border border-gray-700/50 hover:border-gray-600"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="px-3 py-2 bg-black/40 text-gray-400 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-all border border-gray-700/50 hover:border-rose-500/30"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-2xl border-2 border-gray-700/70 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 shadow-[0_0_50px_rgba(59,130,246,0.08)]">
              <div className="p-6 border-b-2 border-gray-700/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/30"></div>
                      <h2 className="text-xl font-bold text-white">
                        {editingTemplate ? 'Edit Template' : 'Create Template'}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-400 ml-4">
                      {editingTemplate ? 'Update your template details' : 'Create a new ticket template'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-800/50 rounded-lg transition-all text-gray-400 hover:text-white border-2 border-transparent hover:border-gray-700/50"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">
                          Template Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="e.g., Password Reset Request"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">
                          Category
                        </label>
                        <div className="relative">
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                          >
                            {categories.filter((c) => c.value !== 'all').map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Description
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Brief description of this template"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Ticket Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Default title for tickets created from this template"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Ticket Content *
                      </label>
                      <textarea
                        required
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                        placeholder="Default content for tickets..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">
                          Default Priority
                        </label>
                        <div className="relative">
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="password, reset, account"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Icon</label>
                        <div className="flex gap-2 flex-wrap">
                          {iconOptions.slice(0, 8).map((iconOption) => (
                            <button
                              key={iconOption.name}
                              type="button"
                              onClick={() => setFormData({ ...formData, icon: iconOption.name })}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                formData.icon === iconOption.name
                                  ? 'border-blue-500/60 bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                  : 'border-gray-700/50 hover:border-gray-600 text-gray-400 hover:text-white'
                              }`}
                            >
                              {renderIcon(iconOption.name, 20)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Color</label>
                        <div className="flex gap-2 flex-wrap">
                          {colors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, color })}
                              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                formData.color === color
                                  ? 'border-blue-500/60 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                  : 'border-gray-700/50 hover:border-gray-600'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">
                          Visibility
                        </label>
                        <div className="relative">
                          <select
                            value={formData.visibility}
                            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                            className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                          >
                            <option value="private">Private (Only Me)</option>
                            <option value="department">Department</option>
                            <option value="global">Global (All Users)</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                      </div>

                      {formData.visibility === 'department' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">
                            Department
                          </label>
                          <div className="relative">
                            <select
                              value={formData.department}
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                              className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                              required={formData.visibility === 'department'}
                            >
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept._id} value={dept._id}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-700/50 bg-black/40 text-blue-500 focus:ring-blue-500/20 focus:ring-2"
                        />
                        Make this template public (visible to non-authenticated users)
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800/60">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-[1.02]"
                    >
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-6 py-3 bg-gray-800/50 text-gray-400 rounded-lg font-medium hover:bg-gray-800/70 hover:text-white transition-all border border-gray-700/50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketTemplates;