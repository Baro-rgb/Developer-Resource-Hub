// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useResources } from '../context/ResourceContext';
import { getCategories } from '../services/api';
import { LayoutDashboard, Package, BarChart3, ShieldCheck, Network, Shield } from 'lucide-react';

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
        const sorted = (response.data || []).sort((a, b) =>
          a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
        );
        setCategories(sorted);
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

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Package, label: 'Resources' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: ShieldCheck, label: 'Admin' },
    { icon: Network, label: 'Management' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-700/40 bg-slate-950/95 py-6">
      <div className="px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20">
            <Shield className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <div className="text-lg font-bold leading-tight text-blue-300">Enterprise Core</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Authority</div>
          </div>
        </div>
      </div>

      <nav className="mb-4 px-2">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${
              item.active
                ? 'bg-blue-500/10 text-blue-300'
                : 'text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto px-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Categories</h2>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.key}>
              <button
                onClick={() => handleCategoryClick(cat.key)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
                  filters.category === cat.key
                    ? 'bg-blue-600/20 text-blue-200'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                {filters.category === cat.key && <span className="text-xs">{expandedCategory === cat.key ? '▼' : '▶'}</span>}
              </button>

              {filters.category === cat.key && expandedCategory === cat.key && (
                <div className="ml-2 mt-2 space-y-1 border-l border-blue-500/40 pl-2">
                  {selectedSubcategories.map((subcat) => (
                    <button
                      key={subcat}
                      onClick={() => handleSubcategoryClick(subcat)}
                      className={`w-full rounded px-2 py-1 text-left text-xs transition-all ${
                        filters.subcategory === subcat
                          ? 'bg-blue-500/20 text-blue-200'
                          : 'text-slate-300 hover:bg-slate-800'
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

        {(filters.category || filters.subcategory || filters.search || filters.source) && (
          <button onClick={resetFilters} className="mt-4 w-full rounded-lg border border-slate-700 py-2 text-sm text-slate-200 hover:bg-slate-800">
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

    </aside>
  );
};

export default Sidebar;
