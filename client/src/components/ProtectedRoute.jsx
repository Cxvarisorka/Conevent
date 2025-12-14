/**
 * ProtectedRoute Component
 *
 * Guards routes that require authentication
 * Optionally checks for specific user roles
 * Redirects to appropriate dashboard if role doesn't match
 *
 * @param {ReactNode} children - Child components to render if authorized
 * @param {string} requiredRole - Optional role required to access the route
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Get the default dashboard path for a user role
 */
const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'organisation':
      return '/organisation';
    default:
      return '/dashboard';
  }
};

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement if specified
  // Redirect to user's appropriate dashboard if role doesn't match
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
}
