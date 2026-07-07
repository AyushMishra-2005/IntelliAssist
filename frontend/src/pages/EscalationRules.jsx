import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff,
  Search,
  X,
  ChevronDown,
  AlertTriangle,
  Clock,
  Users,
  Mail,
  Bell,
  ArrowUpRight,
  Settings
} from 'lucide-react';

const EscalationRules = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 0,
    conditions: {
      timeInStatus: '',
      statusId: '',
      priority: '',
      departmentId: '',
    },
    actions: [],
  });
  const [statuses, setStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchRules();
    fetchStatuses();
    fetchDepartments();
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = rules.filter(rule =>
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRules(filtered);
  }, [searchTerm, rules]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/escalations');
      setRules(data.data || []);
      setFilteredRules(data.data || []);
    } catch (error) {
      console.error('Failed to fetch escalation rules:', error);
      toast.error('Failed to load escalation rules');
    } finally {
      setLoading(false);
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

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data.filter(u => u.role === 'admin' || u.role === 'agent') || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        priority: rule.priority || 0,
        conditions: rule.conditions,
        actions: rule.actions,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        priority: 0,
        conditions: {
          timeInStatus: '',
          statusId: '',
          priority: '',
          departmentId: '',
        },
        actions: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (formData.actions.length === 0) {
      toast.error('At least one action is required');
      return;
    }

    try {
      if (editingRule) {
        await api.put(`/escalations/${editingRule._id}`, formData);
        toast.success('Escalation rule updated successfully');
      } else {
        await api.post('/escalations', formData);
        toast.success('Escalation rule created successfully');
      }
      fetchRules();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save escalation rule:', error);
      toast.error(error.response?.data?.message || 'Failed to save escalation rule');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/escalations/${id}/toggle`);
      toast.success('Rule status updated');
      fetchRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      toast.error('Failed to update rule status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this escalation rule?')) {
      return;
    }

    try {
      await api.delete(`/escalations/${id}`);
      toast.success('Escalation rule deleted successfully');
      fetchRules();
    } catch (error) {
      console.error('Failed to delete escalation rule:', error);
      toast.error('Failed to delete escalation rule');
    }
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type: 'changeStatus', value: '' }],
    });
  };

  const updateAction = (index, field, value) => {
    const newActions = [...formData.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setFormData({ ...formData, actions: newActions });
  };

  const removeAction = (index) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index),
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getActionIcon = (type) => {
    const icons = {
      changeStatus: <ArrowUpRight size={14} />,
      assignTo: <Users size={14} />,
      sendEmail: <Mail size={14} />,
      sendNotification: <Bell size={14} />,
    };
    return icons[type] || <Settings size={14} />;
  };

  const getActionLabel = (type) => {
    const labels = {
      changeStatus: 'Change Status to',
      assignTo: 'Assign to',
      sendEmail: 'Send Email to',
      sendNotification: 'Send Notification to',
    };
    return labels[type] || type;
  };

  if (user?.role !== 'admin') {
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
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Automation</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Escalation Rules
            </h1>
            <p className="text-gray-400 mt-1.5">Automate ticket escalation based on conditions</p>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Plus size={20} />
            Create Rule
          </button>
        </div>

        {/* Search */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-4 md:p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search escalation rules by name or description..."
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

        {/* Rules List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-400 font-medium">Loading escalation rules...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900/30 rounded-xl border border-gray-800/60">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No rules found' : 'No escalation rules configured'}
            </h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {searchTerm 
                ? 'No rules match your search criteria. Try adjusting your search.'
                : 'Create your first escalation rule to automate ticket handling.'}
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
                onClick={() => handleOpenModal()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-105"
              >
                <Plus size={18} className="inline mr-2" />
                Create Your First Rule
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRules.map((rule) => (
              <div
                key={rule._id}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 hover:border-blue-500/30 transition-all p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{rule.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${
                          rule.isActive
                            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                            : 'text-gray-400 bg-gray-400/10 border-gray-400/20'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 text-blue-400 bg-blue-400/10 border-blue-400/20">
                        Priority: {rule.priority || 0}
                      </span>
                    </div>
                    {rule.description && (
                      <p className="text-gray-400 mb-3">{rule.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggle(rule._id)}
                      className={`p-2 rounded-lg transition-all ${
                        rule.isActive
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-gray-400 hover:bg-gray-800/50'
                      }`}
                      title={rule.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {rule.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                    <button
                      onClick={() => handleOpenModal(rule)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
                      className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-800/60">
                  {/* Conditions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                      <Clock size={16} />
                      Conditions
                    </h4>
                    <div className="space-y-1.5">
                      {rule.conditions.timeInStatus && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-gray-500">•</span>
                          <span>Time in status: <span className="text-white font-medium">{rule.conditions.timeInStatus} hours</span></span>
                        </div>
                      )}
                      {rule.conditions.statusId && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-gray-500">•</span>
                          <span>Status: <span className="text-white font-medium">
                            {statuses.find((s) => s._id === rule.conditions.statusId)?.title || 'Unknown'}
                          </span></span>
                        </div>
                      )}
                      {rule.conditions.priority && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-gray-500">•</span>
                          <span>Priority: <span className="text-white font-medium">{rule.conditions.priority}</span></span>
                        </div>
                      )}
                      {rule.conditions.departmentId && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-gray-500">•</span>
                          <span>Department: <span className="text-white font-medium">
                            {departments.find((d) => d._id === rule.conditions.departmentId)?.name || 'Unknown'}
                          </span></span>
                        </div>
                      )}
                      {!rule.conditions.timeInStatus && 
                       !rule.conditions.statusId && 
                       !rule.conditions.priority && 
                       !rule.conditions.departmentId && (
                        <p className="text-sm text-gray-500">No conditions set</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                      <ArrowUpRight size={16} />
                      Actions
                    </h4>
                    <div className="space-y-1.5">
                      {rule.actions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-gray-500">•</span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-800/50 text-xs">
                            {getActionIcon(action.type)}
                            {getActionLabel(action.type)}
                          </span>
                          <span className="text-white font-medium">
                            {action.type === 'changeStatus' && 
                              (statuses.find((s) => s._id === action.value)?.title || 'Unknown')}
                            {action.type === 'assignTo' && 
                              (users.find((u) => u._id === action.value)?.name || 'Unknown')}
                            {(action.type === 'sendEmail' || action.type === 'sendNotification') && 
                              action.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-2xl border-2 border-gray-700/70 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 shadow-[0_0_50px_rgba(59,130,246,0.08)]">
              <div className="p-6 border-b-2 border-gray-700/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-500/30"></div>
                      <h2 className="text-xl font-bold text-white">
                        {editingRule ? 'Edit Escalation Rule' : 'Create Escalation Rule'}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-400 ml-4">
                      {editingRule ? 'Update rule details' : 'Define conditions and actions for escalation'}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Rule Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g., High Priority Escalation"
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
                    rows={3}
                    className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    placeholder="Brief description of when this rule should trigger"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Priority (higher runs first)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="0"
                  />
                </div>

                {/* Conditions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Conditions</h3>
                  <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-gray-800/60">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Time in Status (hours)
                      </label>
                      <input
                        type="number"
                        value={formData.conditions.timeInStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            conditions: { ...formData.conditions, timeInStatus: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="e.g., 24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          value={formData.conditions.statusId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditions: { ...formData.conditions, statusId: e.target.value },
                            })
                          }
                          className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                        >
                          <option value="">Any Status</option>
                          {statuses.map((status) => (
                            <option key={status._id} value={status._id}>
                              {status.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Priority
                      </label>
                      <div className="relative">
                        <select
                          value={formData.conditions.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditions: { ...formData.conditions, priority: e.target.value },
                            })
                          }
                          className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                        >
                          <option value="">Any Priority</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Department
                      </label>
                      <div className="relative">
                        <select
                          value={formData.conditions.departmentId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditions: { ...formData.conditions, departmentId: e.target.value },
                            })
                          }
                          className="w-full appearance-none px-4 py-2.5 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                        >
                          <option value="">Any Department</option>
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
                </div>

                {/* Actions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-400">
                      Actions <span className="text-rose-400">*</span>
                    </h3>
                    <button
                      type="button"
                      onClick={addAction}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30"
                    >
                      <Plus size={16} />
                      Add Action
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.actions.map((action, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="relative">
                            <select
                              value={action.type}
                              onChange={(e) => updateAction(index, 'type', e.target.value)}
                              className="w-full appearance-none px-3 py-2.5 pr-8 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer text-sm"
                            >
                              <option value="changeStatus">Change Status</option>
                              <option value="assignTo">Assign To</option>
                              <option value="sendEmail">Send Email</option>
                              <option value="sendNotification">Send Notification</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                          </div>

                          {action.type === 'changeStatus' && (
                            <div className="relative">
                              <select
                                value={action.value}
                                onChange={(e) => updateAction(index, 'value', e.target.value)}
                                className="w-full appearance-none px-3 py-2.5 pr-8 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer text-sm"
                              >
                                <option value="">Select Status</option>
                                {statuses.map((status) => (
                                  <option key={status._id} value={status._id}>
                                    {status.title}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                            </div>
                          )}

                          {action.type === 'assignTo' && (
                            <div className="relative">
                              <select
                                value={action.value}
                                onChange={(e) => updateAction(index, 'value', e.target.value)}
                                className="w-full appearance-none px-3 py-2.5 pr-8 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer text-sm"
                              >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                  <option key={user._id} value={user._id}>
                                    {user.name} ({user.role})
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                            </div>
                          )}

                          {(action.type === 'sendEmail' || action.type === 'sendNotification') && (
                            <input
                              type="text"
                              value={action.value}
                              onChange={(e) => updateAction(index, 'value', e.target.value)}
                              placeholder="Enter recipient"
                              className="px-3 py-2.5 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAction(index)}
                          className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {formData.actions.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No actions added yet. Click "Add Action" to add one.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-800/60">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-[1.02]"
                  >
                    {editingRule ? 'Update Rule' : 'Create Rule'}
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

export default EscalationRules;