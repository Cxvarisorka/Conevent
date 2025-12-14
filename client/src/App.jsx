/**
 * Main Application Component
 *
 * Sets up routing and authentication context
 * Routes:
 * - /login - User login page
 * - /signup - User registration page
 * - /auth/callback - OAuth callback handler
 * - /dashboard - User dashboard (regular users)
 * - /organisation - Organisation dashboard (organisation role)
 * - /admin - Admin panel (admin role required)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/i18n';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import OAuthCallback from '@/pages/OAuthCallback';
import AdminPanel from '@/pages/AdminPanel';
import UserDashboard from '@/pages/UserDashboard';
import OrganisationDashboard from '@/pages/OrganisationDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />

          {/* User dashboard - any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Organisation dashboard - organisation role required */}
          <Route
            path="/organisation"
            element={
              <ProtectedRoute requiredRole="organisation">
                <OrganisationDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes - admin role required */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
