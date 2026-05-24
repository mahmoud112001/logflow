import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { FilterBar } from '../components/FilterBar';
import { LogTable } from '../components/LogTable';
import { Pagination } from '../components/Pagination';
import * as appService from '../services/app.service';
import { LogCharts } from '../components/LogCharts';

// Stat card used in the summary row
const StatCard = ({ label, value, color }) => (
  <div className="bg-white shadow rounded-lg p-5 flex flex-col gap-1">
    <span className="text-xs text-gray-400 uppercase font-medium">{label}</span>
    <span className={`text-3xl font-bold ${color}`}>{value ?? '—'}</span>
  </div>
);

const DEFAULT_FILTERS = { sort: 'recent', level: '', search: '' };
const DEFAULT_PAGINATION = { page: 1, limit: 10, totalCount: 0, totalPages: 1 };

const AppDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('table');
  const [levelCounts, setLevelCounts] = useState({ INFO: 0, WARN: 0, ERROR: 0 });

  // Fetch application metadata once on mount
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const app = await appService.getApplication(name);
        setApplication(app);
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchApp();
  }, [name]);

  // Fetch per-level totals in parallel once on mount
  useEffect(() => {
    const fetchLevelCounts = async () => {
      try {
        const [infoRes, warnRes, errorRes] = await Promise.all([
          appService.getLogs(name, { level: 'INFO', limit: 1, page: 1 }),
          appService.getLogs(name, { level: 'WARN', limit: 1, page: 1 }),
          appService.getLogs(name, { level: 'ERROR', limit: 1, page: 1 }),
        ]);
        setLevelCounts({
          INFO: infoRes.pagination.totalCount,
          WARN: warnRes.pagination.totalCount,
          ERROR: errorRes.pagination.totalCount,
        });
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchLevelCounts();
  }, [name]);

  // Re-fetch logs whenever filters or page changes
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appService.getLogs(name, { ...filters, page, limit: 10 });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [name, filters, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Update a single filter key and reset to page 1
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handlePageChange = (newPage) => setPage(newPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-20 px-6 max-w-6xl mx-auto pb-12">
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="mt-6 text-sm text-indigo-600 hover:underline flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        {/* App header */}
        <div className="mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          {application && (
            <p className="text-sm text-gray-400 mt-1">
              Created: {new Date(application.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Summary stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Logs"
            value={levelCounts.INFO + levelCounts.WARN + levelCounts.ERROR}
            color="text-gray-800"
          />
          <StatCard label="INFO" value={levelCounts.INFO} color="text-blue-600" />
          <StatCard label="WARN" value={levelCounts.WARN} color="text-yellow-500" />
          <StatCard label="ERROR" value={levelCounts.ERROR} color="text-red-500" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {['table', 'charts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'table' ? 'Logs Table' : 'Charts'}
            </button>
          ))}
        </div>

        {/* Table tab */}
        {activeTab === 'table' && (
          <div className="bg-white shadow rounded-lg p-5">
            <div className="mb-4">
              <FilterBar filters={filters} onFilterChange={handleFilterChange} />
            </div>
            <LogTable logs={logs} loading={loading} />
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        )}

        {/* Charts tab — LogCharts built in next chunk */}
        {activeTab === 'charts' && (
          <LogCharts levelCounts={levelCounts} appName={name} />
        )}
      </main>
    </div>
  );
};

export default AppDetail;
