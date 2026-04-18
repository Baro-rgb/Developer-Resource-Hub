// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  BarChart3,
  Settings2,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  TrendingUp,
  Users,
  FolderTree,
  Filter,
  Download,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminResources,
  deleteAdminResource,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/api';

const Sidebar = ({ onLogout }) => (
  <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-700/40 bg-slate-950/95 px-4 py-6">
    <div className="mb-8 px-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20">
          <ShieldCheck className="h-6 w-6 text-blue-300" />
        </div>
        <div>
          <div className="text-lg font-bold text-blue-300">Enterprise Core</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">System Authority</div>
        </div>
      </div>
    </div>

    <nav className="space-y-1">
      {[
        { icon: LayoutDashboard, label: 'Dashboard' },
        { icon: Package, label: 'Resources' },
        { icon: BarChart3, label: 'Analytics' },
        { icon: ShieldCheck, label: 'Admin', active: true },
        { icon: Settings2, label: 'Management' },
      ].map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold ${
            item.active
              ? 'bg-blue-500/10 text-blue-300'
              : 'text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </div>
      ))}
    </nav>

    <div className="mt-auto space-y-2 border-t border-slate-700/40 pt-4">
      <div className="flex items-center gap-3 rounded-lg px-4 py-2 text-slate-400">
        <HelpCircle className="h-5 w-5" />
        <span className="text-sm">Help</span>
      </div>
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-sm">Sign Out</span>
      </button>
    </div>
  </aside>
);

const Topbar = ({ user, onLogout }) => (
  <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-700/40 bg-slate-950/80 px-8 backdrop-blur">
    <div className="flex items-center gap-6">
      <span className="text-xl font-bold text-blue-300">CommandCenter</span>
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className="w-72 rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          placeholder="Global system search..."
          type="text"
        />
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
        <Bell className="h-5 w-5" />
      </button>
      <div className="hidden text-sm text-slate-300 lg:block">{user?.email}</div>
      <button onClick={onLogout} className="btn btn-secondary btn-sm">
        Đăng xuất
      </button>
    </div>
  </header>
);

