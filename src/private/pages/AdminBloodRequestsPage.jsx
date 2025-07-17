import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Loader2, 
  AlertTriangle, 
  ArrowLeft, 
  Trash2, 
  Shield, 
  CheckCircle, 
  X as XIcon,
  Edit3,
  AlertCircle,
  Filter,
  RotateCcw,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { bloodRequestAPI } from '../../utils/api';
import { showToast } from '../../utils/toast';
import AdminSidebar from '../AdminSidebar';

const urgencyColors = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const AdminBloodRequestsPage = ({ isDarkMode, toggleDarkMode }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, request: null });
  const [spamModal, setSpamModal] = useState({ open: false, request: null });
  const [completeModal, setCompleteModal] = useState({ open: false, request: null });
  const [revertModal, setRevertModal] = useState({ open: false, request: null });
  const [adminNotes, setAdminNotes] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, spam, trash, completed
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bloodRequestAPI.getAll();
        
        // Handle different response structures
        const bloodRequests = res.bloodRequests || res.data?.bloodRequests || [];
        console.log('Blood requests loaded:', bloodRequests.length);
        console.log('First request:', bloodRequests[0]);
        
        setRequests(bloodRequests);
      } catch (err) {
        console.error('Failed to fetch blood requests:', err);
        setError(err.message || 'Failed to fetch blood requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Delete blood request
  const handleDelete = async () => {
    if (!deleteModal.request) return;
    
    setActionLoading(deleteModal.request.id);
    try {
      await bloodRequestAPI.delete(deleteModal.request.id);
      setRequests(prev => prev.filter(r => r.id !== deleteModal.request.id));
      setDeleteModal({ open: false, request: null });
      showToast.success('Blood request deleted successfully');
    } catch (err) {
      showToast.error(err.message || 'Failed to delete blood request');
    } finally {
      setActionLoading(null);
    }
  };

  // Mark as spam
  const handleMarkAsSpam = async () => {
    if (!spamModal.request) return;
    
    setActionLoading(spamModal.request.id);
    try {
      await bloodRequestAPI.markAsSpam(spamModal.request.id, adminNotes);
      setRequests(prev => prev.map(r => 
        r.id === spamModal.request.id 
          ? { ...r, is_spam: true, admin_notes: adminNotes, marked_spam_at: new Date().toISOString() }
          : r
      ));
      setSpamModal({ open: false, request: null });
      setAdminNotes('');
      showToast.success('Blood request marked as spam');
    } catch (err) {
      showToast.error(err.message || 'Failed to mark blood request as spam');
    } finally {
      setActionLoading(null);
    }
  };

  // Mark as completed
  const handleMarkAsCompleted = async () => {
    if (!completeModal.request) return;
    
    setActionLoading(completeModal.request.id);
    try {
      await bloodRequestAPI.markAsCompleted(completeModal.request.id, adminNotes);
      setRequests(prev => prev.map(r => 
        r.id === completeModal.request.id 
          ? { ...r, status: 'completed', admin_notes: adminNotes, completed_at: new Date().toISOString() }
          : r
      ));
      setCompleteModal({ open: false, request: null });
      setAdminNotes('');
      showToast.success('Blood request marked as completed');
    } catch (err) {
      showToast.error(err.message || 'Failed to mark blood request as completed');
    } finally {
      setActionLoading(null);
    }
  };

  // Revert blood request
  const handleRevert = async () => {
    if (!revertModal.request) return;
    
    setActionLoading(revertModal.request.id);
    try {
      await bloodRequestAPI.revert(revertModal.request.id, adminNotes);
      setRequests(prev => prev.map(r => 
        r.id === revertModal.request.id 
          ? { 
              ...r, 
              status: 'pending', 
              is_spam: false, 
              admin_notes: adminNotes, 
              completed_at: null, 
              marked_spam_at: null 
            }
          : r
      ));
      setRevertModal({ open: false, request: null });
      setAdminNotes('');
      showToast.success('Blood request reverted to pending status');
    } catch (err) {
      showToast.error(err.message || 'Failed to revert blood request');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter requests based on active filter
  const filteredRequests = requests.filter(request => {
    switch (activeFilter) {
      case 'spam':
        return request.is_spam === true;
      case 'trash':
        return request.status === 'cancelled';
      case 'completed':
        return request.status === 'completed';
      case 'pending':
        return request.status === 'pending' && !request.is_spam;
      default:
        return true; // Show all
    }
  });
  
  console.log('Filtered requests:', filteredRequests.length, 'from', requests.length, 'total (filter:', activeFilter, ')');

  // Get counts for each filter
  const filterCounts = {
    all: requests.length,
    spam: requests.filter(r => r.is_spam === true).length,
    trash: requests.filter(r => r.status === 'cancelled').length,
    completed: requests.filter(r => r.status === 'completed').length,
    pending: requests.filter(r => r.status === 'pending' && !r.is_spam).length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10">
        <div className="flex items-center mb-8 gap-4">
          <button
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blood Requests</h1>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            All ({filterCounts.all})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Pending ({filterCounts.pending})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
              activeFilter === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Completed ({filterCounts.completed})
          </button>
          <button
            onClick={() => setActiveFilter('spam')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
              activeFilter === 'spam'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Spam ({filterCounts.spam})
          </button>
          <button
            onClick={() => setActiveFilter('trash')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
              activeFilter === 'trash'
                ? 'bg-gray-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Trash ({filterCounts.trash})
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-10 h-10 mb-2" />
            <span className="text-lg font-semibold">{error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blood Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No blood requests found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req, idx) => (
                    <tr key={req.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition ${req.is_spam ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 dark:text-white">{req.patient_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{req.patient_age} yrs, {req.patient_gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {req.user ? (
                          <button
                            className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium"
                            onClick={() => navigate(`/admin/users/${req.user.id}`)}
                            title={`${req.user.full_name} (${req.user.email})`}
                          >
                            {req.user.full_name}
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-red-600 dark:text-red-400">{req.blood_type}{req.rh_factor}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{req.contact_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{req.contact_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[req.status] || statusColors.pending}`}>
                            {req.status || 'pending'}
                          </span>
                          {req.is_spam && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              SPAM
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${urgencyColors[req.urgency] || urgencyColors.low}`}>{req.urgency}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{req.hospital_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{req.hospital_address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{req.required_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded transition"
                            onClick={() => navigate(`/admin/blood-requests/${req.id}`)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {!req.is_spam && req.status !== 'completed' && (
                            <button
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-1 rounded transition"
                              onClick={() => setCompleteModal({ open: true, request: req })}
                              title="Mark as Completed"
                              disabled={actionLoading === req.id}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          {!req.is_spam && (
                            <button
                              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 p-1 rounded transition"
                              onClick={() => setSpamModal({ open: true, request: req })}
                              title="Mark as Spam"
                              disabled={actionLoading === req.id}
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          
                          {(req.is_spam || req.status === 'completed') && (
                            <button
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded transition"
                              onClick={() => setRevertModal({ open: true, request: req })}
                              title="Revert to Pending"
                              disabled={actionLoading === req.id}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded transition"
                            onClick={() => setDeleteModal({ open: true, request: req })}
                            title="Delete Request"
                            disabled={actionLoading === req.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Delete Modal */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Delete Blood Request</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this blood request for <span className="font-bold">{deleteModal.request?.patient_name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, request: null })}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading === deleteModal.request?.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spam Modal */}
        {spamModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Mark as Spam</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Mark this blood request for <span className="font-bold">{spamModal.request?.patient_name}</span> as spam.
              </p>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional admin notes..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 mb-4"
                rows={3}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSpamModal({ open: false, request: null });
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsSpam}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading === spamModal.request?.id ? 'Marking...' : 'Mark as Spam'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Modal */}
        {completeModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Mark as Completed</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Mark this blood request for <span className="font-bold">{completeModal.request?.patient_name}</span> as completed.
              </p>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional admin notes..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
                rows={3}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setCompleteModal({ open: false, request: null });
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsCompleted}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading === completeModal.request?.id ? 'Marking...' : 'Mark as Completed'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revert Modal */}
        {revertModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Revert to Pending</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Revert this blood request for <span className="font-bold">{revertModal.request?.patient_name}</span> back to pending status and remove spam/completed flags.
              </p>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional admin notes..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                rows={3}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setRevertModal({ open: false, request: null });
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevert}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading === revertModal.request?.id ? 'Reverting...' : 'Revert to Pending'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBloodRequestsPage; 