import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Check, X as XIcon } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const CategoryManagerModal = ({ isOpen, onClose, onCategoryUpdate, onQuotaExceeded }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', key: '', subcategories: '' });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    try {
      const subcats = formData.subcategories
        ? formData.subcategories.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      
      const payload = {
        name: formData.name,
        key: formData.key || formData.name,
        subcategories: subcats
      };

      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }

      await loadCategories();
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', key: '', subcategories: '' });
      if (onCategoryUpdate) onCategoryUpdate();
    } catch (err) {
      if (err.code === 'QUOTA_EXCEEDED' && onQuotaExceeded) {
        onQuotaExceeded(err.message);
      } else {
        setError(err.message || 'Lỗi lưu danh mục');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
      if (onCategoryUpdate) onCategoryUpdate();
    } catch (err) {
      setError(err.message || 'Lỗi xóa danh mục');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setIsAdding(false);
    setFormData({
      name: cat.name,
      key: cat.key,
      subcategories: (cat.subcategories || []).join(', ')
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">Quản lý Danh mục</h2>
            <p className="text-sm text-slate-400">Tạo, sửa và xóa các danh mục tài nguyên của bạn.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-semibold text-slate-300">Danh sách hiện tại</h3>
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                setFormData({ name: '', key: '', subcategories: '' });
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Thêm mới
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
            {(isAdding || editingId) && (
              <div className="rounded-xl border border-blue-500/30 bg-slate-800/50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-1">
                    <label className="mb-1 block text-xs font-medium text-slate-400">Tên Danh Mục</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Frontend, Backend, AI..."
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="mb-1 block text-xs font-medium text-slate-400">Danh mục con (Cách nhau bằng dấu phẩy)</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      value={formData.subcategories}
                      onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                      placeholder="VD: React, Vue, CSS"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                    }}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-700"
                  >
                    <XIcon className="h-4 w-4" /> Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
                  >
                    <Check className="h-4 w-4" /> Lưu
                  </button>
                </div>
              </div>
            )}

            {loading && !isAdding && !editingId ? (
              <div className="text-center text-slate-500 py-4">Đang tải...</div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 hover:bg-slate-800/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{cat.name}</h4>
                      <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                        {cat.key}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      Sub: {(cat.subcategories || []).join(', ') || 'Không có'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerModal;
