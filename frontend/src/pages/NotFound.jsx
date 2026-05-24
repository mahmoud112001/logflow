import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
    <p className="text-8xl font-bold text-gray-200">404</p>
    <p className="text-xl text-gray-500 mt-3">Page not found</p>
    <Link
      to="/"
      className="mt-6 text-indigo-600 hover:underline font-medium text-sm"
    >
      ← Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
