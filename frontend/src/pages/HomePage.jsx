import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  KeyRound,
  Users,
  Building,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import PropertyModal from '../components/PropertyModal';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { properties } = useApp();
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Take at least 6 featured properties
  const featuredProperties = properties.slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <Hero />

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Handpicked Collections
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
              Featured Exclusive Listings
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl">
              Explore our curated portfolio of premier residential estates, luxury penthouses,
              and waterfront villas.
            </p>
          </div>

          <Link
            to="/listings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-navy-900 text-navy-900 hover:text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow group self-start md:self-auto"
          >
            Explore All Listings
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onQuickView={(p) => setSelectedProperty(p)}
            />
          ))}
        </div>
      </section>

      {/* Why Choose PrimeEstate Value Props */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              The PrimeEstate Advantage
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Elevating the real estate discovery and management experience for buyers, tenants, and licensed agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-premium">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                100% Verified Listings
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Every property on PrimeEstate is thoroughly vetted for legal compliance, accurate pricing, and authentic architectural photography.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-premium">
              <div className="w-12 h-12 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                Top-Tier Agent Network
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Work directly with dedicated, top-producing local agents equipped with real-time CRM tools to guide you at every milestone.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-premium">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                Effortless Site Visits
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Schedule in-person walkthroughs or virtual VIP tours in just a few clicks with instant calendar coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative rounded-3xl overflow-hidden bg-navy-900 text-white p-8 sm:p-12 lg:p-16 border border-navy-800 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="px-3.5 py-1 bg-gold-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
              For Licensed Real Estate Agents
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Expand Your Reach with PrimeEstate Pro
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Showcase luxury listings to pre-qualified buyers, manage inquiries through dedicated lead CRM, and coordinate site visits seamlessly.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 bg-gold-600 hover:bg-gold-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:shadow-xl active:scale-95"
              >
                Register as an Agent
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-all"
              >
                View Agent Dashboard Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

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
