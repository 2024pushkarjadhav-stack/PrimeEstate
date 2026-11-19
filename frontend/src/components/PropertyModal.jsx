import React, { useState } from 'react';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Send,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PropertyModal({ property, onClose }) {
  const { currentUser, submitLead, bookAppointment } = useApp();

  const [activeTab, setActiveTab] = useState('inquiry'); // 'inquiry' | 'visit'
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Inquiry Form State
  const [inquiryData, setInquiryData] = useState({
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    customerPhone: currentUser?.phone || '',
    message: 'Hello, I am interested in this property and would like to learn more details.',
  });

  // Appointment Form State
  const [appointmentData, setAppointmentData] = useState({
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    customerPhone: currentUser?.phone || '',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '11:00 AM',
    notes: 'Looking forward to a tour of the property.',
  });

  if (!property) return null;

  const agent =
    typeof property.agent === 'object' && property.agent !== null
      ? property.agent
      : { name: 'Alexander Sterling', email: 'agent@primeestate.com', phone: '+1 (555) 234-5678' };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        setErrorMessage(res.error || 'Failed to book site visit.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:text-navy-900 flex items-center justify-center shadow-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Media */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-gold-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                {property.type}
              </span>
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full">
                {property.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{property.title}</h2>
            <div className="flex items-center justify-between mt-1">
              <span className="flex items-center gap-1 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-gold-400" />
                {property.location}
              </span>
              <span className="text-2xl font-extrabold text-gold-400">
                {formatPrice(property.price, property.type)}
              </span>
            </div>
          </div>
        </div>

        {/* Specs Strip */}
        <div className="grid grid-cols-3 gap-2 py-3 px-6 bg-slate-50 border-b border-slate-200 text-slate-700">
          <div className="flex items-center justify-center gap-2">
            <Bed className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold">{property.bedrooms} Bedrooms</span>
          </div>
          <div className="flex items-center justify-center gap-2 border-x border-slate-200">
            <Bath className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold">{property.bathrooms} Bathrooms</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Maximize2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold">{property.area.toLocaleString()} sq ft</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-navy-900 mb-2">
              Property Overview
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">{property.description}</p>
          </div>

          {/* Agent Contact Card */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center font-bold text-lg">
                {agent.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-navy-900">{agent.name}</p>
                <p className="text-xs text-slate-500">Licensed Real Estate Agent</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gold-600" /> {agent.email}
                  </span>
                  {agent.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gold-600" /> {agent.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form Tabs: Inquiry vs Visit */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inquiry');
                  setSuccessMessage('');
                  setErrorMessage('');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'inquiry'
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'visit'
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Site Visit
              </button>
            </div>

            {/* Notification alert */}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Tab 1: Inquiry Form */}
            {activeTab === 'inquiry' && (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={inquiryData.customerName}
                      onChange={(e) =>
                        setInquiryData({ ...inquiryData, customerName: e.target.value })
                      }
                      placeholder="e.g. David Miller"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={inquiryData.customerEmail}
                      onChange={(e) =>
                        setInquiryData({ ...inquiryData, customerEmail: e.target.value })
                      }
                      placeholder="e.g. david@example.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Phone</label>
                    <input
                      type="text"
                      required
                      value={inquiryData.customerPhone}
                      onChange={(e) =>
                        setInquiryData({ ...inquiryData, customerPhone: e.target.value })
                      }
                      placeholder="e.g. +1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Message</label>
                  <textarea
                    rows="3"
                    required
                    value={inquiryData.message}
                    onChange={(e) =>
                      setInquiryData({ ...inquiryData, message: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Submitting...' : 'Submit Inquiry to Agent'}
                </button>
              </form>
            )}

            {/* Tab 2: Book Site Visit Form */}
            {activeTab === 'visit' && (
              <form onSubmit={handleAppointmentSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={appointmentData.customerName}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, customerName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={appointmentData.customerEmail}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, customerEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      value={appointmentData.customerPhone}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, customerPhone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={appointmentData.date}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Preferred Time</label>
                    <select
                      value={appointmentData.time}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, time: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Special Tour Requests</label>
                  <input
                    type="text"
                    value={appointmentData.notes}
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, notes: e.target.value })
                    }
                    placeholder="e.g. Interested in floor plans and private parking"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Calendar className="w-3.5 h-3.5 text-gold-400" />
                  {loading ? 'Booking Visit...' : 'Confirm Site Visit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
