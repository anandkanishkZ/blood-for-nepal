import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  AlertTriangle, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Heart,
  Activity,
  Clock,
  UserCheck,
  UserX,
  LogIn,
  Info,
  Unlock,
  Ban
} from 'lucide-react';
import { authAPI } from '../../utils/api';
import { showToast } from '../../utils/toast';
import AdminSidebar from '../AdminSidebar';

// Utility function to construct full avatar URL
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  return `${baseUrl}${avatarPath}`;
};

const AdminUserProfilePage = ({ isDarkMode, toggleDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [blockModal, setBlockModal] = useState({ open: false });
  const [blockNote, setBlockNote] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.getUserById(id);
        setUser(response.data.user);
      } catch (err) {
        setError(err.message || 'Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleBlockUser = async () => {
    if (!user || !blockNote.trim()) return;
    setActionLoading(true);
    try {
      await authAPI.blockUser(user.id, blockNote);
      setUser(prev => ({ ...prev, is_active: false, block_note: blockNote }));
      setBlockModal({ open: false });
      setBlockNote('');
      showToast.success('User blocked successfully.');
    } catch (err) {
      showToast.error(err?.data?.message || err?.message || 'Failed to block user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await authAPI.unblockUser(user.id);
      setUser(prev => ({ ...prev, is_active: true, block_note: null }));
      showToast.success('User unblocked successfully.');
    } catch (err) {
      showToast.error(err?.data?.message || err?.message || 'Failed to unblock user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonateUser = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      // Save current admin token
      const adminToken = localStorage.getItem('token');
      localStorage.setItem('admin_impersonation_token', adminToken);
      
      // Get impersonation token
      const res = await authAPI.impersonateUser(user.id);
      const token = res?.data?.token || res.token;
      
      if (token) {
        localStorage.setItem('token', token);
        showToast.success(`Now impersonating ${user.full_name}`);
        window.location.href = '/profile';
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      showToast.error(err?.data?.message || err?.message || 'Failed to impersonate user.');
    } finally {
      setActionLoading(false);
    }
  };

  const getUserStatusColor = (user) => {
    if (!user.is_active) return 'text-red-600 bg-red-100 border-red-200';
    if (user.is_email_verified || user.is_phone_verified) return 'text-green-600 bg-green-100 border-green-200';
    return 'text-yellow-600 bg-yellow-100 border-yellow-200';
  };

  const getUserStatusText = (user) => {
    if (!user.is_active) return 'Blocked';
    if (user.is_email_verified || user.is_phone_verified) return 'Active';
    return 'Pending Verification';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Users
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The requested user could not be found.</p>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Users
            </button>
          </div>
        </main>
      </div>
    );
  }

  const avatarUrl = user.avatar 
    ? getFullAvatarUrl(user.avatar) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=F87171&color=fff`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-10">
        {/* Header */}
        <div className="flex items-center mb-8 gap-4">
          <button
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={avatarUrl}
                alt={user.full_name || 'User'}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUserStatusColor(user)}`}>
                    {getUserStatusText(user)}
                  </span>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <Shield className="w-4 h-4 mr-1" />
                      Admin
                    </span>
                  )}
                  {user.is_donor && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      <Heart className="w-4 h-4 mr-1" />
                      Donor
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {user.role === 'user' && (
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {user.is_active ? (
                <>
                  <button
                    onClick={() => setBlockModal({ open: true })}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    Block User
                  </button>
                  <button
                    onClick={handleImpersonateUser}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    Impersonate
                  </button>
                </>
              ) : (
                <button
                  onClick={handleUnblockUser}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Unlock className="w-4 h-4" />
                  Unblock User
                </button>
              )}
            </div>
          )}
        </div>

        {/* Block Note Alert */}
        {user.block_note && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Block Reason</h3>
                <p className="text-red-700 dark:text-red-300 mt-1 whitespace-pre-line">{user.block_note}</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Blocked on: {new Date(user.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                  <p className="text-gray-900 dark:text-white">{user.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                  <p className="text-gray-900 dark:text-white">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Gender</label>
                  <p className="text-gray-900 dark:text-white capitalize">{user.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date of Birth</label>
                  <p className="text-gray-900 dark:text-white">
                    {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Blood Type</label>
                  <p className="text-gray-900 dark:text-white">
                    {user.blood_type ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {user.blood_type}
                      </span>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
              </div>
              {user.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Address</label>
                  <p className="text-gray-900 dark:text-white">{user.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Medical Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Donor Status</label>
                <p className="text-gray-900 dark:text-white">
                  {user.is_donor ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Heart className="w-3 h-3 mr-1" />
                      Active Donor
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      Not a Donor
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Emergency Contact</label>
                <p className="text-gray-900 dark:text-white">{user.emergency_contact || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Medical Conditions</label>
                <p className="text-gray-900 dark:text-white">{user.medical_conditions || 'None reported'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Approximate Weight</label>
                <p className="text-gray-900 dark:text-white">{user.approximate_weight ? `${user.approximate_weight} kg` : 'Not provided'}</p>
              </div>
              {user.last_donation_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Donation</label>
                  <p className="text-gray-900 dark:text-white">{new Date(user.last_donation_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Account Status</label>
              <p className="text-gray-900 dark:text-white">{getUserStatusText(user)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email Verified</label>
              <p className="text-gray-900 dark:text-white">
                {user.is_email_verified ? (
                  <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ Not Verified</span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone Verified</label>
              <p className="text-gray-900 dark:text-white">
                {user.is_phone_verified ? (
                  <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ Not Verified</span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Member Since</label>
              <p className="text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Updated</label>
              <p className="text-gray-900 dark:text-white">{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
              <p className="text-gray-900 dark:text-white capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Block Modal */}
        {blockModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Block User</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Please provide a reason for blocking <span className="font-bold">{user.full_name}</span>:
              </p>
              <textarea
                value={blockNote}
                onChange={(e) => setBlockNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                placeholder="Enter reason for blocking (required)"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setBlockModal({ open: false })}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                  disabled={actionLoading || !blockNote.trim()}
                >
                  {actionLoading ? 'Blocking...' : 'Block User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUserProfilePage;
