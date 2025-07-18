import React, { useState, useEffect } from 'react';
import { bloodRequestAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Shield, 
  PartyPopper, 
  Clipboard, 
  Link, 
  RotateCcw,
  Pin
} from 'lucide-react';

const ActivityLogModal = ({ isOpen, onClose, bloodRequestId, patientName }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (isOpen && bloodRequestId) {
      fetchActivityLogs();
    }
  }, [isOpen, bloodRequestId]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await bloodRequestAPI.getActivityLogs(bloodRequestId);
      if (response.success) {
        setLogs(response.logs);
      } else {
        toast.error('Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const response = await bloodRequestAPI.addAdminNote(bloodRequestId, newNote.trim());
      if (response.success) {
        setNewNote('');
        await fetchActivityLogs(); // Refresh logs
        toast.success('Note added successfully');
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const getActivityIcon = (activityType) => {
    const iconMap = {
      created: <FileText className="w-5 h-5" />,
      donor_accepted: <CheckCircle className="w-5 h-5" />,
      donor_rejected: <XCircle className="w-5 h-5" />,
      status_changed: <RefreshCw className="w-5 h-5" />,
      marked_spam: <Shield className="w-5 h-5" />,
      marked_completed: <CheckCircle className="w-5 h-5" />,
      admin_note_added: <Clipboard className="w-5 h-5" />,
      connection_requested: <Link className="w-5 h-5" />,
      reverted_to_pending: <RotateCcw className="w-5 h-5" />,
      donation_completed: <PartyPopper className="w-5 h-5" />,
      requester_confirmation: <CheckCircle className="w-5 h-5" />
    };
    return iconMap[activityType] || <Pin className="w-5 h-5" />;
  };

  const getActivityColor = (activityType) => {
    const colorMap = {
      created: 'text-blue-600',
      donor_accepted: 'text-green-600',
      donor_rejected: 'text-red-600',
      status_changed: 'text-purple-600',
      marked_spam: 'text-red-700',
      marked_completed: 'text-green-700',
      admin_note_added: 'text-indigo-600',
      connection_requested: 'text-blue-500',
      reverted_to_pending: 'text-orange-600',
      donation_completed: 'text-emerald-600',
      requester_confirmation: 'text-cyan-600'
    };
    return colorMap[activityType] || 'text-gray-600';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Activity History</h2>
              <p className="text-red-100 mt-1">Patient: {patientName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Add Note Section */}
          <div className="p-6 bg-gray-50 border-b">
            <form onSubmit={handleAddNote} className="flex gap-3">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an admin note..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={addingNote}
              />
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addingNote ? 'Adding...' : 'Add Note'}
              </button>
            </form>
          </div>

          {/* Activity Logs */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No activity logs found for this blood request.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(log.activity_type).replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100').replace('-500', '-100')} ${getActivityColor(log.activity_type)}`}>
                        {getActivityIcon(log.activity_type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-medium ${getActivityColor(log.activity_type)}`}>
                            {log.description}
                          </p>
                          {log.user && (
                            <p className="text-sm text-gray-600 mt-1">
                              by {log.user.fullName || log.user.full_name || 'Unknown User'}
                            </p>
                          )}
                          {log.old_value && log.new_value && (
                            <div className="mt-2 text-sm text-gray-700">
                              <span className="line-through text-red-500">{log.old_value}</span>
                              {' → '}
                              <span className="text-green-600">{log.new_value}</span>
                            </div>
                          )}
                          {log.metadata && (
                            <div className="mt-2 text-xs text-gray-500">
                              {log.metadata.reason && (
                                <p>Reason: {log.metadata.reason}</p>
                              )}
                              {log.metadata.admin_notes && (
                                <p>Notes: {log.metadata.admin_notes}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogModal;
