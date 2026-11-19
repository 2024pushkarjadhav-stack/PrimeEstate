import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  DEMO_USERS,
  INITIAL_PROPERTIES,
  INITIAL_LEADS,
  INITIAL_APPOINTMENTS,
} from '../data/demoData';
import {
  authService,
  propertyService,
  leadService,
  appointmentService,
} from '../services/api';
import { getSocket, disconnectSocket } from '../services/socket';

// Create App Context
export const AppContext = createContext();

// Initial State
const savedFavorites = JSON.parse(localStorage.getItem('primeestate_favorites') || '[]');
const savedToken = localStorage.getItem('primeestate_token');
const savedUser = JSON.parse(localStorage.getItem('primeestate_user') || 'null');

const initialState = {
  // Auth state
  currentUser: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken && !!savedUser,
  userRole: savedUser ? savedUser.role : null,

  // Properties state
  properties: INITIAL_PROPERTIES,
  selectedProperty: null,
  loading: false,
  error: null,

  // Favorites state (array of property IDs)
  favorites: savedFavorites,

  // Leads & Appointments
  leads: INITIAL_LEADS,
  appointments: INITIAL_APPOINTMENTS,

  // Backend connection status
  isBackendConnected: false,

  // Real-Time WebSockets (Socket.IO - Exp 8)
  notifications: [
    {
      id: 'welcome_realtime_notif',
      type: 'property',
      title: 'Real-Time Sync Active',
      message: 'Socket.IO WebSocket is active. Property listings and appointments sync automatically.',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ],
  socketConnected: false,
};

// Reducer Function
function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      const { user, token } = action.payload;
      localStorage.setItem('primeestate_token', token);
      localStorage.setItem('primeestate_user', JSON.stringify(user));
      return {
        ...state,
        currentUser: user,
        token: token,
        isAuthenticated: true,
        userRole: user.role,
        error: null,
      };
    }

    case 'LOGOUT': {
      localStorage.removeItem('primeestate_token');
      localStorage.removeItem('primeestate_user');
      return {
        ...state,
        currentUser: null,
        token: null,
        isAuthenticated: false,
        userRole: null,
      };
    }

    case 'SET_PROPERTIES': {
      return {
        ...state,
        properties: action.payload,
        loading: false,
        error: null,
      };
    }

    case 'SELECT_PROPERTY': {
      return {
        ...state,
        selectedProperty: action.payload,
      };
    }

    case 'ADD_PROPERTY': {
      const updated = [action.payload, ...state.properties];
      return {
        ...state,
        properties: updated,
      };
    }

    case 'UPDATE_PROPERTY': {
      const updated = state.properties.map((p) =>
        p._id === action.payload._id ? action.payload : p
      );
      return {
        ...state,
        properties: updated,
        selectedProperty:
          state.selectedProperty?._id === action.payload._id
            ? action.payload
            : state.selectedProperty,
      };
    }

    case 'DELETE_PROPERTY': {
      const updated = state.properties.filter((p) => p._id !== action.payload);
      return {
        ...state,
        properties: updated,
        selectedProperty:
          state.selectedProperty?._id === action.payload ? null : state.selectedProperty,
      };
    }

    case 'TOGGLE_FAVORITE': {
      const propId = action.payload;
      const exists = state.favorites.includes(propId);
      const newFavs = exists
        ? state.favorites.filter((id) => id !== propId)
        : [...state.favorites, propId];
      localStorage.setItem('primeestate_favorites', JSON.stringify(newFavs));
      return {
        ...state,
        favorites: newFavs,
      };
    }

    case 'SET_LEADS': {
      return {
        ...state,
        leads: action.payload,
      };
    }

    case 'ADD_LEAD': {
      return {
        ...state,
        leads: [action.payload, ...state.leads],
      };
    }

    case 'UPDATE_LEAD': {
      const updated = state.leads.map((l) =>
        l._id === action.payload._id ? action.payload : l
      );
      return {
        ...state,
        leads: updated,
      };
    }

    case 'SET_APPOINTMENTS': {
      return {
        ...state,
        appointments: action.payload,
      };
    }

    case 'ADD_APPOINTMENT': {
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
      };
    }

    case 'UPDATE_APPOINTMENT': {
      const updated = state.appointments.map((a) =>
        a._id === action.payload._id ? action.payload : a
      );
      return {
        ...state,
        appointments: updated,
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        loading: action.payload,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    }

    case 'SET_BACKEND_STATUS': {
      return {
        ...state,
        isBackendConnected: action.payload,
      };
    }

    case 'ADD_NOTIFICATION': {
      const exists = state.notifications.some(
        (n) => n.id === action.payload.id || (n._id && n._id === action.payload._id)
      );
      if (exists) return state;
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 30),
      };
    }

    case 'CLEAR_NOTIFICATIONS': {
      return {
        ...state,
        notifications: [],
      };
    }

    case 'MARK_NOTIFICATIONS_READ': {
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    }

    case 'SET_SOCKET_STATUS': {
      return {
        ...state,
        socketConnected: action.payload,
      };
    }

    default:
      return state;
  }
}

