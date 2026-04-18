// src/components/BulkToolModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  bulkCreateResources, 
  getCategories, 
  bulkDeleteResources, 
  bulkUpdateResources 
} from '../services/api';

/**
 * BulkToolModal
 * Unified center for bulk operations: Import from Sheet, Bulk Edit, and Bulk Delete.
 */

const SOURCES = ['Tiktok', 'YouTube', 'Facebook', 'Twitter', 'Blog', 'GitHub', 'Khác'];

const parseRows = (text, defaultCategory) => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsed = [];
  let currentCategory = defaultCategory || '';

  for (const line of lines) {
    const sectionMatch = line.match(/(?:\*+\s*)?SECTION\s*:\s*(.+?)(?:\*+)?$/i);
    if (sectionMatch) {
      currentCategory = sectionMatch[1].trim();
      continue;
    }

    const cols = line.split('\t').map((c) => c.trim());
    if (cols.length < 2) continue;

    const [title, url, techRaw, description, notes, sourceRaw] = cols;
    if (!title || !url) continue;

    const techs = techRaw ? techRaw.split(/[;,]/).map((t) => t.trim()).filter(Boolean) : [];
    const sourceNorm = sourceRaw ? SOURCES.find((s) => s.toLowerCase() === sourceRaw.toLowerCase()) || sourceRaw : '';

    parsed.push({
      title, url, category: currentCategory, technologies: techs,
      description: description || '', notes: notes || '', source: sourceNorm, lastUsedDate: null,
    });
  }
  return parsed;
};

