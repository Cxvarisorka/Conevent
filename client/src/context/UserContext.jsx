/**
 * UserContext
 *
 * Provides API methods for user-facing features:
 * - Fetching public events with filtering
 * - Fetching public organisations
 */

import { createContext, useContext, useState, useCallback } from 'react';

// API base URL from environment or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create context
const UserContext = createContext(null);

/**
 * UserProvider Component
 * Wraps children with user context providing API methods
 */
export function UserProvider({ children }) {
  // Loading states
  const [loading, setLoading] = useState({
    events: false,
    organisations: false,
    applications: false,
  });

  // Error state
  const [error, setError] = useState(null);

  /**
   * Generic API request handler
   */
  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }, []);

  // ============================================
  // EVENT METHODS
  // ============================================

  /**
   * Fetch published events with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.category - Event category filter
   * @param {string} params.eventType - Event type filter (online/offline/hybrid)
   * @param {string} params.organisationId - Organisation filter
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  const getEvents = useCallback(async (params = {}) => {
    setLoading((prev) => ({ ...prev, events: true }));
    setError(null);
    try {
      // Only show published events for users
      const queryParams = { ...params, status: 'published' };
      const queryString = new URLSearchParams(queryParams).toString();
      const data = await apiRequest(`/events?${queryString}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
  }, [apiRequest]);

  /**
   * Fetch single event by ID
   * @param {string} id - Event ID
   */
  const getEvent = useCallback(async (id) => {
    setError(null);
    try {
      const data = await apiRequest(`/events/${id}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [apiRequest]);

  // ============================================
  // ORGANISATION METHODS
  // ============================================

  /**
   * Fetch all organisations
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.type - Organisation type filter
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  const getOrganisations = useCallback(async (params = {}) => {
    setLoading((prev) => ({ ...prev, organisations: true }));
    setError(null);
    try {
      const queryString = new URLSearchParams(params).toString();
      const data = await apiRequest(`/organisations?${queryString}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, organisations: false }));
    }
  }, [apiRequest]);

  /**
   * Fetch single organisation by ID
   * @param {string} id - Organisation ID
   */
  const getOrganisation = useCallback(async (id) => {
    setError(null);
    try {
      const data = await apiRequest(`/organisations/${id}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [apiRequest]);

  // ============================================
  // APPLICATION METHODS
  // ============================================

  /**
   * Create a new application (apply to event)
   * @param {string} eventId - Event ID to apply to
   * @param {string} message - Optional message with application
   */
  const createApplication = useCallback(async (eventId, message) => {
    setLoading((prev) => ({ ...prev, applications: true }));
    setError(null);
    try {
      const data = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({ eventId, message }),
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, applications: false }));
    }
  }, [apiRequest]);

  /**
   * Get user's own applications
   * @param {Object} params - Query parameters
   */
  const getMyApplications = useCallback(async (params = {}) => {
    setLoading((prev) => ({ ...prev, applications: true }));
    setError(null);
    try {
      const queryString = new URLSearchParams(params).toString();
      const data = await apiRequest(`/applications/my?${queryString}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, applications: false }));
    }
  }, [apiRequest]);

  /**
   * Cancel an application
   * @param {string} applicationId - Application ID to cancel
   */
  const cancelApplication = useCallback(async (applicationId) => {
    setError(null);
    try {
      const data = await apiRequest(`/applications/${applicationId}/cancel`, {
        method: 'PATCH',
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [apiRequest]);

  // Context value
  const value = {
    loading,
    error,
    setError,
    getEvents,
    getEvent,
    getOrganisations,
    getOrganisation,
    createApplication,
    getMyApplications,
    cancelApplication,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * useUser Hook
 * Access user context methods and state
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
