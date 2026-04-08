// src/components/SearchBar.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResources } from '../context/ResourceContext';
import useDebounce from '../hooks/useDebounce';

/**
 * SearchBar Component
 * Thanh tìm kiếm với debounce
 * - Input field để nhập từ khóa
 * - Debounce 500ms trước khi gọi API
 * - Hiển thị icon search
 */
const SearchBar = () => {
  const { t } = useTranslation();
  const { filters, updateFilters, setPagination } = useResources();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

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
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        {/* Search Icon */}
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
          🔍
        </span>

        {/* Input */}
        <input
          type="text"
          placeholder={t('common.search')}
          value={searchInput}
          onChange={handleChange}
          className="input pl-10 pr-24"
        />

        {/* Clear Button */}
        {searchInput && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-secondary text-sm px-3"
        >
          {t('common.search_button') || 'Search'}
        </button>
      </div>

      {/* Search hint */}
      <p className="text-xs text-slate-400 mt-2">
        💡 Search by title or description
      </p>
    </form>
  );
};

export default SearchBar;
