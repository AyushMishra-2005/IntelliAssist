import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Paperclip, 
  FileText, 
  Send,
  X,
  FileUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Tag,
  Building2,
  AlertTriangle
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import TicketTemplatePicker from '../components/TicketTemplatePicker';

const CreateTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    department: '',
    tags: '',
  });

  useEffect(() => {
    fetchDepartments();

    if (location.state?.template) {
      handleTemplateSelect(location.state.template);
    }
  }, [location]);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      description: template.content,
      priority: template.priority.charAt(0).toUpperCase() + template.priority.slice(1),
      department: template.department?._id || '',
      tags: template.tags?.join(', ') || '',
    });
    setShowTemplatePicker(false);
    toast.success(`Template "${template.name}" applied`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.department) {
      toast.error('Department is required');
      return;
    }

    setLoading(true);
    try {
      const ticketData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };

      const response = await ticketService.createTicket(ticketData);
      setCreatedTicketId(response.data._id);
      toast.success('Ticket created successfully!');

      setShowFileUpload(true);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
      setLoading(false);
    }
  };

  const handleSkipFiles = () => {
    navigate(`/tickets/${createdTicketId}`);
  };

  const handleFilesUploaded = () => {
    navigate(`/tickets/${createdTicketId}`);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      High: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      Critical: 'text-rose-400 bg-rose-400/10 border-rose-400/20'
    };
    return colors[priority] || colors.Medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      Low: <CheckCircle size={16} />,
      Medium: <Clock size={16} />,
      High: <AlertTriangle size={16} />,
      Critical: <AlertCircle size={16} />
    };
    return icons[priority] || icons.Medium;
  };

  return (
    <div className="min-h-screen bg-black p-6 md:p-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">New Request</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Create Ticket
            </h1>
            {selectedTemplate && (
              <p className="text-gray-400 mt-1.5 flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                Using template: <span className="text-white font-medium">{selectedTemplate.name}</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTemplatePicker(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30 hover:shadow-lg hover:shadow-blue-600/10"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">Use Template</span>
            </button>
            <button
              onClick={() => navigate('/tickets')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/60 p-6 lg:p-8">
          {!showFileUpload ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter a brief summary of the issue..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder="Provide detailed information about the issue..."
                  required
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formData.description.length} characters
                  </span>
                  <span className="text-xs text-gray-500">
                    Minimum 10 characters
                  </span>
                </div>
              </div>

              {/* Priority & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                    Priority <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <AlertTriangle size={16} className="text-gray-500" />
                    </div>
                  </div>
                  {formData.priority && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${getPriorityColor(formData.priority)} border`}>
                        {getPriorityIcon(formData.priority)}
                        {formData.priority} Priority
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">
                    Department <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 pr-10 bg-black/40 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Building2 size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Tag size={16} />
                    Tags (optional)
                  </span>
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="bug, urgent, login, payment..."
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Separate multiple tags with commas
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-800/60">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Create Ticket
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/tickets')}
                  className="px-6 py-3 bg-gray-800/50 text-gray-400 rounded-lg font-medium hover:bg-gray-800/70 hover:text-white transition-all border border-gray-700/50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* File Upload Section */
            <div className="space-y-8">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 mb-4">
                  <Paperclip size={36} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Add Attachments
                </h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Upload screenshots, logs, or documents to help us resolve your issue faster
                </p>
              </div>

              <div className="border-t border-gray-800/60 pt-6">
                <FileUpload
                  ticketId={createdTicketId}
                  onUploadComplete={handleFilesUploaded}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800/60">
                <button
                  onClick={handleFilesUploaded}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all hover:scale-[1.02]"
                >
                  <FileUp size={18} />
                  Continue to Ticket
                </button>
                <button
                  onClick={handleSkipFiles}
                  className="px-6 py-3 bg-gray-800/50 text-gray-400 rounded-lg font-medium hover:bg-gray-800/70 hover:text-white transition-all border border-gray-700/50"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Template Picker Modal */}
        {showTemplatePicker && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-xl border border-gray-800/60 shadow-2xl">
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
              >
                <X size={20} />
              </button>
              <div className="p-6">
                <TicketTemplatePicker
                  onSelect={handleTemplateSelect}
                  onClose={() => setShowTemplatePicker(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTicket;