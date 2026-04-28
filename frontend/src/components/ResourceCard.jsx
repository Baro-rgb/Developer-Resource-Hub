// src/components/ResourceCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Database, Network, Check, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

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
const ResourceCard = ({ resource, onEdit, onDelete, isSelected, onToggleSelect, onShare }) => {
  const { t } = useTranslation();

  const handleVisit = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
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
  const lowerCategory = (resource.category || '').toLowerCase();
  const Icon =
    lowerCategory.includes('backend') || lowerCategory.includes('devops')
      ? Server
      : lowerCategory.includes('data') || lowerCategory.includes('database')
      ? Database
      : Network;

  return (
    <motion.article whileHover={{ y: -4 }} className={`rounded-2xl border p-6 transition-all duration-200 ${
      isSelected 
        ? 'bg-slate-800/95 border-blue-400/50 ring-4 ring-blue-500/10'
        : 'bg-slate-800/80 border-transparent hover:border-slate-600/40 hover:bg-slate-800'
    }`}>
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isSelected ? 'bg-blue-600/30 text-blue-200' : 'bg-slate-900 text-blue-300'
          }`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="line-clamp-1 text-lg font-bold text-white">{resource.title}</h3>
            <p className="font-mono text-xs text-slate-400">ID: RS-{resource.id}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleSelect(resource.id)}
          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
            isSelected ? 'border-blue-400 bg-blue-400 text-slate-950' : 'border-slate-500 text-transparent'
          }`}
        >
          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {resource.category && (
          <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-200">
            {resource.category}
          </span>
        )}
        {resource.subcategory && (
          <span className="rounded bg-slate-700/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {resource.subcategory}
          </span>
        )}
        {resource.source && (
          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            {resource.source}
          </span>
        )}
      </div>

      {technologies.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('card.technologies')}</p>
          <div className="flex flex-wrap gap-2">
            {visibleTechnologies.map((tech) => (
              <span key={tech} className="rounded bg-slate-700/70 px-2 py-1 text-xs text-slate-200">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {resource.description && (
        <div className="mb-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('form.description')}</p>
          <p className="line-clamp-2 text-sm text-slate-300">{resource.description}</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-700/40 pt-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{t('card.last_update')}</span>
          <div className="text-sm font-semibold text-slate-200">
            {new Date(resource.updated_at || resource.created_at).toLocaleDateString('vi-VN')}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{t('card.selection')}</span>
          <div className="text-sm font-semibold text-slate-200">{isSelected ? t('card.selected') : t('card.not_selected')}</div>
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-slate-700/40 pt-4">
        <button
          onClick={handleVisit}
          className="flex-1 rounded-xl bg-blue-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-blue-400"
        >
          {t('card.open')}
        </button>
        <button
          onClick={handleEdit}
          disabled={!onEdit}
          className={`flex-1 rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-slate-600 ${!onEdit ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {t('card.edit')}
        </button>
        <button
          onClick={handleDelete}
          disabled={!onDelete}
          className={`flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 ${!onDelete ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {t('card.delete')}
        </button>
        {onShare && (
          <button
            onClick={() => onShare(resource)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
            title="Chia sẻ"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default ResourceCard;
