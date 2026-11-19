import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useProperties() {
  const { properties, loading, error } = useApp();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'For Sale' | 'For Rent'
  const [budgetFilter, setBudgetFilter] = useState('All'); // 'All' | 'under-500k' | '500k-1m' | '1m-3m' | 'above-3m' | 'under-5k' | '5k-15k' | 'above-15k'
  const [bedroomsFilter, setBedroomsFilter] = useState('All'); // 'All' | '1' | '2' | '3' | '4+'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-low' | 'price-high' | 'beds'

  // Filter and Sort Logic
  const filteredProperties = useMemo(() => {
    if (!properties || !Array.isArray(properties)) return [];

    return properties
      .filter((property) => {
        // Search Term (matches title, location, or description)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchesTitle = property.title?.toLowerCase().includes(term);
          const matchesLocation = property.location?.toLowerCase().includes(term);
          const matchesDesc = property.description?.toLowerCase().includes(term);
          if (!matchesTitle && !matchesLocation && !matchesDesc) {
            return false;
          }
        }

        // Type Filter
        if (typeFilter !== 'All' && property.type !== typeFilter) {
          return false;
        }

        // Bedrooms Filter
        if (bedroomsFilter !== 'All') {
          if (bedroomsFilter === '4+') {
            if (property.bedrooms < 4) return false;
          } else {
            if (property.bedrooms !== parseInt(bedroomsFilter, 10)) return false;
          }
        }

        // Budget Filter
        if (budgetFilter !== 'All') {
          const price = property.price;
          switch (budgetFilter) {
            case 'under-500k':
              if (price > 500000) return false;
              break;
            case '500k-1m':
              if (price < 500000 || price > 1000000) return false;
              break;
            case '1m-3m':
              if (price < 1000000 || price > 3000000) return false;
              break;
            case 'above-3m':
              if (price < 3000000) return false;
              break;
            case 'under-5k':
              if (price > 5000) return false;
              break;
            case '5k-15k':
              if (price < 5000 || price > 15000) return false;
              break;
            case 'above-15k':
              if (price < 15000) return false;
              break;
            default:
              break;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'beds') return b.bedrooms - a.bedrooms;
        // Default newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [properties, searchTerm, typeFilter, budgetFilter, bedroomsFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setBudgetFilter('All');
    setBedroomsFilter('All');
    setSortBy('newest');
  };

  return {
    properties,
    filteredProperties,
    totalCount: properties.length,
    filteredCount: filteredProperties.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    budgetFilter,
    setBudgetFilter,
    bedroomsFilter,
    setBedroomsFilter,
    sortBy,
    setSortBy,
    resetFilters,
  };
}
