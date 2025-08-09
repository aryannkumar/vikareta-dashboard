'use client';

import { useState, useMemo } from 'react';
import { usePagination } from './use-pagination';
import { useDebounce } from './use-debounce';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  [key: string]: any;
}

interface UseTableProps<T> {
  data: T[];
  initialSort?: SortConfig;
  initialFilters?: FilterConfig;
  itemsPerPage?: number;
  searchFields?: (keyof T)[];
}

/**
 * Hook for table functionality including sorting, filtering, searching, and pagination
 */
export function useTable<T extends Record<string, any>>({
  data,
  initialSort,
  initialFilters = {},
  itemsPerPage = 20,
  searchFields = [],
}: UseTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null);
  const [filters, setFilters] = useState<FilterConfig>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter data based on filters and search
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filtered = filtered.filter(item => {
          const itemValue = item[key];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          if (typeof value === 'string') {
            return String(itemValue).toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        });
      }
    });

    // Apply search
    if (debouncedSearchQuery && searchFields.length > 0) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    return filtered;
  }, [data, filters, debouncedSearchQuery, searchFields]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const pagination = usePagination({
    totalItems: sortedData.length,
    itemsPerPage,
  });

  // Get current page data
  const paginatedData = useMemo(() => {
    const startIndex = pagination.startIndex;
    const endIndex = startIndex + pagination.itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination.startIndex, pagination.itemsPerPage]);

  // Sorting functions
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // Remove sorting
    });
  };

  const getSortDirection = (key: string): 'asc' | 'desc' | null => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction;
  };

  // Filter functions
  const setFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    pagination.goToFirstPage(); // Reset to first page when filtering
  };

  const removeFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    pagination.goToFirstPage();
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    pagination.goToFirstPage();
  };

  // Search functions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    pagination.goToFirstPage(); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    pagination.goToFirstPage();
  };

  // Reset all
  const reset = () => {
    setSortConfig(initialSort || null);
    setFilters(initialFilters);
    setSearchQuery('');
    pagination.goToFirstPage();
  };

  return {
    // Data
    data: paginatedData,
    filteredData,
    sortedData,
    totalItems: sortedData.length,
    
    // Sorting
    sortConfig,
    handleSort,
    getSortDirection,
    
    // Filtering
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    
    // Searching
    searchQuery,
    handleSearch,
    clearSearch,
    
    // Pagination
    pagination,
    
    // Utilities
    reset,
    isEmpty: paginatedData.length === 0,
    isFiltered: Object.keys(filters).length > 0 || searchQuery.length > 0,
  };
}