const StatsCard = ({ label, value, hint, icon: Icon, borderClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-xl border-l-4 bg-slate-900/80 p-5 ${borderClass}`}
  >
    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
    <div className="text-3xl font-extrabold text-white">{value}</div>
    <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
      <Icon className="h-4 w-4" />
      <span>{hint}</span>
    </div>
  </motion.div>
);

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [resourcePage, setResourcePage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [resourceSort, setResourceSort] = useState({ sortBy: 'created_at', order: 'DESC' });
  const [categorySort, setCategorySort] = useState({ sortBy: 'name', order: 'ASC' });
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [resourcePagination, setResourcePagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [categoryPagination, setCategoryPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', key: '', subcategories: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/');
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const loadData = async () => {
      try {
        const [usersResp, resourcesResp, categoriesResp] = await Promise.all([
          getAdminUsers({ page: userPage, limit: 10 }),
          selectedUserId ? getAdminResources({ page: resourcePage, limit: 10, ownerId: selectedUserId, sortBy: resourceSort.sortBy, order: resourceSort.order }) : Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
          selectedUserId ? getCategories({ page: categoryPage, limit: 10, ownerId: selectedUserId, sortBy: categorySort.sortBy, order: categorySort.order }) : Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
        ]);
        setUsers(usersResp.data);
        setResources(resourcesResp.data);
        setCategories(categoriesResp.data);
        setUserPagination(prev => usersResp.pagination || prev);
        setResourcePagination(prev => resourcesResp.pagination || prev);
        setCategoryPagination(prev => categoriesResp.pagination || prev);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load admin data');
      }
    };

    loadData();
  }, [isAuthenticated, isAdmin, userPage, resourcePage, categoryPage, selectedUserId, resourceSort, categorySort]);

  const refreshData = async () => {
    try {
      const [usersResp, resourcesResp, categoriesResp] = await Promise.all([
        getAdminUsers({ page: userPage, limit: 10 }),
        selectedUserId ? getAdminResources({ page: resourcePage, limit: 10, ownerId: selectedUserId, sortBy: resourceSort.sortBy, order: resourceSort.order }) : Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
        selectedUserId ? getCategories({ page: categoryPage, limit: 10, ownerId: selectedUserId, sortBy: categorySort.sortBy, order: categorySort.order }) : Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
      ]);
      setUsers(usersResp.data);
      setResources(resourcesResp.data);
      setCategories(categoriesResp.data);
      setUserPagination(prev => usersResp.pagination || prev);
      setResourcePagination(prev => resourcesResp.pagination || prev);
      setCategoryPagination(prev => categoriesResp.pagination || prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAdmin = async (userId, currentValue) => {
    try {
      setError(null);
      await updateAdminUser(userId, { is_admin: !currentValue });
      setMessage('User role updated.');
      refreshData();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Xác nhận xóa người dùng này?')) return;
    try {
      await deleteAdminUser(userId);
      setMessage('User deleted');
      refreshData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Xác nhận xóa tài nguyên này?')) return;
    try {
      await deleteAdminResource(resourceId);
      setMessage('Resource deleted');
      refreshData();
    } catch (err) {
      setError(err.message || 'Failed to delete resource');
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      let subcats = [];
      if (typeof categoryForm.subcategories === 'string') {
        subcats = categoryForm.subcategories.split(',').map((item) => item.trim()).filter(Boolean);
      } else if (Array.isArray(categoryForm.subcategories)) {
        subcats = categoryForm.subcategories;
      }
      const payload = {
        name: categoryForm.name,
        key: categoryForm.key,
        subcategories: subcats,
        owner_id: selectedUserId || user.id,
      };
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        setMessage('Category updated');
      } else {
        await createCategory(payload);
        setMessage('Category created');
      }
      
      setCategoryForm({ name: '', key: '', subcategories: '' });
      setEditingCategory(null);
      refreshData();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      key: category.key,
      subcategories: Array.isArray(category.subcategories) ? category.subcategories.join(', ') : (category.subcategories || ''),
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', key: '', subcategories: '' });
    setError(null);
    setMessage(null);
  };

  const handleCategoryDelete = async (categoryId) => {
    if (!window.confirm('Xác nhận xóa danh mục này?')) return;
    try {
      await deleteCategory(categoryId);
      setMessage('Category deleted');
      refreshData();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Đang xác thực...</p>
      </div>
    );
  }

  const doLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar onLogout={doLogout} />
      <Topbar user={user} onLogout={doLogout} />

      <main className="ml-64 mt-16 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-white">Authority Panel</h1>
              <p className="mt-2 max-w-xl text-slate-400">
                Global administrative controls and user resource orchestration.
              </p>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
              <StatsCard
                label="Users"
                value={userPagination.total || users.length}
                hint="Managed identities"
                icon={Users}
                borderClass="border-blue-400"
              />
              <StatsCard
                label="Resources"
                value={resourcePagination.total || resources.length}
                hint={selectedUserId ? 'Scoped by selected user' : 'Select user to inspect'}
                icon={TrendingUp}
                borderClass="border-emerald-400"
              />
              <StatsCard
                label="Categories"
                value={categoryPagination.total || categories.length}
                hint="Taxonomy integrity"
                icon={FolderTree}
                borderClass="border-amber-300"
              />
            </div>
          </div>

        {(message || error) && (
          <div className={`rounded-lg p-4 ${error ? 'bg-red-900/70 text-red-100' : 'bg-emerald-900/70 text-emerald-100'}`}>
            {error || message}
          </div>
        )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="space-y-6 lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-slate-700/30 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-700/40 bg-slate-900/80 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">User Management</h2>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                    <button className="btn btn-secondary btn-sm flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead>
                      <tr className="border-b border-slate-700/40 bg-slate-900/40">
                        <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-400">ID</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-400">Tên</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-400">Email</th>
                        <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-400">Admin</th>
                        <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-slate-400">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                          <td className="px-4 py-3">{userItem.id}</td>
                          <td className="px-4 py-3">{userItem.name}</td>
                          <td className="px-4 py-3">{userItem.email}</td>
                          <td className="px-4 py-3">{userItem.is_admin ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleToggleAdmin(userItem.id, userItem.is_admin)}
                                className="btn btn-secondary btn-sm"
                              >
                                {userItem.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUserId(userItem.id);
                                  setSelectedUserName(userItem.name || userItem.email);
                                  setResourcePage(1);
                                  setCategoryPage(1);
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                Show
                              </button>
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="btn btn-danger btn-sm"
                                disabled={userItem.id === user.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-700/40 bg-slate-900/70 px-6 py-3 text-sm text-slate-300">
                  <span>
                    Trang {userPagination.page} / {userPagination.totalPages} - Tổng {userPagination.total} người dùng
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                      disabled={userPagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setUserPage((prev) => Math.min(prev + 1, userPagination.totalPages))}
                      disabled={userPagination.page >= userPagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-xl border border-slate-700/30 bg-slate-900 p-6">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
                  <Settings2 className="h-5 w-5 text-blue-300" />
                  Quick Category Creation
                </h3>
                {!selectedUserId && (
                  <div className="mb-4 rounded-lg border border-yellow-600/40 bg-yellow-900/20 p-3 text-sm text-yellow-200">
                    Chọn một tài khoản để tạo danh mục cho tài khoản đó.
                  </div>
                )}
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Tên danh mục</label>
                    <input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Key</label>
                    <input
                      value={categoryForm.key}
                      onChange={(e) => setCategoryForm((prev) => ({ ...prev, key: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Subcategories</label>
                    <input
                      value={categoryForm.subcategories}
                      onChange={(e) => setCategoryForm((prev) => ({ ...prev, subcategories: e.target.value }))}
                      className="input"
                      placeholder="API, Database, Authentication"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="btn btn-primary flex-1">
                      {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                    {editingCategory && (
                      <button type="button" onClick={handleCancelEdit} className="btn btn-secondary flex-1">
                        Hủy bỏ
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-xl border border-slate-700/30 bg-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700/40 bg-slate-900/70 px-6 py-4 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Resource Management</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedUserId
                    ? `Hiển thị tài nguyên cho: ${selectedUserName}`
                    : 'Chọn một tài khoản để xem tài nguyên riêng của họ.'}
                </p>
              </div>
              {selectedUserId && (
                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
                  <select 
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    value={`${resourceSort.sortBy}-${resourceSort.order}`}
                    onChange={(e) => {
                      const [s, o] = e.target.value.split('-');
                      setResourceSort({ sortBy: s, order: o });
                      setResourcePage(1);
                    }}
                  >
                    <option value="created_at-DESC">Mới nhất trước</option>
                    <option value="created_at-ASC">Cũ nhất trước</option>
                    <option value="title-ASC">Tên (A-Z)</option>
                    <option value="title-DESC">Tên (Z-A)</option>
                    <option value="id-DESC">ID lớn giảm dần</option>
                    <option value="id-ASC">ID nhỏ tăng dần</option>
                  </select>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-slate-700/40 bg-slate-900/40">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                      <td className="px-4 py-3">{resource.id}</td>
                      <td className="px-4 py-3">{resource.title}</td>
                      <td className="px-4 py-3">{resource.owner_name} ({resource.owner_email})</td>
                      <td className="px-4 py-3">{resource.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button onClick={() => handleDeleteResource(resource.id)} className="btn btn-danger btn-sm">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-700/40 bg-slate-900/70 px-6 py-3 text-sm text-slate-300">
              <span>
                Trang {resourcePagination.page} / {resourcePagination.totalPages} - Tổng {resourcePagination.total} tài nguyên
              </span>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setResourcePage((prev) => Math.max(prev - 1, 1))}
                  disabled={resourcePagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setResourcePage((prev) => Math.min(prev + 1, resourcePagination.totalPages))}
                  disabled={resourcePagination.page >= resourcePagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-700/30 bg-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700/40 bg-slate-900/70 px-6 py-4 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Category Management</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedUserId
                    ? `Hiển thị danh mục cho: ${selectedUserName}`
                    : 'Chọn một tài khoản để xem danh mục riêng của họ.'}
                </p>
              </div>
              {selectedUserId && (
                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
                  <select 
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    value={`${categorySort.sortBy}-${categorySort.order}`}
                    onChange={(e) => {
                      const [s, o] = e.target.value.split('-');
                      setCategorySort({ sortBy: s, order: o });
                      setCategoryPage(1);
                    }}
                  >
                    <option value="name-ASC">Tên (A-Z)</option>
                    <option value="name-DESC">Tên (Z-A)</option>
                    <option value="created_at-DESC">Mới nhất trước</option>
                    <option value="created_at-ASC">Cũ nhất trước</option>
                    <option value="id-DESC">ID lớn giảm dần</option>
                    <option value="id-ASC">ID nhỏ tăng dần</option>
                  </select>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Key</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                    <td className="px-4 py-3">{category.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {category.name}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <button
                            onClick={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                            className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                          >
                            {expandedCategoryId === category.id ? 'Ẩn sub' : 'Xem sub'}
                          </button>
                        )}
                      </div>
                      {expandedCategoryId === category.id && category.subcategories && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {category.subcategories.map((sub) => (
                            <span key={sub} className="inline-block rounded bg-slate-700 px-2 py-1 text-xs text-slate-200">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{category.key}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCategoryDelete(category.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-700/40 bg-slate-900/70 px-6 py-3 text-sm text-slate-300">
              <span>
                Trang {categoryPagination.page} / {categoryPagination.totalPages} - Tổng {categoryPagination.total} danh mục
              </span>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 1))}
                  disabled={categoryPagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCategoryPage((prev) => Math.min(prev + 1, categoryPagination.totalPages))}
                  disabled={categoryPagination.page >= categoryPagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Admin;
