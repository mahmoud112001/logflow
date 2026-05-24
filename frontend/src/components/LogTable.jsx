// Level badge color map
const LEVEL_STYLES = {
  INFO:  'bg-blue-100 text-blue-800',
  WARN:  'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
};

// Format a date string to locale date + time
const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

// Skeleton row shown while fetching
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1, 2, 3, 4, 5].map((n) => (
      <td key={n} className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

// Table of log entries with loading and empty states
export const LogTable = ({ logs, loading }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
        <tr>
          <th className="px-4 py-3 font-medium">Level</th>
          <th className="px-4 py-3 font-medium">Message</th>
          <th className="px-4 py-3 font-medium text-center">Count</th>
          <th className="px-4 py-3 font-medium">First Occurrence</th>
          <th className="px-4 py-3 font-medium">Last Occurrence</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {/* Loading skeletons */}
        {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

        {/* Empty state */}
        {!loading && logs.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
              No logs found
            </td>
          </tr>
        )}

        {/* Log rows */}
        {!loading && logs.map((log) => (
          <tr key={log._id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${LEVEL_STYLES[log.level] || 'bg-gray-100 text-gray-700'}`}>
                {log.level}
              </span>
            </td>
            <td
              className="px-4 py-3 text-gray-800 max-w-xs truncate"
              title={log.message}
            >
              {log.message.length > 60 ? `${log.message.slice(0, 60)}…` : log.message}
            </td>
            <td className="px-4 py-3 text-center font-medium text-gray-700">{log.count}</td>
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(log.updatedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
