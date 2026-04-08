// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { getResources, deleteResource, updateResource } from '../services/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import ResourceForm from '../components/ResourceForm';
import LanguageSwitcher from '../components/LanguageSwitcher';

/**
 * Dashboard Page
 * Màn hình chính hiển thị danh sách resources
 * 
 * Features:
 * - Lấy và hiển thị danh sách resources từ API
 * - Search & filter
 * - CRUD operations (Create, Read, Update, Delete)
 * - Pagination
 * - Favorite toggle
 */
const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { resources, setResources, pagination, setPagination, filters, loading, setLoading, error, setError } = useResources();
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // Scroll to top khi mở/đóng form
  useEffect(() => {
    if (showForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showForm]);

  // Fetch resources khi filters, pagination thay đổi
  useEffect(() => {
    fetchResources();
  }, [filters.search, filters.category, filters.subcategory, filters.source, pagination.page]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        search: filters.search,
        category: filters.category,
        subcategory: filters.subcategory,
        source: filters.source,
        page: pagination.page,
        limit: pagination.limit,
      };

      // Lọc bỏ undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const data = await getResources(params);
      setResources(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || t('messages.failed_to_fetch'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    try {
      await deleteResource(id);
      fetchResources();
    } catch (err) {
      setError(t('messages.failed_to_delete'));
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingResource(null);
    fetchResources();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingResource(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <ResourceForm
          initialData={editingResource}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t('common.title')}
            </h1>
            <p className="text-slate-400">
              {t('common.subtitle')}
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Add New Button */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isAuthenticated ? (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                ➕ {t('common.add')}
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <div className="text-slate-200 flex flex-wrap items-center gap-3">
              <span>
                Xin chào, <span className="font-semibold text-white">{user?.name || user?.email}</span>
              </span>
              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary btn-sm">
                  Admin
                </Link>
              )}
              <button onClick={logout} className="ml-3 btn btn-ghost text-sm">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">
              Đăng nhập để thêm, sửa, xóa tài nguyên.
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">⏳ {t('common.loading')}</p>
              </div>
            )}

            {/* Resources Grid */}
            {!loading && resources.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      ← {t('pagination.previous')}
                    </button>
                    <span className="flex items-center px-4 text-white">
                      {t('pagination.page')} {pagination.page} {t('pagination.of')} {pagination.pages}
                    </span>
                    <button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      {t('pagination.next')} →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && resources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">
                  {t('messages.no_resources')}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  {t('form.add_resource')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
