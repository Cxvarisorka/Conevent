/**
 * AdminContext
 *
 * Provides centralized API methods for admin operations including:
 * - Organisation management (CRUD)
 * - Event management (CRUD)
 * - User/Member management
 * - Organisation admin assignment
 */

import { createContext, useContext, useState, useCallback } from 'react';

// API base URL from environment or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create context
const AdminContext = createContext(null);

/**
 * AdminProvider Component
 * Wraps children with admin context providing API methods and state
 */
export function AdminProvider({ children }) {
  // Loading states for different operations
  const [loading, setLoading] = useState({
    organisations: false,
    events: false,
    users: false,
    applications: false,
  });

  // Error state
  const [error, setError] = useState(null);

  /**
   * Generic API request handler
   * Handles common logic for API calls including credentials and error handling
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

  /**
   * Generic API request handler for FormData (file uploads)
   */
  const apiRequestFormData = useCallback(async (endpoint, formData, method = 'POST') => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      credentials: 'include',
      body: formData,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server error: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }, []);

  // ============================================
  // ORGANISATION METHODS
  // ============================================

  /**
   * Fetch all organisations with optional filters
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   */
  const getOrganisations = useCallback(async (params = {}) => {
    setLoading(prev => ({ ...prev, organisations: true }));
    setError(null);
    try {
      const queryString = new URLSearchParams(params).toString();
      const data = await apiRequest(`/organisations?${queryString}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, organisations: false }));
    }
  }, [apiRequest]);

  /**
   * Fetch organisations where the current user is an admin
   */
  const getMyOrganisations = useCallback(async () => {
    setLoading(prev => ({ ...prev, organisations: true }));
    setError(null);
    try {
      const data = await apiRequest('/organisations/my');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, organisations: false }));
    }
  }, [apiRequest]);

  /**
   * Get single organisation by ID
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

  /**
   * Create a new organisation
   * @param {FormData} formData - Organisation data with optional logo/coverImage files
   */
  const createOrganisation = useCallback(async (formData) => {
    setLoading(prev => ({ ...prev, organisations: true }));
    setError(null);
    try {
      const data = await apiRequestFormData('/organisations', formData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, organisations: false }));
    }
  }, [apiRequestFormData]);

  /**
   * Update an existing organisation
   * @param {string} id - Organisation ID
   * @param {FormData} formData - Updated organisation data
   */
  const updateOrganisation = useCallback(async (id, formData) => {
    setLoading(prev => ({ ...prev, organisations: true }));
    setError(null);
    try {
      const data = await apiRequestFormData(`/organisations/${id}`, formData, 'PUT');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, organisations: false }));
    }
  }, [apiRequestFormData]);

  /**
   * Delete an organisation
   * @param {string} id - Organisation ID
   */
  const deleteOrganisation = useCallback(async (id) => {
    setLoading(prev => ({ ...prev, organisations: true }));
    setError(null);
    try {
      await apiRequest(`/organisations/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, organisations: false }));
    }
  }, [apiRequest]);

  /**
   * Add an admin to an organisation
   * @param {string} orgId - Organisation ID
   * @param {string} userId - User ID to add as admin
   */
  const addOrganisationAdmin = useCallback(async (orgId, userId) => {
    setError(null);
    try {
      const data = await apiRequest(`/organisations/${orgId}/admins`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [apiRequest]);

  /**
   * Remove an admin from an organisation
   * @param {string} orgId - Organisation ID
   * @param {string} userId - User ID to remove
   */
  const removeOrganisationAdmin = useCallback(async (orgId, userId) => {
    setError(null);
    try {
      await apiRequest(`/organisations/${orgId}/admins/${userId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [apiRequest]);

  // ============================================
  // EVENT METHODS
  // ============================================

  /**
   * Fetch all events with optional filters
   * @param {Object} params - Query parameters (page, limit, organisationId, etc.)
   */
  const getEvents = useCallback(async (params = {}) => {
    setLoading(prev => ({ ...prev, events: true }));
    setError(null);
    try {
      const queryString = new URLSearchParams(params).toString();
      const data = await apiRequest(`/events?${queryString}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, [apiRequest]);

  /**
   * Get single event by ID
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

  /**
   * Create a new event
   * @param {FormData} formData - Event data with optional image files
   */
  const createEvent = useCallback(async (formData) => {
    setLoading(prev => ({ ...prev, events: true }));
    setError(null);
    try {
      // Debug: log FormData contents
      console.log('Creating event with FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      }
      const data = await apiRequestFormData('/events', formData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, [apiRequestFormData]);

  /**
   * Update an existing event
   * @param {string} id - Event ID
   * @param {FormData} formData - Updated event data
   */
  const updateEvent = useCallback(async (id, formData) => {
    setLoading(prev => ({ ...prev, events: true }));
    setError(null);
    try {
      const data = await apiRequestFormData(`/events/${id}`, formData, 'PUT');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, [apiRequestFormData]);

  /**
   * Delete an event
   * @param {string} id - Event ID
   */
  const deleteEvent = useCallback(async (id) => {
    setLoading(prev => ({ ...prev, events: true }));
    setError(null);
    try {
      await apiRequest(`/events/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, [apiRequest]);

  // ============================================
  // USER/MEMBER METHODS
  // ============================================

  /**
   * Fetch all users with optional filters
   * @param {Object} params - Query parameters (page, limit, search, role, etc.)
   */
  const getUsers = useCallback(async (params = {}) => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(null);
    try {
      const queryString = new URLSearchParams(params).toString();
      const data = await apiRequest(`/users?${queryString}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [apiRequest]);

  /**
   * Search users by email (for admin assignment)
   * @param {string} email - Email to search for
   */
  const searchUsers = useCallback(async (email) => {
    setError(null);
    try {
      const data = await apiRequest(`/users?search=${encodeURIComponent(email)}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [apiRequest]);

  /**
   * Update user role
   * @param {string} userId - User ID to update
   * @param {string} role - New role (user, admin, organisation)
   */
  const updateUserRole = useCallback(async (userId, role) => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(null);
    try {
      const data = await apiRequest(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [apiRequest]);

  // ============================================
  // APPLICATION METHODS
  // ============================================

  /**
   * Get all applications (admin view)
   * @param {Object} params - Query parameters
   */
  const getAdminApplications = useCallback(async (params = {}) => {
    setLoading(prev => ({ ...prev, applications: true }));
    setError(null);
    try {
      const queryString = new URLSearchParams(params).toString();
      const data = await apiRequest(`/applications/admin?${queryString}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  }, [apiRequest]);

  /**
   * Get applications for organisation admin
   * @param {Object} params - Query parameters
   */
  const getOrganisationApplications = useCallback(async (params = {}) => {
    setLoading(prev => ({ ...prev, applications: true }));
    setError(null);
    try {
      const queryString = new URLSearchParams(params).toString();
      const data = await apiRequest(`/applications/organisation?${queryString}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  }, [apiRequest]);

  /**
   * Update application status (accept/reject)
   * @param {string} applicationId - Application ID
   * @param {string} status - New status (accepted/rejected)
   * @param {string} rejectionReason - Optional rejection reason
   */
  const updateApplicationStatus = useCallback(async (applicationId, status, rejectionReason) => {
    setError(null);
    try {
      const data = await apiRequest(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionReason }),
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [apiRequest]);

  // Context value with all methods and state
  const value = {
    // State
    loading,
    error,
    setError,

    // Organisation methods
    getOrganisations,
    getMyOrganisations,
    getOrganisation,
    createOrganisation,
    updateOrganisation,
    deleteOrganisation,
    addOrganisationAdmin,
    removeOrganisationAdmin,

    // Event methods
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,

    // User methods
    getUsers,
    searchUsers,
    updateUserRole,

    // Application methods
    getAdminApplications,
    getOrganisationApplications,
    updateApplicationStatus,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

/**
 * useAdmin Hook
 * Access admin context methods and state
 * Must be used within AdminProvider
 */
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
