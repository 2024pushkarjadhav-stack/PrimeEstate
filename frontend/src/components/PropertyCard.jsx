import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PropertyCard({ property, onQuickView = null }) {
  const { favorites, toggleFavorite } = useApp();

  const isFavorite = favorites.includes(property._id);

  // Format currency
  const formatPrice = (price, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);

    return type === 'For Rent' ? `${formatted} / mo` : formatted;
  };

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property._id);
  };

  const agentName =
    typeof property.agent === 'object' && property.agent !== null
      ? property.agent.name
      : 'Alexander Sterling';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm uppercase tracking-wider backdrop-blur-md ${
                property.type === 'For Rent'
                  ? 'bg-blue-600/95 text-white'
                  : 'bg-emerald-600/95 text-white'
              }`}
            >
              {property.type}
            </span>

            <span
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full shadow-sm backdrop-blur-md ${
                property.status === 'Active'
                  ? 'bg-white/90 text-slate-800'
                  : property.status === 'Pending'
                  ? 'bg-amber-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}
            >
              {property.status}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleHeartClick}
            aria-label="Save to favorites"
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-red-500 hover:bg-white shadow-md transition-all active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'stroke-[2.2]'
              }`}
            />
          </button>
        </div>

        {/* Price on Image */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xl sm:text-2xl font-black text-white drop-shadow-md tracking-tight">
            {formatPrice(property.price, property.type)}
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Title */}
          <Link
            to={`/property/${property._id}`}
            className="block text-base sm:text-lg font-bold text-navy-900 group-hover:text-blue-600 transition-colors line-clamp-1"
          >
            {property.title}
          </Link>

          {/* Short description preview */}
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Property Specs (Bed, Bath, Area) */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
          <div className="flex items-center justify-center gap-1.5">
            <Bed className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold">{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-x border-slate-200">
            <Bath className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold">{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold">{property.area.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Agent Info & Action Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center text-[10px] font-bold">
              {agentName.charAt(0)}
            </div>
            <div className="text-[11px]">
              <span className="text-slate-400 block text-[9px] uppercase font-medium">Listed By</span>
              <span className="font-semibold text-slate-700 truncate max-w-[100px] block">
                {agentName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(property)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Quick View
              </button>
            )}

            <Link
              to={`/property/${property._id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm transition-all group/btn"
            >
              Details
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