// Context Provider Component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize Properties, Leads, and Appointments from API or fallback
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Attempt to fetch from real backend
        const propRes = await propertyService.getAll();
        if (isMounted && propRes.data && propRes.data.length > 0) {
          dispatch({ type: 'SET_PROPERTIES', payload: propRes.data });
          dispatch({ type: 'SET_BACKEND_STATUS', payload: true });
        } else {
          // Fallback to demo properties
          if (isMounted) {
            dispatch({ type: 'SET_PROPERTIES', payload: INITIAL_PROPERTIES });
          }
        }
      } catch (err) {
        console.log('Using local fallback demo dataset (Backend REST API offline or initializing)');
        if (isMounted) {
          dispatch({ type: 'SET_PROPERTIES', payload: INITIAL_PROPERTIES });
          dispatch({ type: 'SET_BACKEND_STATUS', payload: false });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }

      // If user is authenticated, attempt to fetch leads and appointments
      if (state.token) {
        try {
          const [leadsRes, apptsRes] = await Promise.allSettled([
            leadService.getAll(),
            appointmentService.getAll(),
          ]);

          if (isMounted && leadsRes.status === 'fulfilled' && leadsRes.value.data) {
            dispatch({ type: 'SET_LEADS', payload: leadsRes.value.data });
          }
          if (isMounted && apptsRes.status === 'fulfilled' && apptsRes.value.data) {
            dispatch({ type: 'SET_APPOINTMENTS', payload: apptsRes.value.data });
          }
        } catch (err) {
          // Keep initial demo leads & appointments
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [state.token]);

  // Real-Time Socket.IO Synchronization (Exp 8)
  useEffect(() => {
    const socket = getSocket(state.token);

    const handleConnect = () => {
      console.log('[Socket.IO] Connected to backend real-time server');
      dispatch({ type: 'SET_SOCKET_STATUS', payload: true });
    };

    const handleDisconnect = () => {
      console.log('[Socket.IO] Disconnected from real-time server');
      dispatch({ type: 'SET_SOCKET_STATUS', payload: false });
    };

    // Real-time Property Events
    const handlePropertyCreated = (newProperty) => {
      if (newProperty && newProperty._id) {
        dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
      }
    };

    const handlePropertyUpdated = (updatedProp) => {
      if (updatedProp && updatedProp._id) {
        dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProp });
      }
    };

    const handlePropertyDeleted = (deletedId) => {
      if (deletedId) {
        dispatch({ type: 'DELETE_PROPERTY', payload: deletedId });
      }
    };

    // Real-time Appointment Events
    const handleAppointmentCreated = (newAppt) => {
      if (newAppt && newAppt._id) {
        dispatch({ type: 'ADD_APPOINTMENT', payload: newAppt });
      }
    };

    const handleAppointmentUpdated = (updatedAppt) => {
      if (updatedAppt && updatedAppt._id) {
        dispatch({ type: 'UPDATE_APPOINTMENT', payload: updatedAppt });
      }
    };

    // Real-time Lead Events
    const handleLeadCreated = (newLead) => {
      if (newLead && newLead._id) {
        dispatch({ type: 'ADD_LEAD', payload: newLead });
      }
    };

    // Real-time Notifications for NotificationBell
    const handleNotification = (notif) => {
      if (notif) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('property:created', handlePropertyCreated);
    socket.on('property:updated', handlePropertyUpdated);
    socket.on('property:deleted', handlePropertyDeleted);
    socket.on('appointment:created', handleAppointmentCreated);
    socket.on('appointment:updated', handleAppointmentUpdated);
    socket.on('lead:created', handleLeadCreated);
    socket.on('notification:new', handleNotification);

    if (socket.connected) {
      dispatch({ type: 'SET_SOCKET_STATUS', payload: true });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('property:created', handlePropertyCreated);
      socket.off('property:updated', handlePropertyUpdated);
      socket.off('property:deleted', handlePropertyDeleted);
      socket.off('appointment:created', handleAppointmentCreated);
      socket.off('appointment:updated', handleAppointmentUpdated);
      socket.off('lead:created', handleLeadCreated);
      socket.off('notification:new', handleNotification);
    };
  }, [state.token]);

  // Auth Actions (Production-Ready Real User Authentication)
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authService.login({ email, password });
      dispatch({
        type: 'LOGIN',
        payload: { user: res.user, token: res.token },
      });
      dispatch({ type: 'SET_BACKEND_STATUS', payload: true });
      return { success: true, user: res.user };
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password credentials.';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authService.register(userData);
      dispatch({
        type: 'LOGIN',
        payload: { user: res.user, token: res.token },
      });
      dispatch({ type: 'SET_BACKEND_STATUS', payload: true });
      return { success: true, user: res.user };
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check your details.';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    disconnectSocket();
    dispatch({ type: 'LOGOUT' });
  };

  // Property Actions
  const addProperty = async (propertyData) => {
    try {
      if (state.isBackendConnected) {
        const res = await propertyService.create(propertyData);
        dispatch({ type: 'ADD_PROPERTY', payload: res.data });
        return { success: true, data: res.data };
      }
    } catch (err) {
      console.warn('Backend create failed, saving to local state:', err.message);
    }

    // Local state fallback
    const newProperty = {
      ...propertyData,
      _id: 'prop-' + Date.now(),
      agent: state.currentUser || DEMO_USERS.agent,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
    return { success: true, data: newProperty };
  };

  const updateProperty = async (id, propertyData) => {
    try {
      if (state.isBackendConnected) {
        const res = await propertyService.update(id, propertyData);
        dispatch({ type: 'UPDATE_PROPERTY', payload: res.data });
        return { success: true, data: res.data };
      }
    } catch (err) {
      console.warn('Backend update failed, saving to local state:', err.message);
    }

    const existing = state.properties.find((p) => p._id === id);
    const updated = { ...existing, ...propertyData };
    dispatch({ type: 'UPDATE_PROPERTY', payload: updated });
    return { success: true, data: updated };
  };

  const deleteProperty = async (id) => {
    try {
      if (state.isBackendConnected) {
        await propertyService.delete(id);
      }
    } catch (err) {
      console.warn('Backend delete failed, removing from local state:', err.message);
    }
    dispatch({ type: 'DELETE_PROPERTY', payload: id });
    return { success: true };
  };

  // Lead / Inquiry Action
  const submitLead = async (leadData) => {
    try {
      if (state.isBackendConnected) {
        const res = await leadService.create(leadData);
        dispatch({ type: 'ADD_LEAD', payload: res.data });
        return { success: true, message: res.message };
      }
    } catch (err) {
      console.warn('Backend lead submission failed, saving to local state');
    }

    const property = state.properties.find((p) => p._id === leadData.property);
    const newLead = {
      _id: 'lead-' + Date.now(),
      ...leadData,
      property: property || null,
      agent: property?.agent || DEMO_USERS.agent,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_LEAD', payload: newLead });
    return { success: true, message: 'Inquiry submitted successfully! The agent will contact you soon.' };
  };

  const updateLeadStatus = async (id, status) => {
    try {
      if (state.isBackendConnected) {
        const res = await leadService.updateStatus(id, status);
        dispatch({ type: 'UPDATE_LEAD', payload: res.data });
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend update lead failed, updating local state');
    }

    const lead = state.leads.find((l) => l._id === id);
    if (lead) {
      dispatch({ type: 'UPDATE_LEAD', payload: { ...lead, status } });
    }
    return { success: true };
  };

  // Appointment Actions
  const bookAppointment = async (apptData) => {
    try {
      if (state.isBackendConnected) {
        const res = await appointmentService.create(apptData);
        dispatch({ type: 'ADD_APPOINTMENT', payload: res.data });
        return { success: true, message: res.message };
      }
    } catch (err) {
      console.warn('Backend booking failed, saving to local state');
    }

    const property = state.properties.find((p) => p._id === apptData.property);
    const newAppt = {
      _id: 'appt-' + Date.now(),
      ...apptData,
      property: property || null,
      agent: property?.agent || DEMO_USERS.agent,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_APPOINTMENT', payload: newAppt });
    return {
      success: true,
      message: 'Site visit booked successfully! Agent will confirm your schedule.',
    };
  };

  const updateAppointmentStatus = async (id, status, notes) => {
    try {
      if (state.isBackendConnected) {
        const res = await appointmentService.updateStatus(id, status, notes);
        dispatch({ type: 'UPDATE_APPOINTMENT', payload: res.data });
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend update appt failed, updating local state');
    }

    const appt = state.appointments.find((a) => a._id === id);
    if (appt) {
      dispatch({
        type: 'UPDATE_APPOINTMENT',
        payload: { ...appt, status, notes: notes || appt.notes },
      });
    }
    return { success: true };
  };

  const toggleFavorite = (propertyId) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: propertyId });
  };

  const selectProperty = (property) => {
    dispatch({ type: 'SELECT_PROPERTY', payload: property });
  };

  // Real-Time Notification Actions (Exp 8)
  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const markAllRead = () => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  };

  const unreadCount = state.notifications ? state.notifications.filter((n) => !n.read).length : 0;

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        addProperty,
        updateProperty,
        deleteProperty,
        submitLead,
        updateLeadStatus,
        bookAppointment,
        updateAppointmentStatus,
        toggleFavorite,
        selectProperty,
        notifications: state.notifications || [],
        unreadCount,
        clearNotifications,
        markAllRead,
        socketConnected: state.socketConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to consume AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