const BulkToolModal = ({ initialMode = 'import', selectedIds = [], onClose, onSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [pasteText, setPasteText] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultSource, setDefaultSource] = useState('Tiktok');
  const [preview, setPreview] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [loading, setLoading] = useState(false);
  const [importStep, setImportStep] = useState('paste'); // 'paste' | 'preview'

  // States for Bulk Edit
  const [editField, setEditField] = useState('category');
  const [editValue, setEditValue] = useState('');
  const [editMode, setEditMode] = useState('replace'); // replace | fill
  const [subcategoryCategory, setSubcategoryCategory] = useState('');
  const [useCustomSubcategory, setUseCustomSubcategory] = useState(false);

  useEffect(() => {
    getCategories()
      .then((r) => {
        const sorted = (r.data || []).sort((a, b) =>
          a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
        );
        setCategories(sorted);
      })
      .catch(() => {});
  }, []);

  const handleEsc = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  // --- IMPORT LOGIC ---
  const handlePreview = () => {
    if (!pasteText.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng paste dữ liệu vào ô trên.' });
      return;
    }
    const rows = parseRows(pasteText, defaultCategory);
    if (rows.length === 0) {
      setStatus({ type: 'error', message: 'Không tìm thấy dòng hợp lệ. Kiểm tra lại định dạng.' });
      return;
    }
    const withDefaults = rows.map((r) => ({ ...r, source: r.source || defaultSource }));
    setPreview(withDefaults);
    setStatus(null);
    setImportStep('preview');
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    setStatus(null);
    try {
      const result = await bulkCreateResources(preview);
      setStatus({
        type: 'success',
        message: `✅ Thành công! Đã thêm ${result.data?.length || 0} tài nguyên.`,
      });
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Import thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  // --- EDIT LOGIC ---
  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    const nextValue = typeof editValue === 'string' ? editValue.trim() : editValue;
    if (!nextValue) {
      setStatus({ type: 'error', message: 'Vui lòng nhập/chọn giá trị mới.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      if (editField === 'subcategory' && subcategoryCategory) {
        await bulkUpdateResources(selectedIds, 'category', subcategoryCategory, editMode);
      }
      await bulkUpdateResources(selectedIds, editField, nextValue, editMode);
      const modeLabel = editMode === 'fill' ? 'chỉ thêm vào chỗ trống' : 'thay thế';
      setStatus({ type: 'success', message: `✅ Đã cập nhật ${selectedIds.length} tài nguyên (${modeLabel}).` });
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Cập nhật thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleBulkDelete = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await bulkDeleteResources(selectedIds);
      setStatus({ type: 'success', message: `✅ Đã xóa ${selectedIds.length} tài nguyên.` });
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Xóa thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0 bg-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              ⚡ Công cụ xử lý hàng loạt
              {selectedIds.length > 0 && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-normal">
                  Đang chọn {selectedIds.length}
                </span>
              )}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">Import, Sửa hoặc Xóa nhiều tài nguyên cùng lúc</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">✕</button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-700 shrink-0 bg-slate-850">
          <button
            onClick={() => setMode('import')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${mode === 'import' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            Import từ Sheet
          </button>
          <button
            onClick={() => setMode('edit')}
            disabled={selectedIds.length === 0}
            className={`px-6 py-3 text-sm font-medium transition-colors ${selectedIds.length === 0 ? 'opacity-30 cursor-not-allowed' : ''} ${mode === 'edit' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            Sửa nhanh {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
          <button
            onClick={() => setMode('delete')}
            disabled={selectedIds.length === 0}
            className={`px-6 py-3 text-sm font-medium transition-colors ${selectedIds.length === 0 ? 'opacity-30 cursor-not-allowed' : ''} ${mode === 'delete' ? 'text-red-400 border-b-2 border-red-400' : 'text-slate-400 hover:text-white'}`}
          >
            Xóa hàng loạt {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-6 bg-slate-900/30">
          {status && (
            <div className={`mb-6 p-4 rounded-xl text-sm border ${status.type === 'success' ? 'bg-emerald-900/50 text-emerald-200 border-emerald-700' : 'bg-red-900/50 text-red-200 border-red-700'}`}>
              {status.message}
            </div>
          )}

          {/* MODE: IMPORT */}
          {mode === 'import' && (
            <div className="animate-in fade-in duration-300">
              {importStep === 'paste' ? (
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-xl p-4 text-sm text-slate-300 border border-slate-700">
                    <p className="font-semibold text-white mb-2">📋 Định dạng: Tên | URL | Techs | Mô tả | Ghi chú | Nguồn (Tab-separated)</p>
                    <p className="text-slate-400 text-xs">💡 Thêm <span className="text-yellow-400 font-mono">SECTION: AI Tools</span> để tự động gán danh mục.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text mb-1">Category mặc định</label>
                      <select value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value)} className="input w-full">
                        <option value="">-- Không có --</option>
                        {categories.map((c) => (<option key={c.key} value={c.key}>{c.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="label-text mb-1">Nguồn mặc định</label>
                      <select value={defaultSource} onChange={(e) => setDefaultSource(e.target.value)} className="input w-full">
                        {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Dán dữ liệu từ Excel vào đây..."
                    className="input w-full min-h-[300px] font-mono text-xs"
                    spellCheck={false}
                  />
                  <button onClick={handlePreview} className="btn btn-primary w-full py-4 text-lg">🔍 Phân tích & Xem trước</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white font-medium">Tìm thấy {preview.length} tài nguyên. Vui lòng kiểm tra lại:</p>
                    <button onClick={() => setImportStep('paste')} className="text-blue-400 hover:underline text-sm">← Quay lại dán dữ liệu</button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800">
                    <table className="min-w-full text-xs text-slate-200">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="px-3 py-3 text-left">#</th>
                          <th className="px-3 py-3 text-left">Tên</th>
                          <th className="px-3 py-3 text-left">Category</th>
                          <th className="px-3 py-3 text-left">Nguồn</th>
                          <th className="px-3 py-3 text-left">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {preview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-700/50">
                            <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium">{item.title}</td>
                            <td className="px-3 py-2 text-blue-300">{item.category || 'Mặc định'}</td>
                            <td className="px-3 py-2">{item.source}</td>
                            <td className="px-3 py-2 truncate max-w-[200px] text-slate-500">{item.url}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={handleImport} disabled={loading} className="btn btn-primary w-full py-4 text-lg">
                    {loading ? 'đang import...' : `🚀 Import tất cả (${preview.length})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE: EDIT */}
          {mode === 'edit' && (
            <div className="max-w-xl mx-auto py-8 animate-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-xl font-bold text-white mb-6">✏️ Sửa nhanh {selectedIds.length} tài nguyên đã chọn</h3>
              <form onSubmit={handleBulkUpdate} className="space-y-6">
                <div>
                  <label className="label-text mb-2">Trường cần thay đổi</label>
                  <select
                    value={editField}
                    onChange={(e) => {
                      setEditField(e.target.value);
                      setEditValue('');
                      setSubcategoryCategory('');
                      setUseCustomSubcategory(false);
                    }}
                    className="input w-full"
                  >
                    <option value="category">Danh mục chính (Category)</option>
                    <option value="subcategory">Chi tiết danh mục (Subcategory)</option>
                    <option value="source">Nguồn (Source)</option>
                  </select>
                </div>

                <div>
                  <label className="label-text mb-2">Kiểu cập nhật</label>
                  <select
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value)}
                    className="input w-full"
                  >
                    <option value="replace">Đổi toàn bộ giá trị hiện có</option>
                    <option value="fill">Chỉ thêm vào tài nguyên đang để trống</option>
                  </select>
                </div>

                <div>
                  <label className="label-text mb-2">Giá trị mới</label>
                  {editField === 'category' ? (
                    <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="input w-full" required>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (<option key={c.key} value={c.key}>{c.name}</option>))}
                    </select>
                  ) : editField === 'source' ? (
                    <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="input w-full" required>
                      <option value="">-- Chọn nguồn --</option>
                      {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={subcategoryCategory}
                        onChange={(e) => {
                          setSubcategoryCategory(e.target.value);
                          setEditValue('');
                          setUseCustomSubcategory(false);
                        }}
                        className="input w-full"
                      >
                        <option value="">-- Không đổi category, chỉ đổi subcategory --</option>
                        {categories.map((c) => (<option key={c.key} value={c.key}>{c.name}</option>))}
                      </select>

                      {!useCustomSubcategory && subcategoryCategory && (
                        <select
                          value={editValue}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setUseCustomSubcategory(true);
                              setEditValue('');
                              return;
                            }
                            setEditValue(e.target.value);
                          }}
                          className="input w-full"
                          required
                        >
                          <option value="">-- Chọn subcategory --</option>
                          {(categories.find((c) => c.key === subcategoryCategory)?.subcategories || [])
                            .slice()
                            .sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }))
                            .map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                          <option value="__custom__">+ Nhập subcategory mới</option>
                        </select>
                      )}

                      {(useCustomSubcategory || !subcategoryCategory) && (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Nhập subcategory..."
                          className="input w-full"
                          required
                        />
                      )}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 text-lg shadow-lg shadow-blue-900/20">
                  {loading ? 'Đang cập nhật...' : 'Áp dụng thay đổi cho tất cả'}
                </button>
              </form>
            </div>
          )}

          {/* MODE: DELETE */}
          {mode === 'delete' && (
            <div className="max-w-xl mx-auto py-12 text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/20">
                <span className="text-4xl">🗑️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Xác nhận xóa hàng loạt?</h3>
              <p className="text-slate-400 mb-8">
                Bạn đang chuẩn bị xóa <span className="text-red-400 font-bold">{selectedIds.length}</span> tài nguyên đã chọn. 
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-4">
                <button onClick={handleBulkDelete} disabled={loading} className="flex-1 btn bg-red-600 hover:bg-red-700 text-white border-none py-4 text-lg">
                  {loading ? 'Đang xóa...' : 'Đồng ý, Xóa ngay'}
                </button>
                <button onClick={() => setMode('edit')} className="flex-1 btn btn-secondary py-4 text-lg">Hủy bỏ</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkToolModal;
