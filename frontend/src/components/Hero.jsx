import React from 'react';
import { ShieldCheck, Award, Sparkles, Building, KeyRound, Users } from 'lucide-react';
import SearchPanel from './SearchPanel';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-32">
      {/* Background Decorative Architecture Mesh */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-800/80 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>The Premier Real Estate & Agent Management Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find Your Perfect Property with the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500">
              Right Agent
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Browse verified listings, connect with top-rated agents, and manage your real estate
            journey from search to sale — all in one place.
          </p>

          {/* Key Metrics / Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>100% Verified Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-400" />
              <span>Licensed Elite Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-gold-400" />
              <span>Direct Site Visit Booking</span>
            </div>
          </div>
        </div>

        {/* Interactive Search Panel embedded */}
        <div className="mt-10 max-w-4xl mx-auto">
          <SearchPanel isCompact={true} />
        </div>
      </div>
    </section>
  );
}
