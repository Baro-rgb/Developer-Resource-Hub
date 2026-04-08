// src/components/ResourceCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ResourceCard Component
 * Hiển thị một resource dưới dạng card
 * 
 * Bao gồm:
 * - Title, Description
 * - Category badge, Tags
 * - Technologies
 * - Favorite button
 * - Action buttons (Edit, Delete, Visit)
 */
const ResourceCard = ({ resource, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const handleVisit = () => {
    window.open(resource.url, '_blank');
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(resource);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    if (window.confirm(t('common.delete_confirm'))) {
      onDelete(resource.id);
    }
  };

  const technologies = Array.isArray(resource.technologies)
    ? resource.technologies
    : typeof resource.technologies === 'string'
    ? resource.technologies.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

  const visibleTechnologies = technologies.slice(-2);

  return (
    <div className="card bg-slate-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {resource.title}
          </h3>
        </div>
      </div>

      {/* Category & Subcategory Badges */}
      <div className="mb-3 flex gap-2 items-center flex-wrap">
        {resource.category && (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            resource.category === 'Backend' ? 'bg-blue-600 text-white' :
            resource.category === 'Frontend' ? 'bg-purple-600 text-white' :
            resource.category === 'Algorithm' ? 'bg-green-600 text-white' :
            resource.category === 'UI / Design' ? 'bg-pink-600 text-white' :
            resource.category === 'Dev Tools' ? 'bg-yellow-600 text-white' :
            resource.category === 'AI Tools' ? 'bg-orange-600 text-white' :
            resource.category === 'Learning' ? 'bg-cyan-600 text-white' :
            resource.category === 'DevOps' ? 'bg-red-600 text-white' :
            resource.category === 'Testing' ? 'bg-indigo-600 text-white' :
            resource.category === 'Productivity' ? 'bg-emerald-600 text-white' :
            resource.category === 'History AI' ? 'bg-violet-600 text-white' :
            resource.category === 'TIKTOK CHANNELS' ? 'bg-rose-600 text-white' :
            resource.category === 'TikTok Photos' ? 'bg-fuchsia-600 text-white' :
            'bg-gray-600 text-white'
          }`}>
            {resource.category}
          </span>
        )}
        {resource.subcategory && (
          <span className="inline-block px-2 py-1 rounded text-xs border border-slate-500 text-slate-300">
            {resource.subcategory}
          </span>
        )}
      </div>

      {/* Technologies (show only last 2 tags) */}
      {technologies.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-1">🔧 Công nghệ:</p>
          <div className="flex flex-wrap gap-2 items-center">
            {visibleTechnologies.map((tech) => (
              <span key={tech} className="badge-secondary text-xs">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description - Mục đích sử dụng */}
      {resource.description && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-1">📝 Mục đích:</p>
          <p className="text-slate-300 text-sm line-clamp-2">
            {resource.description}
          </p>
        </div>
      )}

      {/* Source - Nguồn */}
      {resource.source && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-1">📌 Nguồn:</p>
          <p className="text-slate-300 text-sm font-medium">
            {resource.source}
          </p>
        </div>
      )}

      {/* Last Used Date */}
      {resource.lastUsedDate && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-1">📅 Dùng gần nhất:</p>
          <p className="text-slate-300 text-sm">
            {new Date(resource.lastUsedDate).toLocaleDateString('vi-VN')}
          </p>
        </div>
      )}

      {/* Notes */}
      {resource.notes && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-1">💬 Ghi chú:</p>
          <p className="text-slate-300 text-sm line-clamp-2">
            {resource.notes}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-slate-700">
        <button
          onClick={handleVisit}
          className="flex-1 btn btn-primary text-sm"
        >
          🌐 Mở →
        </button>
        <button
          onClick={handleEdit}
          disabled={!onEdit}
          className={`flex-1 btn btn-secondary text-sm ${!onEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          ✏️ Sửa
        </button>
        <button
          onClick={handleDelete}
          disabled={!onDelete}
          className={`flex-1 btn btn-danger text-sm ${!onDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Delete
        </button>
      </div>

      {/* Meta */}
      <p className="text-xs text-slate-500 mt-3">
        Updated: {new Date(resource.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ResourceCard;
