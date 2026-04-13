// src/components/BulkImportModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { bulkCreateResources, getCategories } from '../services/api';

/**
 * BulkImportModal
 * Paste nhiều dòng từ Excel/Google Sheets → preview → import tất cả
 *
 * Format mỗi dòng (tab-separated):
 *   Title | URL | Technologies | Description | Notes | Source
 * Dòng SECTION xác định category:
 *   **SECTION: AI Tools** hoặc SECTION: AI Tools
 */

const SOURCES = ['Tiktok', 'YouTube', 'Facebook', 'Twitter', 'Blog', 'GitHub', 'Khác'];

const parseRows = (text, defaultCategory) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed = [];
  let currentCategory = defaultCategory || '';

  for (const line of lines) {
    // Detect SECTION header: **SECTION: AI Tools** or SECTION: AI Tools
    const sectionMatch = line.match(/(?:\*+\s*)?SECTION\s*:\s*(.+?)(?:\*+)?$/i);
    if (sectionMatch) {
      currentCategory = sectionMatch[1].trim();
      continue;
    }

    const cols = line.split('\t').map((c) => c.trim());
    if (cols.length < 2) continue;

    const [title, url, techRaw, description, notes, sourceRaw] = cols;
    if (!title || !url) continue;

    const techs = techRaw
      ? techRaw.split(/[;,]/).map((t) => t.trim()).filter(Boolean)
      : [];

    const sourceNorm = sourceRaw
      ? SOURCES.find((s) => s.toLowerCase() === sourceRaw.toLowerCase()) || sourceRaw
      : '';

    parsed.push({
      title,
      url,
      category: currentCategory,
      technologies: techs,
      description: description || '',
      notes: notes || '',
      source: sourceNorm,
      lastUsedDate: null,
    });
  }

  return parsed;
};

