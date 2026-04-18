// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, PlusCircle, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { getResources, deleteResource, getCategories } from '../services/api';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import ResourceForm from '../components/ResourceForm';
import BulkToolModal from '../components/BulkToolModal';

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
  const { resources, setResources, pagination, setPagination, filters, updateFilters, loading, setLoading, error, setError } = useResources();
  const [showForm, setShowForm] = useState(false);
  const [showBulkTool, setShowBulkTool] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const shouldShowCategoryGuide =
    !filters.category && !filters.subcategory && !filters.search && !filters.source;

  const fetchResources = useCallback(async () => {
    if (shouldShowCategoryGuide) {
      setResources([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 0, page: 1 }));
      setLoading(false);
      setError(null);
      return;
    }

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
  }, [shouldShowCategoryGuide, filters.search, filters.category, filters.subcategory, filters.source, pagination.page, pagination.limit, setLoading, setError, setResources, setPagination, t]);

  // Scroll to top khi mở/đóng form
  useEffect(() => {
    if (showForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showForm]);

  // Fetch resources khi filters, pagination thay đổi
  useEffect(() => {
    fetchResources();
    setSelectedIds([]); // Clear selection when page/filters change
  }, [fetchResources, filters.search, filters.category, filters.subcategory, filters.source, pagination.page]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        const sorted = (response.data || []).sort((a, b) =>
          a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
        );
        setCategories(sorted);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

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

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (isAll) => {
    if (isAll) {
      setSelectedIds(resources.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="pl-64 pt-16">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col p-10">
          <div className="mb-8">
            <SearchBar />
          </div>

          <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white">{t('dashboard.title')}</h1>
              <p className="text-sm text-slate-400">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkTool(true)}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold transition-colors ${
                  selectedIds.length > 0 ? 'bg-blue-500/20 text-blue-200' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                }`}
              >
                <Layers className="h-5 w-5" />
                {selectedIds.length > 0 ? `${t('dashboard.bulk_action')} (${selectedIds.length})` : t('dashboard.bulk_action')}
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 px-6 py-2.5 font-bold text-slate-950 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <PlusCircle className="h-5 w-5" />
                {t('dashboard.add_resource')}
              </button>
            </div>
          </header>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-700/50 pb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                {t('dashboard.hello')}, <span className="font-bold text-white">{user?.name}</span>
              </span>
              {isAdmin && (
                <Link to="/admin" className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20">
                  Admin
                </Link>
              )}
            </div>
            {isAuthenticated ? (
              <button onClick={logout} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                {t('dashboard.logout')}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{t('dashboard.login_prompt')}:</span>
                <Link to="/login" className="text-blue-300 hover:underline">{t('dashboard.login')}</Link>
                <span>/</span>
                <Link to="/register" className="text-blue-300 hover:underline">{t('dashboard.register')}</Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div>
              {error && <div className="mb-6 rounded-lg bg-red-900/70 p-4 text-red-100">{error}</div>}

              {loading && (
                <div className="py-12 text-center">
                  <p className="text-lg text-slate-400">⏳ {t('common.loading')}</p>
                </div>
              )}

              {!loading && shouldShowCategoryGuide && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <Lightbulb className="h-8 w-8 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                    </div>
                    <div>
                      <h2 className="mb-3 text-xl font-bold text-white tracking-tight">{t('dashboard.guide_title')}</h2>
                      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-slate-400">
                        {t('dashboard.guide_desc')}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {categories.slice(0, 6).map((cat) => (
                          <button
                            key={cat.key}
                            onClick={() => {
                              updateFilters({ category: cat.key, subcategory: '' });
                              setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!loading && resources.length > 0 && (
                <>
                  <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-900/70 p-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === resources.length && resources.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                      />
                      {selectedIds.length > 0 ? t('dashboard.selected_count', { count: selectedIds.length }) : t('dashboard.select_all_page')}
                    </label>
                    {selectedIds.length > 0 && (
                      <button onClick={() => setSelectedIds([])} className="text-xs text-slate-400 hover:text-white">
                        {t('dashboard.deselect_all')}
                      </button>
                    )}
                  </div>

                  <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        isSelected={selectedIds.includes(resource.id)}
                        onToggleSelect={handleToggleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>

                  {pagination.pages > 1 && (
                    <footer className="flex items-center justify-between border-t border-slate-700/40 pt-8">
                      <p className="text-sm font-medium text-slate-400">
                        {t('pagination.page')} <span className="font-bold text-white">{pagination.page}</span> {t('pagination.of')} <span className="font-bold text-white">{pagination.pages}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={pagination.page === 1}
                          onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                          className="rounded-lg border border-slate-700/40 p-2 text-slate-300 transition-all hover:bg-slate-800 disabled:opacity-30"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button className="h-10 w-10 rounded-lg bg-blue-500 font-bold text-slate-950">{pagination.page}</button>
                        <button
                          disabled={pagination.page === pagination.pages}
                          onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                          className="rounded-lg border border-slate-700/40 p-2 text-slate-300 transition-all hover:bg-slate-800 disabled:opacity-30"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </footer>
                  )}
                </>
              )}

              {!loading && !shouldShowCategoryGuide && resources.length === 0 && (
                <div className="py-12 text-center">
                  <p className="mb-4 text-lg text-slate-400">{t('messages.no_resources')}</p>
                  <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    {t('form.add_resource')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <footer className="mt-10 flex items-center justify-between border-t border-slate-700/40 px-2 py-8 text-xs">
            <div className="text-slate-500">© 2024 Digital Command. All rights reserved.</div>
            <div className="flex gap-8">
              <a className="text-slate-500 transition-all hover:text-slate-200" href="/" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <a className="text-slate-500 transition-all hover:text-slate-200" href="/" onClick={(e) => e.preventDefault()}>Terms of Service</a>
              <a className="text-slate-500 transition-all hover:text-slate-200" href="/" onClick={(e) => e.preventDefault()}>Security</a>
            </div>
          </footer>
        </div>
      </main>

      <Sidebar />

      {showBulkTool && (
        <BulkToolModal 
          initialMode={selectedIds.length > 0 ? 'edit' : 'import'}
          selectedIds={selectedIds}
          onClose={() => setShowBulkTool(false)}
          onSuccess={() => {
            fetchResources();
            setSelectedIds([]);
            setShowBulkTool(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
