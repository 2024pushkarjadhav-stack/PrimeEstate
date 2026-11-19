import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  Heart,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import PropertyForm from '../components/PropertyForm';
import PropertyModal from '../components/PropertyModal';
import PropertyCard from '../components/PropertyCard';

export default function DashboardPage() {
  const {
    currentUser,
    userRole,
    properties,
    leads,
    appointments,
    favorites = [],
    addProperty,
    updateProperty,
    deleteProperty,
    updateLeadStatus,
    updateAppointmentStatus,
  } = useApp();

  const isBuyer = (currentUser?.role || userRole) === 'Buyer';
  const [activeTab, setActiveTab] = useState(isBuyer ? 'my-visits' : 'properties');
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [quickViewProperty, setQuickViewProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Buyer specific filtered lists
  const buyerAppointments = appointments.filter((a) => {
    if (!currentUser) return true;
    const customerId = typeof a.customer === 'object' ? a.customer?._id : a.customer;
    return (
      (customerId && customerId === currentUser._id) ||
      (a.customerEmail &&
        currentUser.email &&
        a.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
    );
  });

  const buyerLeads = leads.filter((l) => {
    if (!currentUser) return true;
    return (
      l.customerEmail &&
      currentUser.email &&
      l.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  });

  const favoriteProps = properties.filter((p) => favorites.includes(p._id));


  // Filter properties by search keyword
  const filteredProperties = properties.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.type.toLowerCase().includes(term)
    );
  });

  // Calculate dynamic KPIs
  const totalPropertiesCount = properties.length;
  const activeLeadsCount = leads.filter((l) => l.status === 'New' || l.status === 'Contacted').length;
  const scheduledVisitsCount = appointments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'Confirmed'
  ).length;
  const closedDealsCount = properties.filter((p) => p.status === 'Sold').length + leads.filter((l) => l.status === 'Closed').length || 4;

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setPropertyModalOpen(true);
  };

  const handleOpenEdit = (prop) => {
    setEditingProperty(prop);
    setPropertyModalOpen(true);
  };

  const handleSaveProperty = async (data) => {
    if (editingProperty) {
      await updateProperty(editingProperty._id, data);
    } else {
      await addProperty(data);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property listing?')) {
      await deleteProperty(id);
    }
  };

  const formatPrice = (price, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
    return type === 'For Rent' ? `${formatted} / mo` : formatted;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Agent Profile Banner */}
        {/* Top Profile Banner (Adaptive for Agent vs Buyer) */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-3xl p-6 sm:p-8 text-white border border-navy-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-600 text-navy-900 font-black text-2xl flex items-center justify-center shadow-lg">
              {currentUser?.name ? currentUser.name.charAt(0) : (isBuyer ? 'B' : 'A')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {currentUser?.name || (isBuyer ? 'Valued Client' : 'Alexander Sterling')}
                </h1>
                <span className="px-2.5 py-0.5 bg-gold-600/90 text-white text-[11px] font-bold uppercase tracking-wider rounded">
                  {isBuyer ? 'Verified Buyer' : 'Pro Agent'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-3">
                <span>{currentUser?.email || (isBuyer ? 'buyer@primeestate.com' : 'agent@primeestate.com')}</span>
                <span>•</span>
                <span className="text-gold-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isBuyer ? 'Active Client Account & Tours' : 'Verified Real Estate Portfolio'}
                </span>
              </p>
            </div>
          </div>

          {isBuyer ? (
            <Link
              to="/listings"
              className="px-5 py-3 bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 shrink-0"
            >
              <Compass className="w-4 h-4" />
              Explore Properties
            </Link>
          ) : (
            <button
              onClick={handleOpenAdd}
              className="px-5 py-3 bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add New Property
            </button>
          )}
        </div>

        {/* 4 KPI Statistic Cards (Adaptive) */}
        {isBuyer ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="My Booked Visits"
              value={buyerAppointments.length}
              subtext="Scheduled property tours"
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Inquiries Sent"
              value={buyerLeads.length}
              subtext="Property inquiries dispatched"
              icon={Users}
              color="amber"
            />
            <StatCard
              title="Saved Favorites"
              value={favorites.length}
              subtext="Shortlisted luxury properties"
              icon={Heart}
              color="purple"
            />
            <StatCard
              title="Active Catalog"
              value={totalPropertiesCount}
              subtext="Luxury listings available"
              icon={Building2}
              color="emerald"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Properties"
              value={totalPropertiesCount}
              subtext="Active in portfolio catalog"
              icon={Building2}
              color="blue"
            />
            <StatCard
              title="Active Leads"
              value={activeLeadsCount}
              subtext="Customer inquiries pending"
              icon={Users}
              color="amber"
            />
            <StatCard
              title="Site Visits"
              value={scheduledVisitsCount}
              subtext="Scheduled property tours"
              icon={Calendar}
              color="purple"
            />
            <StatCard
              title="Closed Deals"
              value={closedDealsCount}
              subtext="Completed sales & leases"
              icon={DollarSign}
              color="emerald"
            />
          </div>
        )}

        {/* Navigation Tabs (Adaptive for Buyer vs Agent) */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {isBuyer ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('my-visits')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'my-visits'
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                My Site Visits ({buyerAppointments.length})
              </button>

              <button
                onClick={() => setActiveTab('my-leads')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'my-leads'
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                My Inquiries ({buyerLeads.length})
              </button>

              <button
                onClick={() => setActiveTab('my-favorites')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'my-favorites'
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                Saved Favorites ({favorites.length})
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'properties'
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Property Management ({properties.length})
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'leads'
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Customer Leads ({leads.length})
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'appointments'
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Appointments & Tours ({appointments.length})
              </button>
            </div>
          )}

          {!isBuyer && activeTab === 'properties' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Buyer Tab 1: Scheduled Visits & Tours */}
        {isBuyer && activeTab === 'my-visits' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-navy-900">My Scheduled Property Tours</h3>
                <p className="text-xs text-slate-500">
                  Confirmed appointments, dates, assigned real estate agents, and live statuses.
                </p>
              </div>
              <Link
                to="/listings"
                className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-gold-400" />
                Book Another Tour
              </Link>
            </div>

            {buyerAppointments.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-navy-900">No Scheduled Tours Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Browse our portfolio and schedule an exclusive private walkthrough with an assigned agent.
                </p>
                <Link
                  to="/listings"
                  className="px-5 py-2.5 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold inline-block"
                >
                  Explore Properties
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {buyerAppointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-navy-900 text-base">
                            {appt.property?.title || 'Luxury Residence'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {appt.property?.location || 'Prime Location'}
                          </p>
                        </div>
                        <span
                          className={`ml-auto md:ml-3 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            appt.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : appt.status === 'Scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : appt.status === 'Completed'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-500">Date & Time: </span>
                          <strong className="text-navy-900">
                            {appt.date} at {appt.time}
                          </strong>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">Assigned Agent: </span>
                          <strong className="text-navy-900">
                            {appt.agent?.name || 'Alexander Sterling'}
                          </strong>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">Agent Phone: </span>
                          <span className="text-slate-700">
                            {appt.agent?.phone || '+1 (555) 234-5678'}
                          </span>
                        </div>
                        {appt.notes && (
                          <div className="sm:col-span-3 pt-1 border-t border-slate-200/60">
                            <span className="font-semibold text-slate-500">Your Notes: </span>
                            <span className="text-slate-700">{appt.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {appt.property?._id && (
                      <Link
                        to={`/property/${appt.property._id}`}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold shrink-0 transition-colors"
                      >
                        View Property
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buyer Tab 2: Submitted Inquiries */}
        {isBuyer && activeTab === 'my-leads' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-navy-900">My Property Inquiries</h3>
                <p className="text-xs text-slate-500">
                  Messages dispatched directly to property agents.
                </p>
              </div>
              <Link
                to="/listings"
                className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-gold-400" />
                Browse Catalog
              </Link>
            </div>

            {buyerLeads.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-navy-900">No Inquiries Submitted Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Send an inquiry on any property listing to contact the assigned agent directly.
                </p>
                <Link
                  to="/listings"
                  className="px-5 py-2.5 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold inline-block"
                >
                  Explore Properties
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {buyerLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-navy-900 text-base">
                          {lead.property?.title || 'Luxury Estate Inquiry'}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            lead.status === 'New'
                              ? 'bg-amber-100 text-amber-800'
                              : lead.status === 'Contacted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{lead.message}"
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {lead.agent?.name && (
                          <span>Assigned Agent: <strong>{lead.agent.name}</strong></span>
                        )}
                        <span>Status: <strong>{lead.status}</strong></span>
                      </div>
                    </div>

                    {lead.property?._id && (
                      <Link
                        to={`/property/${lead.property._id}`}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold shrink-0 transition-colors"
                      >
                        View Property
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buyer Tab 3: Saved Favorites */}
        {isBuyer && activeTab === 'my-favorites' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-navy-900">Saved Favorite Listings</h3>
                <p className="text-xs text-slate-500">
                  Your shortlisted luxury properties saved for quick access and comparison.
                </p>
              </div>
              <Link
                to="/listings"
                className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-gold-400" />
                Explore All
              </Link>
            </div>

            {favoriteProps.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-navy-900">No Favorites Saved Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Click the heart icon on any property to save it to your personal shortlist.
                </p>
                <Link
                  to="/listings"
                  className="px-5 py-2.5 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold inline-block"
                >
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProps.map((prop) => (
                  <PropertyCard key={prop._id} property={prop} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agent Tab 1: Properties Table */}
        {!isBuyer && activeTab === 'properties' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-navy-900">Portfolio Properties</h3>
                <p className="text-xs text-slate-500">
                  Manage your listings, update prices, statuses, or publish new properties.
                </p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-gold-400" />
                Add Listing
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Property</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Specs</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.map((prop) => (
                    <tr key={prop._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.image}
                            alt={prop.title}
                            className="w-14 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-navy-900 truncate max-w-xs">
                              {prop.title}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{prop.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            prop.type === 'For Rent'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {prop.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-navy-900">
                        {formatPrice(prop.price, prop.type)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {prop.bedrooms} Beds • {prop.bathrooms} Baths • {prop.area} sqft
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            prop.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prop.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setQuickViewProperty(prop)}
                            className="p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Quick Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(prop)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Listing"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(prop._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agent Tab 2: Leads Section */}
        {!isBuyer && activeTab === 'leads' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-navy-900">Customer Leads & Inquiries</h3>
              <p className="text-xs text-slate-500">
                Direct buyer requests submitted across your property catalog.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <div
                  key={lead._id}
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-navy-900 text-base">{lead.customerName}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          lead.status === 'New'
                            ? 'bg-amber-100 text-amber-800'
                            : lead.status === 'Contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>📧 {lead.customerEmail}</span>
                      <span>📞 {lead.customerPhone}</span>
                      {lead.property && (
                        <span className="font-medium text-navy-900">
                          🏠 Interest in:{' '}
                          <strong>{lead.property.title || 'Luxury Estate'}</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{lead.message}"
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="shrink-0 flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-500">Status:</label>
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500/50 cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Tab 3: Appointments Section */}
        {!isBuyer && activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-navy-900">Site Visits & Walkthrough Appointments</h3>
              <p className="text-xs text-slate-500">
                Scheduled property showings with prospective buyers.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-900 text-sm sm:text-base">
                          {appt.customerName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {appt.customerEmail} • {appt.customerPhone}
                        </p>
                      </div>
                      <span
                        className={`ml-auto md:ml-2 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          appt.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : appt.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : appt.status === 'Completed'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-500">Date & Time: </span>
                        <strong className="text-navy-900">
                          {appt.date} at {appt.time}
                        </strong>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">Property: </span>
                        <strong className="text-navy-900">
                          {appt.property?.title || 'Luxury Residence'}
                        </strong>
                      </div>
                      {appt.notes && (
                        <div className="sm:col-span-2 pt-1">
                          <span className="font-semibold text-slate-500">Notes: </span>
                          <span className="text-slate-700">{appt.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="shrink-0 flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-500">Update:</label>
                    <select
                      value={appt.status}
                      onChange={(e) => updateAppointmentStatus(appt._id, e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500/50 cursor-pointer"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Property Modal */}
      <PropertyForm
        isOpen={propertyModalOpen}
        isEditing={!!editingProperty}
        initialData={editingProperty}
        onClose={() => {
          setPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onSubmit={handleSaveProperty}
      />

      {/* Quick View Modal */}
      {quickViewProperty && (
        <PropertyModal
          property={quickViewProperty}
          onClose={() => setQuickViewProperty(null)}
        />
      )}
    </div>
  );
}