const BulkImportModal = ({ onClose, onSuccess }) => {
  const [pasteText, setPasteText] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultSource, setDefaultSource] = useState('Tiktok');
  const [preview, setPreview] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState('paste'); // 'paste' | 'preview'

  // Remove item from preview
  const removePreviewItem = (idx) =>
    setPreview((prev) => prev.filter((_, i) => i !== idx));

  // Edit preview field
  const editPreviewItem = (idx, field, value) =>
    setPreview((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

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

  const handleEsc = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );
  useEffect(() => {
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

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
    // Apply default source where source is empty
    const withDefaults = rows.map((r) => ({
      ...r,
      source: r.source || defaultSource,
    }));
    setPreview(withDefaults);
    setStatus(null);
    setStep('preview');
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    setStatus(null);
    try {
      const result = await bulkCreateResources(preview);
      setStatus({
        type: 'success',
        message: `✅ Đã thêm ${result.data?.length || 0} tài nguyên thành công!${
          result.errors?.length ? ` ⚠️ ${result.errors.length} dòng bị lỗi.` : ''
        }`,
      });
      if (result.errors?.length === 0 || !result.errors) {
        setTimeout(() => { onSuccess(); onClose(); }, 1500);
      } else {
        // Remove successful ones from preview so user can fix failures
        const failedIndexes = new Set(result.errors.map((e) => e.index));
        setPreview((prev) => prev.filter((_, i) => failedIndexes.has(i)));
        onSuccess(); // refresh dashboard
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Import thất bại.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">⚡ Thêm hàng loạt từ Sheet</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Paste nhiều dòng từ Excel / Google Sheets → Xem trước → Import tất cả
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0">
          {['paste', 'preview'].map((s) => (
            <button
              key={s}
              onClick={() => s === 'preview' ? preview.length > 0 && setStep(s) : setStep(s)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                step === s
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s === 'paste' ? '1. Paste dữ liệu' : `2. Xem trước (${preview.length} dòng)`}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {/* Status */}
          {status && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                status.type === 'success'
                  ? 'bg-emerald-900 text-emerald-200'
                  : 'bg-red-900 text-red-200'
              }`}
            >
              {status.message}
            </div>
          )}

          {/* Step 1: PASTE */}
          {step === 'paste' && (
            <div className="space-y-4">
              {/* Format guide */}
              <div className="bg-slate-900 rounded-xl p-4 text-sm text-slate-300 border border-slate-700">
                <p className="font-semibold text-white mb-2">📋 Định dạng cột (tab-separated từ Excel/Sheets):</p>
                <code className="text-blue-300 block mb-1">
                  Tên tài nguyên | URL | Technologies | Mô tả | Ghi chú | Nguồn
                </code>
                <p className="text-slate-400 text-xs mt-2">
                  💡 Thêm dòng <span className="text-yellow-300">**SECTION: AI Tools**</span> trước nhóm dữ liệu để đặt category tự động.
                </p>
              </div>

              {/* Default overrides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-1">Category mặc định (nếu không có SECTION)</label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">-- Không có --</option>
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-1">Nguồn mặc định</label>
                  <select
                    value={defaultSource}
                    onChange={(e) => setDefaultSource(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">-- Không có --</option>
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Paste area */}
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`**SECTION: AI Tools**\nGoogle Stich\thttps://stitch.withgoogle.com\tAI, UI Design\tTạo UI bằng AI\tTool AI của Google\tTiktok\nLLM Timeline\thttps://llmtimeline.com\tAI, LLM\tTheo dõi sự phát triển AI\tTimeline các model\tTiktok`}
                className="input w-full min-h-[280px] font-mono text-xs"
                spellCheck={false}
              />

              <button
                onClick={handlePreview}
                className="btn btn-primary w-full py-3 text-base"
              >
                🔍 Phân tích & Xem trước →
              </button>
            </div>
          )}

          {/* Step 2: PREVIEW */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-sm">
                  Xem lại trước khi import. Bạn có thể xóa dòng nào không muốn thêm.
                </p>
                <button onClick={() => setStep('paste')} className="text-slate-400 hover:text-white text-sm underline">
                  ← Quay lại chỉnh sửa
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="min-w-full text-xs text-slate-200">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-3 py-2 text-left w-8">#</th>
                      <th className="px-3 py-2 text-left">Tên</th>
                      <th className="px-3 py-2 text-left">URL</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Technologies</th>
                      <th className="px-3 py-2 text-left">Mô tả</th>
                      <th className="px-3 py-2 text-left">Nguồn</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((item, idx) => (
                      <tr key={idx} className={`border-t border-slate-700 ${idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-850'}`}>
                        <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <input
                            className="bg-transparent border border-transparent hover:border-slate-600 focus:border-blue-500 rounded px-1 w-full min-w-[120px]"
                            value={item.title}
                            onChange={(e) => editPreviewItem(idx, 'title', e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className="bg-transparent border border-transparent hover:border-slate-600 focus:border-blue-500 rounded px-1 w-full min-w-[140px] text-blue-400"
                            value={item.url}
                            onChange={(e) => editPreviewItem(idx, 'url', e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            className="bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-xs"
                            value={item.category}
                            onChange={(e) => editPreviewItem(idx, 'category', e.target.value)}
                          >
                            <option value="">--</option>
                            {categories.map((c) => (
                              <option key={c.key} value={c.key}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {Array.isArray(item.technologies) ? item.technologies.join(', ') : item.technologies}
                        </td>
                        <td className="px-3 py-2 max-w-[160px] truncate text-slate-400">{item.description}</td>
                        <td className="px-3 py-2 text-slate-400">{item.source}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removePreviewItem(idx)}
                            className="text-red-400 hover:text-red-200 font-bold"
                            title="Xóa dòng này"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleImport}
                disabled={importing || preview.length === 0}
                className="btn btn-primary w-full py-3 text-base disabled:opacity-50"
              >
                {importing
                  ? '⏳ Đang import...'
                  : `🚀 Import ${preview.length} tài nguyên`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
