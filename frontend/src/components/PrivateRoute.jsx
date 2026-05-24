import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Guards routes that require authentication
export const PrivateRoute = () => {
  const { developer, loading } = useAuth();

  // Show full-page spinner while restoring session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!developer) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
