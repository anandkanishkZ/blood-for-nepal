import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import logoTransparent from '../../assets/logo-transparent.png';
import AdminSidebar from '../AdminSidebar';
import { Search, Shield, Ban, X as XIcon, Info, Unlock, LogIn, Eye, UserCheck, UserX } from 'lucide-react';
import { showToast } from '../../utils/toast';

const USERS_PER_PAGE = 10;

const AdminUsersPage = ({ isDarkMode, toggleDarkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [blockModal, setBlockModal] = useState({ open: false, user: null });
  const [blockNote, setBlockNote] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [blockNoteModal, setBlockNoteModal] = useState({ open: false, user: null });
  const [actionsModal, setActionsModal] = useState({ open: false, user: null });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authAPI.getAllUsers();
        console.log('Fetched users response:', res);
        const users = res?.data?.data?.users || res?.data?.users || res?.users || [];
        setUsers(users);
      } catch (err) {
        console.error('Failed to load users:', err, err?.data || err?.message || err);
        setError(err?.data?.message || err?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(u =>
        u.full_name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [users, search, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  // Reset to page 1 if filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  // Block user handler (backend)
  const handleBlockUser = async () => {
    if (!blockModal.user) return;
    setBlocking(true);
    try {
      const res = await authAPI.blockUser(blockModal.user.id, blockNote);
      // Update user in local state
      setUsers(prev => prev.map(u =>
        u.id === blockModal.user.id ? { ...u, is_active: false, block_note: blockNote } : u
      ));
      setBlockModal({ open: false, user: null });
      setBlockNote('');
      showToast.success('User blocked successfully.');
    } catch (err) {
      showToast.error(err?.data?.message || err?.message || 'Failed to block user.');
    } finally {
      setBlocking(false);
    }
  };

  // Unblock user handler
  const handleUnblockUser = async (user) => {
    if (!user) return;
    setBlocking(true);
    try {
      await authAPI.unblockUser(user.id);
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, is_active: true, block_note: null } : u
      ));
      showToast.success('User unblocked successfully.');
    } catch (err) {
      showToast.error(err?.data?.message || err?.message || 'Failed to unblock user.');
    } finally {
      setBlocking(false);
    }
  };

  // Impersonate user handler
  const handleImpersonateUser = async (user) => {
    if (!user) return;
    setBlocking(true);
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
        window.location.href = '/profile'; // or user dashboard route
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      showToast.error(err?.data?.message || err?.message || 'Failed to impersonate user.');
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">All Users</h1>
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 text-center py-8">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avatar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S/N</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blood Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">No users found.</td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user, idx) => {
                      const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=F87171&color=fff`;
                      const isBlocked = user.is_active === false;
                      return (
                        <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition ${isBlocked ? 'opacity-60 bg-gray-100 dark:bg-gray-900' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={avatarUrl}
                              alt={user.full_name || 'User'}
                              className="w-10 h-10 rounded-full object-cover border-2 border-red-200 dark:border-red-700 shadow-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{(page - 1) * USERS_PER_PAGE + idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium flex items-center gap-2">
                            {user.full_name}
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs font-semibold ml-2 gap-1 border border-red-200 dark:border-red-700">
                                <Shield className="w-3.5 h-3.5 text-red-500 mr-1" />
                                Admin
                              </span>
                            )}
                            {isBlocked && (
                              <>
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-400 dark:border-gray-600 flex items-center gap-1">
                                  Blocked
                                  <button
                                    type="button"
                                    className="ml-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                    onClick={() => setBlockNoteModal({ open: true, user })}
                                    title="View block note"
                                  >
                                    <Info className="w-4 h-4" />
                                  </button>
                                </span>
                              </>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {user.blood_type || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{user.phone || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 capitalize">{user.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.role === 'user' && (
                              <button
                                onClick={() => setActionsModal({ open: true, user })}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                title="View Actions"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 mx-1 ${p === page ? 'bg-red-500 text-white dark:bg-red-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
            
            {/* Actions Modal */}
            {actionsModal.open && actionsModal.user && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <Eye className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">User Actions</h3>
                          <p className="text-blue-100 text-sm">{actionsModal.user.full_name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActionsModal({ open: false, user: null })}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Close actions modal"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4">
                    <div className="text-center mb-6">
                      <img
                        src={actionsModal.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(actionsModal.user.full_name || 'User')}&background=F87171&color=fff`}
                        alt={actionsModal.user.full_name}
                        className="w-16 h-16 rounded-full mx-auto border-4 border-gray-200 dark:border-gray-700 shadow-lg"
                      />
                      <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                        Choose an action to perform on this user
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Block/Unblock Action */}
                      {actionsModal.user.is_active !== false ? (
                        <button
                          onClick={() => {
                            setBlockModal({ open: true, user: actionsModal.user });
                            setBlockNote('');
                            setActionsModal({ open: false, user: null });
                          }}
                          className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
                            <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-red-700 dark:text-red-300">Block User</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Restrict user access</p>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleUnblockUser(actionsModal.user);
                            setActionsModal({ open: false, user: null });
                          }}
                          disabled={blocking}
                          className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 transition-all duration-200 group disabled:opacity-50"
                        >
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
                            <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-green-700 dark:text-green-300">Unblock User</p>
                            <p className="text-sm text-green-600 dark:text-green-400">Restore user access</p>
                          </div>
                        </button>
                      )}

                      {/* Login as User Action */}
                      <button
                        onClick={() => {
                          handleImpersonateUser(actionsModal.user);
                          setActionsModal({ open: false, user: null });
                        }}
                        disabled={blocking}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-all duration-200 group disabled:opacity-50"
                      >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                          <LogIn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-blue-700 dark:text-blue-300">Login as User</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Impersonate this user</p>
                        </div>
                      </button>
                    </div>

                    {/* User Status Info */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Current Status:</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                          actionsModal.user.is_active !== false 
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        }`}>
                          {actionsModal.user.is_active !== false ? 'Active' : 'Blocked'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600 dark:text-gray-400">Blood Type:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {actionsModal.user.blood_type || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Block Modal */}
            {blockModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    onClick={() => setBlockModal({ open: false, user: null })}
                    aria-label="Close block modal"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Block User</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">Please provide a reason for blocking <span className="font-bold">{blockModal.user?.full_name}</span>:</p>
                  <textarea
                    value={blockNote}
                    onChange={e => setBlockNote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                    placeholder="Enter admin notes (required)"
                    required
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setBlockModal({ open: false, user: null })}
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      disabled={blocking}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBlockUser}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                      disabled={blocking || !blockNote.trim()}
                    >
                      {blocking ? 'Blocking...' : 'Confirm Block'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Block Note Modal */}
            {blockNoteModal.open && blockNoteModal.user && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    onClick={() => setBlockNoteModal({ open: false, user: null })}
                    aria-label="Close block note modal"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Block Note</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    <span className="font-bold">{blockNoteModal.user.full_name}</span> was blocked for the following reason:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-line">
                    {blockNoteModal.user.block_note || 'No note provided.'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Blocked on: {blockNoteModal.user.updatedAt ? new Date(blockNoteModal.user.updatedAt).toLocaleString() : 'Unknown'}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setBlockNoteModal({ open: false, user: null })}
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminUsersPage; 