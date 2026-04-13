// src/context/ResourceContext.js
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Resource Context
 * Quản lý global state cho resources, filters, search
 * 
 * State:
 * - resources: Danh sách resources hiện tại
 * - filters: Các filter đang áp dụng (category, tags, v.v.)
 * - search: Từ khóa tìm kiếm
 * - loading: Loading state
 * - error: Error message
 */

const ResourceContext = createContext();

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within ResourceProvider');
  }
  return context;
};

export const ResourceProvider = ({ children }) => {
  // Resources
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 4,
    pages: 0,
  });

  // Filters & Search
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subcategory: '',
    source: '',
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      subcategory: '',
      source: '',
    });
  }, []);

  const value = useMemo(() => ({
    resources,
    setResources,
    pagination,
    setPagination,
    filters,
    updateFilters,
    resetFilters,
    loading,
    setLoading,
    error,
    setError,
  }), [resources, pagination, filters, updateFilters, resetFilters, loading, error]);

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};
