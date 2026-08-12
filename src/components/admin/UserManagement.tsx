import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  AlertTriangle,
  UserCheck,
  UserX,
  Copy,
  Check
} from 'lucide-react';
import { AdminUser } from '../../types';
import { storageService } from '../../services/storageService';
import { isValidEmail, isValidMobileNumber, normalizeMobileNumber, hashPassword } from '../../utils/security';

interface UserManagementProps {
  currentUser?: AdminUser;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'EDITOR'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    mobile: '',
    role: 'EDITOR' as 'ADMIN' | 'EDITOR',
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
    password: '',
    passcode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
    const unsubscribe = storageService.subscribe(() => {
      loadUsers();
    });
    return unsubscribe;
  }, []);

  const loadUsers = () => {
    setUsers(storageService.getAdminUsers());
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setFormData({
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      name: '',
      email: '',
      mobile: '',
      role: 'EDITOR',
      status: 'ACTIVE',
      password: '',
      passcode: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      role: user.role,
      status: user.status,
      password: '',
      passcode: user.passcode || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenResetModal = (user: AdminUser) => {
    setSelectedUser(user);
    // Generate random memorable passcode
    const randomCode = 'st' + Math.floor(100000 + Math.random() * 900000);
    setNewPassword(randomCode);
    setResetSuccess(false);
    setIsResetModalOpen(true);
  };

  const handleOpenDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter the full name');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setFormError('Please enter a valid email address (e.g. user@example.com)');
      return;
    }

    if (!isValidMobileNumber(formData.mobile)) {
      setFormError('Please enter a valid 11-digit mobile number (e.g. 01723516793)');
      return;
    }

    const normalizedEmail = (formData.email || '').trim().toLowerCase();
    const normalizedMobile = normalizeMobileNumber(formData.mobile || '');

    const emailExists = users.some(
      u => u.id !== formData.id && (u.email || '').toLowerCase() === normalizedEmail
    );
    if (emailExists) {
      setFormError('A user with this email address already exists');
      return;
    }

    const mobileExists = users.some(
      u => u.id !== formData.id && normalizeMobileNumber(u.mobile || '') === normalizedMobile
    );
    if (mobileExists) {
      setFormError('A user with this mobile number already exists');
      return;
    }

    if (!selectedUser && !formData.password.trim()) {
      setFormError('Please set an initial login password/passcode');
      return;
    }

    const updatedUser: AdminUser = {
      id: formData.id,
      name: formData.name.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      role: formData.role,
      status: formData.status,
      createdAt: selectedUser ? selectedUser.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: selectedUser?.lastLogin
    };

    if (formData.password.trim()) {
      updatedUser.passwordHash = hashPassword(formData.password.trim());
      updatedUser.passcode = formData.password.trim();
    } else if (selectedUser) {
      updatedUser.passwordHash = selectedUser.passwordHash;
      updatedUser.passcode = selectedUser.passcode;
    }

    storageService.saveAdminUser(updatedUser);
    setIsModalOpen(false);
    showNotification(selectedUser ? `User ${updatedUser.name} updated successfully` : `User ${updatedUser.name} created successfully`);
  };

  const handleConfirmResetPassword = () => {
    if (!selectedUser || !newPassword.trim()) return;

    const updatedUser: AdminUser = {
      ...selectedUser,
      passwordHash: hashPassword(newPassword.trim()),
      passcode: newPassword.trim()
    };

    storageService.saveAdminUser(updatedUser);
    setResetSuccess(true);
    showNotification(`Password for ${selectedUser.name} reset successfully`);
    setTimeout(() => {
      setIsResetModalOpen(false);
    }, 2000);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    if ((selectedUser.email || '').toLowerCase() === 'giga.sonjoy@gmail.com') {
      alert('The primary Super Admin account cannot be deleted.');
      setIsDeleteModalOpen(false);
      return;
    }

    storageService.deleteAdminUser(selectedUser.id);
    setIsDeleteModalOpen(false);
    showNotification(`User account ${selectedUser.name || 'User'} deleted`);
  };

  const handleToggleStatus = (user: AdminUser) => {
    if ((user.email || '').toLowerCase() === 'giga.sonjoy@gmail.com') {
      alert('The primary Super Admin account status cannot be disabled.');
      return;
    }
    storageService.toggleAdminUserStatus(user.id);
    showNotification(`Status for ${user.name || 'User'} changed to ${user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'}`);
  };

  const handleCopyCredentials = (user: AdminUser) => {
    const text = `ST Web & Ads Studio Access:\nUser: ${user.name}\nEmail: ${user.email}\nMobile: ${user.mobile}\nRole: ${user.role}\nPasscode: ${user.passcode || 'stweb2025'}\nURL: ${window.location.origin}/#/login`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportUsers = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `st_admin_users_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.mobile && u.mobile.includes(searchQuery));
      
      const isPrimary = (u.email || '').toLowerCase() === 'giga.sonjoy@gmail.com';
      const effectiveRole = isPrimary ? 'ADMIN' : u.role;
      const matchesRole = roleFilter === 'ALL' || effectiveRole === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || (isPrimary ? 'ACTIVE' : u.status) === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold">User Management & Security Access</h2>
          </div>
          <p className="text-sm text-slate-400">
            Control administrative and editor roles with multi-factor authentication (Email, Mobile, and Password).
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportUsers}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
            title="Export Users Backup (JSON)"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-lg flex items-center gap-3 animate-fadeIn text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
            <span className="text-slate-400 px-2 font-medium">Role:</span>
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${roleFilter === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${roleFilter === 'ADMIN' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Admins
            </button>
            <button
              onClick={() => setRoleFilter('EDITOR')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${roleFilter === 'EDITOR' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Editors
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
            <span className="text-slate-400 px-2 font-medium">Status:</span>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${statusFilter === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('DISABLED')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${statusFilter === 'DISABLED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Disabled
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User Details</th>
                <th className="px-6 py-3.5">Contact Credentials</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Login</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-medium">No users found matching your criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  if (!user) return null;
                  const isPrimaryAdmin = (user.email || '').toLowerCase() === 'giga.sonjoy@gmail.com';
                  const isCurrent = currentUser?.id === user.id;
                  const displayName = user.name || 'Admin User';
                  const displayInitial = (displayName.trim().charAt(0) || 'A').toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                            {displayInitial}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{displayName}</span>
                              {isPrimaryAdmin && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                                  Primary Admin
                                </span>
                              )}
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">Created on {user.createdAt || 'Initial'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{user.mobile || '01723516793'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {(user.role === 'ADMIN' || (user.role as string) === 'SUPER_ADMIN' || isPrimaryAdmin) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Shield className="w-3 h-3" />
                            {isPrimaryAdmin ? 'Super Admin' : 'Administrator'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Users className="w-3 h-3" />
                            Content Editor
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {(user.status === 'ACTIVE' || (user as any).isActive === true || isPrimaryAdmin) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle className="w-3 h-3" />
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                        {user.lastLogin || 'Never logged in'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy credentials helper */}
                          <button
                            onClick={() => handleCopyCredentials(user)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                            title="Copy Login Details to Clipboard"
                          >
                            {copiedId === user.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>

                          {/* Reset password button */}
                          <button
                            onClick={() => handleOpenResetModal(user)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            title="Reset Password / Passcode"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                            title="Edit User Info"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle status */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded transition-colors ${
                                user.status === 'ACTIVE' 
                                  ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' 
                                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                              }`}
                              title={user.status === 'ACTIVE' ? 'Disable Account' : 'Activate Account'}
                            >
                              {user.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Delete User */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => handleOpenDeleteModal(user)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                              title="Delete User Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  {selectedUser ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedUser ? 'Edit User Profile' : 'Add New User'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sonjoy Sarkar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address * (Used for login)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="user@stwebads.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Number * (Multi-factor verification)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="01723516793"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard 11-digit Bangladeshi mobile (e.g. 01723516793) or international format.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="EDITOR">Content Editor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {selectedUser ? 'Set New Password (leave blank to keep current)' : 'Password / Passcode *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={selectedUser ? 'Leave blank to preserve' : 'Enter login password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                  {selectedUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isResetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Key className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-white">Reset User Password</h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Password for {selectedUser.name} updated successfully!</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Assign a new password or generated passcode for <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email}).
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Password / Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setNewPassword('st' + Math.floor(100000 + Math.random() * 900000))}
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate New Passcode</span>
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmResetPassword}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-white">Delete User Account</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete the user account for <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
