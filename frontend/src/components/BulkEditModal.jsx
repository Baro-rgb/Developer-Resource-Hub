// src/components/BulkEditModal.jsx
import React, { useState, useEffect } from 'react';
import { getCategories } from '../services/api';

/**
 * BulkEditModal
 * Modal to update a specific field for multiple resources
 * 
 * Props:
 * - selectedCount: Number of selected items
 * - onApply: Callback (field, value) -> Promise
 * - onClose: Callback to close modal
 */
const BulkEditModal = ({ selectedCount, onApply, onClose }) => {
  const [field, setField] = useState('category');
  const [value, setValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sources = ['Tiktok', 'YouTube', 'Facebook', 'Twitter', 'Blog', 'GitHub', 'Khác'];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        // Sort alphabetically same as ResourceForm
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

  // Update value when field changes to avoid invalid state
  useEffect(() => {
    setValue('');
  }, [field]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value && field !== 'subcategory') {
      setError('Vui lòng chọn giá trị mới');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onApply(field, value);
      onClose();
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryObj = field === 'subcategory' 
    ? categories.find(c => c.key === categories[0]?.key) // This logic needs to be better if we want to change subcategory in bulk without knowing the category
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">⚡ Sửa nhanh {selectedCount} tài nguyên</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-3 rounded-lg text-sm mb-4 border border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">Chọn trường cần thay đổi</label>
            <select 
              className="input w-full"
              value={field}
              onChange={(e) => setField(e.target.value)}
            >
              <option value="category">Danh mục chính</option>
              <option value="subcategory">Chi tiết danh mục (Subcategory)</option>
              <option value="source">Nguồn (Source)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Giá trị mới</label>
            {field === 'category' && (
              <select 
                className="input w-full"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.name}</option>
                ))}
              </select>
            )}

            {field === 'subcategory' && (
              <input 
                type="text"
                className="input w-full"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nhập tên subcategory mới..."
                required
              />
            )}

            {field === 'source' && (
              <select 
                className="input w-full"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              >
                <option value="">-- Chọn nguồn --</option>
                {sources.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary py-3"
            >
              {loading ? 'Đang thực hiện...' : 'Cập nhật ngay'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary py-3"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkEditModal;
