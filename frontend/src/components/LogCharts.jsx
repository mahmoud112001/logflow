import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, Legend as LineLegend,
} from 'recharts';
import * as appService from '../services/app.service';

// Color constants shared between pie and line charts
const COLORS = { INFO: '#3B82F6', WARN: '#F59E0B', ERROR: '#EF4444' };

// Build ordered array of last 7 days formatted as 'MM/DD'
const getLast7Days = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  });

// Group a flat log array into per-day, per-level counts over the last 7 days
const groupByDay = (logs) => {
  const days = getLast7Days();
  // initialise every day with zero counts
  const map = Object.fromEntries(days.map((d) => [d, { date: d, INFO: 0, WARN: 0, ERROR: 0 }]));
  logs.forEach((log) => {
    const day = new Date(log.updatedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    if (map[day] && COLORS[log.level]) {
      map[day][log.level] += 1;
    }
  });
  return days.map((d) => map[d]);
};

// Charts component — receives pre-fetched level totals, fetches daily data itself
export const LogCharts = ({ levelCounts, appName }) => {
  const [dailyData, setDailyData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  // Fetch a large page of recent logs and group client-side into daily buckets
  useEffect(() => {
    const fetchDaily = async () => {
      setLoadingChart(true);
      try {
        const data = await appService.getLogs(appName, { limit: 1000, sort: 'recent' });
        setDailyData(groupByDay(data.logs));
      } catch {
        setDailyData(getLast7Days().map((d) => ({ date: d, INFO: 0, WARN: 0, ERROR: 0 })));
      } finally {
        setLoadingChart(false);
      }
    };
    fetchDaily();
  }, [appName]);

  // Build pie data, filtering out zero-value levels so the pie isn't cluttered
  const pieData = Object.entries(levelCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: COLORS[name] }));

  const hasAnyLogs = pieData.length > 0;
  const hasDailyData = dailyData.some((d) => d.INFO + d.WARN + d.ERROR > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie chart — log level distribution */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Log Level Distribution</h3>
        {!hasAnyLogs ? (
          <p className="text-center text-gray-400 py-16 text-sm">Not enough data to display chart</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <PieTooltip formatter={(value, name) => [value, name]} />
              <PieLegend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Line chart — logs per day for the last 7 days */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Logs Per Day (Last 7 Days)</h3>
        {loadingChart ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !hasDailyData ? (
          <p className="text-center text-gray-400 py-16 text-sm">Not enough data to display chart</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <LineTooltip />
              <LineLegend />
              <Line type="monotone" dataKey="INFO" stroke={COLORS.INFO} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="WARN" stroke={COLORS.WARN} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="ERROR" stroke={COLORS.ERROR} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
