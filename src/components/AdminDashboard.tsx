// src/components/AdminDashboard.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Shield, User as UserIcon } from 'lucide-react';
import { useAdminUsers, useAdminCreateUser, useAdminDeleteUser, useLogout } from '../lib/hooks';

export function AdminDashboard() {
  const navigate = useNavigate();
  const usersQuery = useAdminUsers();
  const createMutation = useAdminCreateUser();
  const deleteMutation = useAdminDeleteUser();
  const logoutMutation = useLogout();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string>('');

  const users = useMemo(() => Array.isArray(usersQuery.data) ? usersQuery.data : [], [usersQuery.data]);

  async function onCreate() {
    setErr('');
    if (!email || !password) {
      setErr('Email and password are required');
      return;
    }
    try {
      await createMutation.mutateAsync({
        email,
        password,
        full_name: fullName || undefined,
        role,
      });
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('user');
      await usersQuery.refetch();
    } catch (e: any) {
      setErr(e?.message || 'Failed to create user');
    }
  }

  async function onDelete(id: string) {
    setErr('');
    try {
      await deleteMutation.mutateAsync({ id });
      await usersQuery.refetch();
    } catch (e: any) {
      setErr(e?.message || 'Failed to delete user');
    }
  }

  async function onSignOut() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      navigate('/signin', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">Admin Dashboard</div>
            <div className="text-sm text-gray-600">Manage users</div>
          </div>
          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold"
          >
            Sign out
          </button>
        </div>

        {err && (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {err}
          </div>
        )}

        {/* Create user */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 font-bold text-gray-900 mb-4">
            <Plus size={18} /> Add user
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Full name (optional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <button
              onClick={onCreate}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="font-bold text-gray-900">Users</div>
            <button
              onClick={() => usersQuery.refetch()}
              className="text-sm font-semibold text-gray-700 hover:underline"
            >
              Refresh
            </button>
          </div>

          {usersQuery.isLoading ? (
            <div className="p-6 text-gray-600">Loading…</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Role</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <UserIcon size={16} className="text-indigo-700" />
                          </div>
                          <div className="font-semibold text-gray-900">{u.full_name || '—'}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role === 'admin' ? <Shield size={12} /> : null}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => onDelete(String(u.id))}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 font-semibold"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td className="px-5 py-6 text-gray-600" colSpan={4}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}