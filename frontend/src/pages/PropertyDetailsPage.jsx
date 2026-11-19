import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Share2,
  Calendar,
  Send,
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, favorites, toggleFavorite, currentUser, submitLead, bookAppointment } =
    useApp();

  const [activeTab, setActiveTab] = useState('inquiry'); // 'inquiry' | 'visit'
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Inquiry Form
  const [inquiryData, setInquiryData] = useState({
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    customerPhone: currentUser?.phone || '',
    message: 'Hello, I am interested in this property and would like to schedule a private tour.',
  });

  // Appointment Form
  const [appointmentData, setAppointmentData] = useState({
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    customerPhone: currentUser?.phone || '',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '11:00 AM',
    notes: 'Please confirm the private tour appointment.',
  });

  // Find property by id
  const property = properties.find((p) => p._id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <Building2 className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-navy-900 mb-2">Property Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested listing could not be found or has been removed.
        </p>
        <Link
          to="/listings"
          className="px-6 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(property._id);

  const formatPrice = (price, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
    return type === 'For Rent' ? `${formatted} / mo` : formatted;
  };

  const agent =
    typeof property.agent === 'object' && property.agent !== null
      ? property.agent
      : {
          name: 'Alexander Sterling',
          email: 'agent@primeestate.com',
          phone: '+1 (555) 234-5678',
        };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await submitLead({
        ...inquiryData,
        property: property._id,
      });
      if (res.success) {
        setSuccessMessage(res.message || 'Inquiry submitted successfully!');
      } else {
        setErrorMessage(res.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await bookAppointment({
        ...appointmentData,
        property: property._id,
      });
      if (res.success) {
        setSuccessMessage(res.message || 'Site visit booked successfully!');
      } else {
        setErrorMessage(res.error || 'Failed to schedule appointment.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(property._id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isFavorite
                  ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-500'
                }`}
              />
              {isFavorite ? 'Saved in Favorites' : 'Save Property'}
            </button>
          </div>
        </div>

        {/* Hero Gallery Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[420px] sm:h-[500px] bg-navy-900">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Badges on Gallery */}
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span
              className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider backdrop-blur-md shadow-md ${
                property.type === 'For Rent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {property.type}
            </span>
            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 text-navy-900 backdrop-blur-md shadow-md">
              {property.status}
            </span>
          </div>

          {/* Bottom Title & Price */}
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm text-slate-300 mb-1.5">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>{property.location}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {property.title}
              </h1>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-3xl sm:text-4xl font-black text-gold-400 drop-shadow-md">
                {formatPrice(property.price, property.type)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details & Specs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Specs Bar */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-premium text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center text-blue-600">
                  <Bed className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-navy-900">{property.bedrooms}</p>
                <p className="text-xs text-slate-500 font-medium">Bedrooms</p>
              </div>

              <div className="space-y-1 border-x border-slate-100">
                <div className="flex items-center justify-center text-blue-600">
                  <Bath className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-navy-900">{property.bathrooms}</p>
                <p className="text-xs text-slate-500 font-medium">Bathrooms</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center text-blue-600">
                  <Maximize2 className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-navy-900">
                  {property.area.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 font-medium">Square Feet</p>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-premium space-y-4">
              <h3 className="text-xl font-bold text-navy-900">About This Residence</h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Property Features List */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-premium space-y-4">
              <h3 className="text-xl font-bold text-navy-900">Key Amenities & Highlights</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  'Custom Chef Kitchen',
                  'Smart Home Automation',
                  'Private Outdoor Lounge',
                  'Floor-to-Ceiling Windows',
                  'Hardwood Flooring',
                  'Private Parking Garage',
                  'Spa-Inspired Bathrooms',
                  'High-Speed Fiber Ready',
                  '24/7 Security System',
                ].map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Agent Card & Contact / Booking Form */}
          <div className="space-y-6">
            {/* Agent Profile Card */}
            <div className="bg-navy-900 text-white rounded-2xl p-6 border border-navy-800 shadow-xl space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                Listing Agent
              </span>
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-500 text-navy-900 flex items-center justify-center font-black text-xl shadow-md">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">{agent.name}</h4>
                  <p className="text-xs text-slate-300">Licensed Real Estate Specialist</p>
                  <div className="flex items-center gap-1 text-[11px] text-gold-400 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PrimeEstate Certified</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-navy-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span className="truncate">{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>{agent.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inquiry / Booking Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-premium space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inquiry');
                    setSuccessMessage('');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'inquiry'
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Inquiry
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('visit');
                    setSuccessMessage('');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'visit'
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Visit
                </button>
              </div>

              {/* Status Alert */}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tab 1: Inquiry Form */}
              {activeTab === 'inquiry' && (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryData.customerName}
                      onChange={(e) =>
                        setInquiryData({ ...inquiryData, customerName: e.target.value })
                      }
                      placeholder="Your full name"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryData.customerEmail}
                      onChange={(e) =>
                        setInquiryData({ ...inquiryData, customerEmail: e.target.value })
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryData.customerPhone}
                      onChange={(e) =>
                        setInquiryData({ ...inquiryData, customerPhone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Message *
                    </label>
                    <textarea
                      rows="3"
                      required
                      value={inquiryData.message}
                      onChange={(e) =>
                        setInquiryData({ ...inquiryData, message: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-2.5 bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {formLoading ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </form>
              )}

              {/* Tab 2: Site Visit Booking */}
              {activeTab === 'visit' && (
                <form onSubmit={handleAppointmentSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={appointmentData.customerName}
                      onChange={(e) =>
                        setAppointmentData({
                          ...appointmentData,
                          customerName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={appointmentData.customerEmail}
                      onChange={(e) =>
                        setAppointmentData({
                          ...appointmentData,
                          customerEmail: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={appointmentData.customerPhone}
                      onChange={(e) =>
                        setAppointmentData({
                          ...appointmentData,
                          customerPhone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Tour Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={appointmentData.date}
                        onChange={(e) =>
                          setAppointmentData({ ...appointmentData, date: e.target.value })
                        }
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Tour Time *
                      </label>
                      <select
                        value={appointmentData.time}
                        onChange={(e) =>
                          setAppointmentData({ ...appointmentData, time: e.target.value })
                        }
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold-500/50"
                      >
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Calendar className="w-3.5 h-3.5 text-gold-400" />
                    {formLoading ? 'Booking...' : 'Book VIP Site Visit'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
