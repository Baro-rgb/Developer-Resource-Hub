// src/components/SearchBar.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResources } from '../context/ResourceContext';
import useDebounce from '../hooks/useDebounce';
import { Search, Globe, Bell, Settings } from 'lucide-react';

/**
 * SearchBar Component
 * Thanh tìm kiếm với debounce
 * - Input field để nhập từ khóa
 * - Debounce 500ms trước khi gọi API
 * - Hiển thị icon search
 */
const SearchBar = () => {
  const { t, i18n } = useTranslation();
  const { filters, updateFilters, setPagination } = useResources();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch });
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearch, filters.search, updateFilters, setPagination]);

  const handleChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClear = () => {
    setSearchInput('');
    updateFilters({ search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/40 bg-slate-900/60 p-3">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder={t('common.search')}
          value={searchInput}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-20 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        {searchInput && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            ✕
          </button>
        )}
      </div>

      <button type="submit" className="btn btn-secondary text-sm px-3">
        {t('common.search_button') || 'Search'}
      </button>

      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={() => setShowLangMenu(prev => !prev)}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Globe className="h-4 w-4" />
          <span>{i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
          <span className="text-xs text-slate-500">▾</span>
        </button>
        {showLangMenu && (
          <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl z-50">
            {[{ code: 'vi', label: '🇻🇳 Tiếng Việt' }, { code: 'en', label: '🇺🇸 English' }].map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => { i18n.changeLanguage(code); localStorage.setItem('language', code); setShowLangMenu(false); }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-slate-800 ${
                  i18n.language === code ? 'text-blue-400 font-semibold' : 'text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden items-center gap-2 border-l border-slate-700 pl-3 md:flex">
        <button type="button" className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
        <button type="button" className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
