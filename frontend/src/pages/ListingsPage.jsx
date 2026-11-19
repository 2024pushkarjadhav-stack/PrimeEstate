import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Building,
  DollarSign,
  BedDouble,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import PropertyCard from '../components/PropertyCard';
import PropertyModal from '../components/PropertyModal';

export default function ListingsPage() {
  const [searchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState(null);

  const {
    filteredProperties,
    totalCount,
    filteredCount,
    loading,
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
  } = useProperties();

  // Sync initial query params from URL if any
  useEffect(() => {
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const budget = searchParams.get('budget');
    const bedrooms = searchParams.get('bedrooms');

    if (search) setSearchTerm(search);
    if (type) setTypeFilter(type);
    if (budget) setBudgetFilter(budget);
    if (bedrooms) setBedroomsFilter(bedrooms);
  }, [searchParams, setSearchTerm, setTypeFilter, setBudgetFilter, setBedroomsFilter]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Real Estate Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Explore Property Listings
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Find your dream residential property, penthouse, or villa with comprehensive filters.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-premium space-y-4">
          {/* Top Row: Type Tabs & Search */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Type Filter Buttons */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl self-start">
              {['All', 'For Sale', 'For Rent'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    typeFilter === type
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-200/60'
                  }`}
                >
                  {type === 'All' ? 'All Properties' : type}
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by city, neighborhood, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Bottom Row: Detailed Dropdowns & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            {/* Budget */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Budget Range
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500/50 appearance-none font-medium cursor-pointer"
                >
                  <option value="All">All Price Ranges</option>
                  {typeFilter === 'For Rent' ? (
                    <>
                      <option value="under-5k">Under $5,000 / mo</option>
                      <option value="5k-15k">$5,000 - $15,000 / mo</option>
                      <option value="above-15k">$15,000+ / mo</option>
                    </>
                  ) : (
                    <>
                      <option value="under-500k">Under $500,000</option>
                      <option value="500k-1m">$500,000 - $1,000,000</option>
                      <option value="1m-3m">$1,000,000 - $3,000,000</option>
                      <option value="above-3m">$3,000,000+</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Bedrooms
              </label>
              <div className="relative">
                <BedDouble className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={bedroomsFilter}
                  onChange={(e) => setBedroomsFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500/50 appearance-none font-medium cursor-pointer"
                >
                  <option value="All">Any Bedrooms</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4+">4+ Bedrooms</option>
                </select>
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <div className="relative">
                <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500/50 appearance-none font-medium cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="beds">Most Bedrooms</option>
                </select>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full py-2 px-3 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Counter and Results Header */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1">
          <p>
            Showing <strong className="text-navy-900 font-bold">{filteredCount}</strong> of{' '}
            <strong className="text-navy-900 font-bold">{totalCount}</strong> total listings
          </p>
          {(searchTerm || typeFilter !== 'All' || budgetFilter !== 'All' || bedroomsFilter !== 'All') && (
            <span className="text-gold-600 font-semibold">Active filters applied</span>
          )}
        </div>

        {/* Properties Grid */}
        {filteredCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onQuickView={(p) => setSelectedProperty(p)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-gold-600 flex items-center justify-center mx-auto">
              <Building className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-900">No Properties Found</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              We couldn't find any properties matching your current search criteria. Try adjusting
              your location keyword or resetting the price and bedroom filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gold-400" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}
