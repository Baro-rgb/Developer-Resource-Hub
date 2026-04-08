// src/components/ResourceForm.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createResource, updateResource, getCategories } from '../services/api';

/**
 * ResourceForm Component
 * Form để tạo hoặc edit resource
 * 
 * Props:
 * - initialData: Dữ liệu để pre-fill form (khi edit)
 * - onSuccess: Callback khi submit thành công
 * - onCancel: Callback khi user cancel
 */
const ResourceForm = ({ initialData = null, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    url: '',
    technologies: [],
    description: '',
    notes: '',
    source: '',
    lastUsedDate: '',
  });

  const [pasteRowText, setPasteRowText] = useState('');
  const [pasteMessage, setPasteMessage] = useState('');
  const [techInput, setTechInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sources = ['Tiktok', 'YouTube', 'Facebook', 'Twitter', 'Blog', 'GitHub', 'Khác'];


  // Pre-fill form nếu có initialData (edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        category: initialData.category || '',
        subcategory: initialData.subcategory || '',
        url: initialData.url,
        technologies: initialData.technologies || [],
        description: initialData.description || '',
        notes: initialData.notes || '',
        source: initialData.source || '',
        lastUsedDate: initialData.lastUsedDate || '',
      });
    }
  }, [initialData]);

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Handle ESC key to close form
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add technology - Auto-split by comma
  const handleTechInputChange = (e) => {
    const value = e.target.value;
    setTechInput(value);

    // Auto-split if user typed comma
    if (value.includes(',')) {
      const techs = value.split(',').map(t => t.trim()).filter(t => t && !formData.technologies.includes(t));
      if (techs.length > 0) {
        setFormData(prev => ({
          ...prev,
          technologies: [...new Set([...prev.technologies, ...techs])],
        }));
        setTechInput('');
      }
    }
  };

  // Add technology when enter pressed or blur
  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  // Remove technology
  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }));
  };

  const normalizeDate = (value) => {
    if (!value) return '';
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parts = trimmed.split(/[-\/\.]/).map((part) => part.trim());
    if (parts.length === 3) {
      const [p1, p2, p3] = parts;
      if (p1.length === 4) {
        return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
      }
      return `${p3.padStart(4, '0')}-${p1.padStart(2, '0')}-${p2.padStart(2, '0')}`;
    }
    return trimmed;
  };

  const handleApplyPaste = () => {
    setPasteMessage('');
    const rows = pasteRowText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line);

    if (rows.length === 0) {
      setPasteMessage('Vui lòng paste một hàng dữ liệu từ sheet.');
      return;
    }

    const sectionRow = rows.find((row) => /SECTION:/i.test(row));
    const dataRow = rows.find((row) => !/SECTION:/i.test(row));
    const rowText = dataRow || rows[0];
    const cols = rowText.split(/\t/).map((col) => col.trim());

    if (cols.length < 2) {
      setPasteMessage('Dòng nhập vào không đúng định dạng. Cần tối thiểu tên và link.');
      return;
    }

    let title = '';
    let url = '';
    let technologies = '';
    let description = '';
    let notes = '';
    let source = '';
    let lastUsedDate = '';

    if (cols.length >= 7) {
      [title, url, technologies, description, notes, source, lastUsedDate] = cols;
    } else if (cols.length === 6) {
      [title, url, technologies, description, notes, source] = cols;
    } else if (cols.length === 5) {
      [title, url, technologies, description, notes] = cols;
    } else {
      [title, url] = cols;
    }

    const parsedTechs = technologies
      ? technologies.split(/[;,]/).map((tech) => tech.trim()).filter(Boolean)
      : [];

    const parsedSource = source
      ? source.toLowerCase().includes('tiktok')
        ? 'Tiktok'
        : source
      : '';

    const parsedCategory = sectionRow
      ? sectionRow.replace(/\*+|SECTION:|SECTION/gi, '').trim()
      : formData.category;

    setFormData((prev) => ({
      ...prev,
      title: title || prev.title,
      category: parsedCategory || prev.category,
      subcategory: prev.subcategory,
      url: url || prev.url,
      technologies: parsedTechs.length ? parsedTechs : prev.technologies,
      description: description || prev.description,
      notes: notes || prev.notes,
      source: parsedSource || prev.source,
      lastUsedDate: normalizeDate(lastUsedDate) || prev.lastUsedDate,
    }));

    setPasteMessage('Đã tự động điền dữ liệu từ dòng paste.');
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      ...formData,
      category: formData.category || null,
      subcategory: formData.subcategory || null,
      source: formData.source || null,
      lastUsedDate: formData.lastUsedDate || null,
    };

    try {
      if (initialData) {
        // Update mode
        await updateResource(initialData.id, payload);
      } else {
        // Create mode
        await createResource(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || t('messages.failed_to_create'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto relative">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-white">
          {initialData ? t('form.edit_resource') : t('form.add_resource')}
        </h2>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white text-2xl font-bold leading-none"
          title="Đóng (ESC)"
        >
          ✕
        </button>
      </div>

      <div className="mb-6 bg-slate-900 border border-slate-700 rounded-lg p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
          <div>
            <p className="text-sm text-slate-300 font-medium">Paste một dòng từ sheet vào đây</p>
            <p className="text-xs text-slate-500">Hệ thống sẽ tự động điền vào các trường phù hợp.</p>
          </div>
          <button
            type="button"
            onClick={handleApplyPaste}
            className="btn btn-secondary text-sm px-4"
          >
            Áp dụng
          </button>
        </div>
        <textarea
          value={pasteRowText}
          onChange={(e) => setPasteRowText(e.target.value)}
          placeholder="Paste row từ Excel/Google Sheets vào đây..."
          className="input w-full min-h-[120px]"
        />
        {pasteMessage && (
          <p className="text-xs text-slate-400 mt-2">{pasteMessage}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title - TÊN TÀI NGUYÊN */}
        <div>
          <label className="block text-white font-medium mb-2">
            TÊN TÀI NGUYÊN *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input"
            placeholder="VD: React Documentation"
          />
        </div>

        {/* Category - DANH MỤC */}
        <div>
          <label className="block text-white font-medium mb-2">
            DANH MỤC
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                category: e.target.value,
                subcategory: '', // Reset subcategory khi đổi category
              }));
            }}
            className="input"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat.key} value={cat.key}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory - CHI TIẾT DANH MỤC */}
        {formData.category && categories.find((cat) => cat.key === formData.category)?.subcategories?.length > 0 && (
          <div>
            <label className="block text-white font-medium mb-2">
              CHI TIẾT DANH MỤC
            </label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  subcategory: e.target.value,
                }));
              }}
              className="input"
            >
              <option value="">-- Chọn chi tiết --</option>
              {categories
                .find((cat) => cat.key === formData.category)
                ?.subcategories?.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* URL - LINK */}
        <div>
          <label className="block text-white font-medium mb-2">
            LINK *
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            className="input"
            placeholder="https://example.com"
          />
        </div>

        {/* Technologies - CÔNG NGHỆ LIÊN QUAN */}
        <div>
          <label className="block text-white font-medium mb-2">
            CÔNG NGHỆ LIÊN QUAN
          </label>
          <div className="mb-2">
            <input
              type="text"
              value={techInput}
              onChange={handleTechInputChange}
              onBlur={addTechnology}
              className="input w-full"
              placeholder="VD: React, Node.js, JavaScript (tự động tách khi gõ dấu phẩy)"
            />
            <p className="text-xs text-slate-400 mt-1">💡 Gõ dấu phẩy để tách công nghệ</p>
          </div>
          {formData.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map(tech => (
                <div
                  key={tech}
                  className="badge-primary flex items-center gap-2"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(tech)}
                    className="font-bold cursor-pointer hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description - MỤC ĐÍCH SỬ DỤNG */}
        <div>
          <label className="block text-white font-medium mb-2">
            MỤC ĐÍCH SỬ DỤNG
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input resize-none"
            rows="3"
            placeholder="Mô tả mục đích sử dụng tài nguyên này..."
          />
        </div>

        {/* Notes - GHI CHÚ */}
        <div>
          <label className="block text-white font-medium mb-2">
            GHI CHÚ
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input resize-none"
            rows="2"
            placeholder="Ghi chú thêm về tài nguyên này..."
          />
        </div>

        {/* Source - NGUỒN */}
        <div>
          <label className="block text-white font-medium mb-2">
            NGUỒN
          </label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- Chọn nguồn --</option>
            {sources.map(src => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* Last Used Date - Ngày dùng gần nhất */}
        <div>
          <label className="block text-white font-medium mb-2">
            NGÀY DÙNG GẦN NHẤT
          </label>
          <input
            type="date"
            name="lastUsedDate"
            value={formData.lastUsedDate}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn btn-primary"
          >
            {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm Tài Nguyên')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn btn-secondary"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
