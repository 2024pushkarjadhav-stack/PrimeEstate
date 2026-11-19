import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-800 to-blue-900 border border-slate-700 flex items-center justify-center text-gold-400">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Prime<span className="text-gold-500">Estate</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              PrimeEstate connects discerning property buyers and tenants with premier licensed
              real estate agents. Experience seamless end-to-end property discovery, VIP site tours,
              and transaction management.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400 bg-navy-800/80 px-3 py-2 rounded-lg border border-navy-700 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Agent Network & Verified Listings</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-base tracking-wide">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/listings" className="hover:text-gold-400 transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link to="/listings?type=For+Sale" className="hover:text-gold-400 transition-colors">
                  Homes For Sale
                </Link>
              </li>
              <li>
                <Link to="/listings?type=For+Rent" className="hover:text-gold-400 transition-colors">
                  Luxury Rentals
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-gold-400 transition-colors">
                  Agent Portal & Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Concierge */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-base tracking-wide">Concierge Desk</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+1 (800) 555-PRIME (7746)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>concierge@primeestate.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>450 Beverly Boulevard, Suite 800, Beverly Hills, CA 90210</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Semester Project Note */}
          <div className="space-y-4 bg-navy-800/50 p-5 rounded-2xl border border-navy-700">
            <h4 className="text-white font-semibold text-sm tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Full Stack Semester Project
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              PrimeEstate is built with React, Vite, Tailwind CSS, Context API & useReducer, Express.js, MongoDB, JWT auth, and role-based access control.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-navy-700">
              Implementing Experiments 1 through 6.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrimeEstate Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Designed for excellence in real estate technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
