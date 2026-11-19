import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Home,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, userRole, logout, favorites, isBackendConnected } =
    useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-navy-900 via-navy-800 to-blue-900 flex items-center justify-center shadow-md text-gold-400 group-hover:text-gold-300 transition-colors">
              <Building2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-navy-900 flex items-center gap-1.5">
                Prime<span className="text-gold-600">Estate</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-600 block -mt-1">
                Luxury & Agent Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100/70'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link
              to="/listings"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/listings')
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              Listings
            </Link>

            {/* Dashboard Link (Agent Dashboard or Buyer Dashboard) */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'text-amber-700 bg-amber-50 font-semibold border border-amber-200'
                    : userRole === 'Agent'
                    ? 'text-amber-800 bg-amber-50/60 hover:bg-amber-100/80 font-medium'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100/70'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-gold-600" />
                {userRole === 'Agent' ? 'Agent Dashboard' : 'My Dashboard'}
                {userRole === 'Agent' && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-white rounded">
                    Pro
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* Desktop Right Actions: Notifications, Favorites & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Real-Time WebSocket Notification Bell (Exp 8) */}
            <NotificationBell />

            {/* Favorites Icon Button */}
            <Link
              to="/listings"
              title="View saved properties in catalog"
              className="relative p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white animate-pulse">
                  {favorites.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center font-bold text-sm shadow-sm border border-navy-700">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-navy-900 leading-tight">
                      {currentUser?.name}
                    </p>
                    <span className="inline-block px-1.5 py-0.2 text-[10px] font-medium rounded text-slate-600 bg-slate-100 uppercase tracking-wider">
                      {currentUser?.role || userRole}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-navy-900 hover:text-blue-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gold-600 hover:bg-gold-700 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Actions: Notifications, Favorites & Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            {favorites.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-semibold px-2 py-1 bg-red-50 rounded-full">
                <Heart className="w-3.5 h-3.5 fill-red-500" />
                {favorites.length}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/listings"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/listings') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Listings & Search
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-semibold ${
                  isActive('/dashboard')
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {userRole === 'Agent' ? 'Agent Dashboard (Pro)' : 'My Dashboard & Visits'}
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center font-bold text-xs">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-navy-900 border border-slate-200 hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gold-600 hover:bg-gold-700 shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
