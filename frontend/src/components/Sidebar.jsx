// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useResources } from '../context/ResourceContext';
import { getCategories } from '../services/api';

/**
 * Sidebar Component
 * Hiển thị danh sách categories và subcategories để filter
 */
const Sidebar = () => {
  // eslint-disable-next-line no-unused-vars
  const { t } = useTranslation();
  const { filters, updateFilters, resetFilters } = useResources();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Fail to load categories', err);
      }
    };
    loadCategories();
  }, []);

  const handleCategoryClick = (categoryKey) => {
    if (filters.category === categoryKey) {
      // Nếu click lại category đang active, toggle collapse
      setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
    } else {
      // Nếu click category khác, select category mới và mở expand
      updateFilters({
        category: categoryKey,
        subcategory: '', // Reset subcategory khi đổi category
      });
      setExpandedCategory(categoryKey);
    }
  };

  const handleSubcategoryClick = (subcategoryName) => {
    const isSelected = filters.subcategory === subcategoryName;
    updateFilters({
      subcategory: isSelected ? '' : subcategoryName,
    });
  };

  const selectedCategory = filters.category;
  const selectedSubcategories = selectedCategory
    ? categories.find((cat) => cat.key === selectedCategory)?.subcategories || []
    : [];

  return (
    <div className="bg-slate-800 rounded-lg p-6 sticky top-20" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      {/* Header */}
      <h2 className="text-xl font-bold text-white mb-6">📂 DANH MỤC</h2>

      {/* Categories List */}
      <div className="space-y-2 mb-6">
        {categories.map((cat) => (
          <div key={cat.key}>
            {/* Category Button */}
            <button
              onClick={() => handleCategoryClick(cat.key)}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium smooth-transition flex justify-between items-center ${
                filters.category === cat.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>{cat.name}</span>
              {filters.category === cat.key && (
                <span className="text-xs">
                  {expandedCategory === cat.key ? '▼' : '▶'}
                </span>
              )}
            </button>

            {/* Subcategories (Show when category is selected) */}
            {filters.category === cat.key && expandedCategory === cat.key && (
              <div className="mt-2 ml-2 space-y-1 border-l-2 border-blue-600 pl-2">
                {selectedSubcategories.map((subcat) => (
                  <button
                    key={subcat}
                    onClick={() => handleSubcategoryClick(subcat)}
                    className={`w-full text-left px-3 py-1 rounded text-sm smooth-transition ${
                      filters.subcategory === subcat
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    • {subcat}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reset Button */}
      {(filters.category || filters.subcategory || filters.search || filters.source) && (
        <button
          onClick={resetFilters}
          className="w-full btn-secondary py-2 text-sm"
        >
          <span className="mr-2">✕</span>Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

export default Sidebar;
