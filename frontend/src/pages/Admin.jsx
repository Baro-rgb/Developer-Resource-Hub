// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
          selectedUserId ? getAdminResources({ page: resourcePage, limit: 10, ownerId: selectedUserId }) : Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
          selectedUserId ? getCategories({ page: categoryPage, limit: 10, ownerId: selectedUserId }) : Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
        ]);
        setUsers(usersResp.data);
        setResources(resourcesResp.data);
        setCategories(categoriesResp.data);
        setUserPagination(usersResp.pagination || userPagination);
        setResourcePagination(resourcesResp.pagination || resourcePagination);
        setCategoryPagination(categoriesResp.pagination || categoryPagination);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load admin data');
      }
    };

    loadData();
  }, [isAuthenticated, isAdmin, userPage, resourcePage, categoryPage, selectedUserId]);

  const refreshData = async () => {
    try {
      const [usersResp, resourcesResp, categoriesResp] = await Promise.all([
        getAdminUsers({ page: userPage, limit: 10 }),
        selectedUserId ? getAdminResources({ page: resourcePage, limit: 10, ownerId: selectedUserId }) : Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
        selectedUserId ? getCategories({ page: categoryPage, limit: 10, ownerId: selectedUserId }) : Promise.resolve({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
      ]);
      setUsers(usersResp.data);
      setResources(resourcesResp.data);
      setCategories(categoriesResp.data);
      setUserPagination(usersResp.pagination || userPagination);
      setResourcePagination(resourcesResp.pagination || resourcePagination);
      setCategoryPagination(categoriesResp.pagination || categoryPagination);
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

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Quản lý người dùng, tài nguyên và danh mục.</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="text-slate-300">
              Đăng nhập với admin: <strong>{user?.email}</strong>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn btn-ghost btn-sm text-white border border-slate-600"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {(message || error) && (
          <div className={`rounded-lg p-4 ${error ? 'bg-red-900 text-red-100' : 'bg-emerald-900 text-emerald-100'}`}>
            {error || message}
          </div>
        )}

        <section className="bg-slate-800 rounded-3xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Quản lý người dùng</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id} className="border-t border-slate-700">
                    <td className="px-4 py-3">{userItem.id}</td>
                    <td className="px-4 py-3">{userItem.name}</td>
                    <td className="px-4 py-3">{userItem.email}</td>
                    <td className="px-4 py-3">{userItem.is_admin ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
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
                        className="btn btn-info btn-sm"
                      >
                        Show
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="btn btn-danger btn-sm"
                        disabled={userItem.id === user.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-slate-300">
            <span>
              Trang {userPagination.page} / {userPagination.totalPages} - Tổng {userPagination.total} người dùng
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                disabled={userPagination.page <= 1}
              >
                Trước
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setUserPage((prev) => Math.min(prev + 1, userPagination.totalPages))}
                disabled={userPagination.page >= userPagination.totalPages}
              >
                Sau
              </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Quản lý tài nguyên</h2>
              <p className="text-slate-400 text-sm">
                {selectedUserId
                  ? `Hiển thị tài nguyên cho: ${selectedUserName}`
                  : 'Chọn một tài khoản để xem tài nguyên riêng của họ.'}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id} className="border-t border-slate-700">
                    <td className="px-4 py-3">{resource.id}</td>
                    <td className="px-4 py-3">{resource.title}</td>
                    <td className="px-4 py-3">{resource.owner_name} ({resource.owner_email})</td>
                    <td className="px-4 py-3">{resource.category}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-slate-300">
            <span>
              Trang {resourcePagination.page} / {resourcePagination.totalPages} - Tổng {resourcePagination.total} tài nguyên
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setResourcePage((prev) => Math.max(prev - 1, 1))}
                disabled={resourcePagination.page <= 1}
              >
                Trước
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setResourcePage((prev) => Math.min(prev + 1, resourcePagination.totalPages))}
                disabled={resourcePagination.page >= resourcePagination.totalPages}
              >
                Sau
              </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Quản lý danh mục</h2>
              <p className="text-slate-400 text-sm">
                {selectedUserId
                  ? `Hiển thị danh mục cho: ${selectedUserName}`
                  : 'Chọn một tài khoản để xem danh mục riêng của họ.'}
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Tên</th>
                      <th className="px-4 py-3">Key</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} className="border-t border-slate-700">
                        <td className="px-4 py-3">{category.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                             {category.name}
                             {category.subcategories && category.subcategories.length > 0 && (
                               <button 
                                 onClick={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                                 className="text-xs text-slate-400 hover:text-white ml-2 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                               >
                                 <span className="opacity-70 text-[10px]">Subcategories</span>
                                 <span>{expandedCategoryId === category.id ? '▼' : '▶'}</span>
                               </button>
                             )}
                          </div>
                          {expandedCategoryId === category.id && category.subcategories && (
                             <div className="mt-2 flex flex-wrap gap-1">
                               {category.subcategories.map(sub => (
                                 <span key={sub} className="inline-block bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">{sub}</span>
                               ))}
                             </div>
                          )}
                        </td>
                        <td className="px-4 py-3">{category.key}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCategoryDelete(category.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-col md:flex-row items-center justify-between text-slate-300 text-sm gap-2">
                <span>
                  Trang {categoryPagination.page} / {categoryPagination.totalPages} - Tổng {categoryPagination.total} danh mục
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCategoryPage((prev) => Math.max(prev - 1, 1))}
                    disabled={categoryPagination.page <= 1}
                  >
                    Trước
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCategoryPage((prev) => Math.min(prev + 1, categoryPagination.totalPages))}
                    disabled={categoryPagination.page >= categoryPagination.totalPages}
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 self-start">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingCategory ? `Chỉnh sửa: ${editingCategory.name}` : 'Thêm danh mục mới'}
              </h3>
              {!selectedUserId && (
                <div className="bg-slate-900 border border-yellow-600 text-yellow-200 p-4 rounded-lg mb-4 text-sm">
                  Chọn một tài khoản để tạo danh mục cho tài khoản đó.
                </div>
              )}
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Tên danh mục</label>
                  <input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2">Key</label>
                  <input
                    value={categoryForm.key}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, key: e.target.value }))}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2">Subcategories (comma separated)</label>
                  <input
                    value={categoryForm.subcategories}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, subcategories: e.target.value }))}
                    className="input w-full"
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
