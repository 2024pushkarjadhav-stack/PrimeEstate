import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, BedDouble, SlidersHorizontal } from 'lucide-react';

export default function SearchPanel({
  initialSearch = '',
  initialType = 'All',
  initialBudget = 'All',
  initialBedrooms = 'All',
  onSearch = null,
  isCompact = false,
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [budget, setBudget] = useState(initialBudget);
  const [bedrooms, setBedrooms] = useState(initialBedrooms);

  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        searchTerm,
        type,
        budget,
        bedrooms,
      });
    } else {
      // Navigate to /listings with query parameters
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (type !== 'All') params.set('type', type);
      if (budget !== 'All') params.set('budget', budget);
      if (bedrooms !== 'All') params.set('bedrooms', bedrooms);

      navigate(`/listings?${params.toString()}`);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200/80 transition-all ${
        isCompact ? 'max-w-4xl mx-auto' : 'w-full'
      }`}
    >
      <form onSubmit={handleSearchSubmit}>
        {/* Type Toggle Tabs */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setType('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              type === 'All'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Listings
          </button>
          <button
            type="button"
            onClick={() => setType('For Sale')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              type === 'For Sale'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Buy Property
          </button>
          <button
            type="button"
            onClick={() => setType('For Rent')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              type === 'For Rent'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rent Property
          </button>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Location / Search */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Location / Keyword
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="City, neighborhood, or villa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Budget Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Price Range
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium text-slate-800 appearance-none cursor-pointer"
              >
                <option value="All">Any Budget</option>
                {type === 'For Rent' ? (
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

          {/* Bedrooms Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bedrooms
            </label>
            <div className="relative">
              <BedDouble className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium text-slate-800 appearance-none cursor-pointer"
              >
                <option value="All">Any Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4+">4+ Bedrooms</option>
              </select>
            </div>
          </div>

          {/* Submit Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full h-[42px] bg-gradient-to-r from-gold-600 to-amber-600 hover:from-gold-700 hover:to-amber-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              Search Properties
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
