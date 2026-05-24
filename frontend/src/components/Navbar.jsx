import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Fixed top navigation bar
export const Navbar = () => {
  const { developer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
          LogFlow
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {developer ? (
            <>
              <span className="text-sm text-gray-600">Hello, {developer.username}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">
                Login
              </Link>
              <Link to="/register" className="text-sm text-gray-600 hover:text-indigo-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
