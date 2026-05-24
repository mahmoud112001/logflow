import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import useAuth from '../hooks/useAuth';
import * as appService from '../services/app.service';

const Dashboard = () => {
  const { developer } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newAppName, setNewAppName] = useState('');

  // Fetch all applications and update state
  const fetchApplications = useCallback(async () => {
    try {
      const apps = await appService.getApplications();
      setApplications(apps);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Copy API key to clipboard
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(developer.apiKey);
    toast.success('API key copied!');
  };

  // Create a new application
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    setCreating(true);
    try {
      await appService.createApplication(newAppName.trim());
      toast.success(`App "${newAppName.trim()}" created!`);
      setNewAppName('');
      fetchApplications();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Delete an application after confirmation
  const handleDelete = async (app) => {
    if (!window.confirm(`Delete "${app.name}"? This cannot be undone.`)) return;
    try {
      await appService.deleteApplication(app.name);
      toast.success(`App "${app.name}" deleted.`);
      fetchApplications();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-20 px-6 max-w-5xl mx-auto pb-12">
        {/* API Key Card */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Your API Key</h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-gray-100 text-gray-700 font-mono text-sm px-4 py-3 rounded-md break-all">
              {developer.apiKey}
            </code>
            <button
              onClick={handleCopyApiKey}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Applications Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Applications</h2>

          {/* Create form */}
          <form onSubmit={handleCreate} className="flex gap-3 mb-6">
            <input
              type="text"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="app-name (no spaces)"
              className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={creating || !newAppName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white shadow rounded-lg p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-red-100 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && applications.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No applications yet</p>
              <p className="text-sm mt-1">Create one above to get started</p>
            </div>
          )}

          {/* Applications grid */}
          {!loading && applications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => (
                <div key={app._id} className="bg-white shadow rounded-lg p-5 flex flex-col gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{app.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/apps/${app.name}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium"
                    >
                      View Logs
                    </button>
                    <button
                      onClick={() => handleDelete(app)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
