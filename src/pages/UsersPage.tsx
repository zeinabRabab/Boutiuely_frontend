import React, { useEffect, useState, useMemo } from 'react';
import {
  Users, Trash2, RefreshCw, UserPlus, Search, X, Shield,
  Eye, Briefcase, User as UserIcon
} from 'lucide-react';
import { usersAPI, authAPI } from '../services/api';
import { User } from '../types';
import { Button, Input, Select, Alert, Badge, LoadingSpinner, EmptyState } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'cashier',  label: 'Cashier'  },
  { value: 'manager',  label: 'Manager'  },
  { value: 'admin',    label: 'Admin'    },
  { value: 'viewer',   label: 'Viewer'   },
];
const ROLE_FILTER = [{ value: '', label: 'All Roles' }, ...ROLE_OPTIONS];

const ROLE_META: Record<string, { icon: React.ReactNode; variant: 'purple'|'blue'|'green'|'gray'; label: string }> = {
  admin:   { icon: <Shield size={11}/>,   variant: 'purple', label: 'Admin'   },
  manager: { icon: <Briefcase size={11}/>,variant: 'blue',   label: 'Manager' },
  cashier: { icon: <UserIcon size={11}/>, variant: 'green',  label: 'Cashier' },
  viewer:  { icon: <Eye size={11}/>,      variant: 'gray',   label: 'Viewer'  },
};

const empty = { name: '', email: '', password: '', role: 'cashier' };
type Form = typeof empty;

export const UsersPage: React.FC = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.list();
      setUsers(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) list = list.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter) list = list.filter(u => u.role === roleFilter);
    return list;
  }, [users, search, roleFilter]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required');
      return;
    }
    setSaving(true);
    try {
      await usersAPI.create(form);
      setSuccess(`User "${form.name}" created successfully`);
      setShowCreate(false);
      setForm(empty);
      fetchUsers();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await usersAPI.delete(id);
      setSuccess('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Cannot delete user');
      setDeleteId(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    users.forEach(u => { c[u.role] = (c[u.role] || 0) + 1; });
    return c;
  }, [users]);

  const f = (k: keyof Form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{users.length} total users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={fetchUsers} loading={loading}>
            <RefreshCw size={13}/> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus size={13}/> Add User
          </Button>
        </div>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLE_OPTIONS.map(r => {
          const meta = ROLE_META[r.value];
          return (
            <div
              key={r.value}
              onClick={() => setRoleFilter(roleFilter === r.value ? '' : r.value)}
              className={`rounded-xl p-3 text-center cursor-pointer transition-all border ${
                roleFilter === r.value
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-200'
              }`}
            >
              <p className="text-xl font-bold text-gray-900 dark:text-white">{counts[r.value] || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{r.label}s</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <select
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500"
        >
          {ROLE_FILTER.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading users…"/>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={24}/>} title="No users found" description="Adjust filters or add a new user"/>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['User','Email','Role','Joined','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(u => {
                  const meta = ROLE_META[u.role] || ROLE_META.cashier;
                  const canDelete = u.role !== 'admin' && u.id !== me?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white leading-tight">{u.name}</p>
                            {u.id === me?.id && <span className="text-xs text-purple-500">(you)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : u.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : u.role === 'viewer' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {canDelete ? (
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={13}/>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowCreate(false)}/>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-modal-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Add New User</h2>
                <p className="text-xs text-gray-500 mt-0.5">Create a new team member account</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={16}/>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Input label="Full Name *" value={form.name} onChange={e => f('name', e.target.value)} placeholder="Jane Smith"/>
              <Input label="Email Address *" type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="jane@example.com"/>
              <Input label="Password *" type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="Min 6 characters"/>
              <Select
                label="Role / Access Level"
                value={form.role}
                onChange={e => f('role', e.target.value)}
                options={ROLE_OPTIONS}
              />
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className="font-medium text-gray-700 dark:text-gray-300">Role permissions:</p>
                <p><span className="font-medium text-purple-600">Admin</span> — Full access, manage users & settings</p>
                <p><span className="font-medium text-blue-600">Manager</span> — Manage products, orders & reports</p>
                <p><span className="font-medium text-green-600">Cashier</span> — View & process orders</p>
                <p><span className="font-medium text-gray-600">Viewer</span> — Read-only access</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} loading={saving}>
                <UserPlus size={14}/> Create User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setDeleteId(null)}/>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm animate-modal-in p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete User</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
