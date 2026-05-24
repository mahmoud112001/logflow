import { useState, useEffect } from 'react';

// Controlled filter bar with debounced search input
export const FilterBar = ({ filters, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search — only fire onFilterChange 400ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const isActive = filters.search || filters.level || filters.sort !== 'recent';

  const handleReset = () => {
    setSearchInput('');
    onFilterChange('search', '');
    onFilterChange('level', '');
    onFilterChange('sort', 'recent');
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <input
        type="text"
        placeholder="Search message..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
      />

      {/* Level filter */}
      <select
        value={filters.level}
        onChange={(e) => onFilterChange('level', e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Levels</option>
        <option value="INFO">INFO</option>
        <option value="WARN">WARN</option>
        <option value="ERROR">ERROR</option>
      </select>

      {/* Sort filter */}
      <select
        value={filters.sort}
        onChange={(e) => onFilterChange('sort', e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="recent">Most Recent</option>
        <option value="most_occurred">Most Occurred</option>
      </select>

      {/* Clear button — only visible when a filter is active */}
      {isActive && (
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-red-500 underline"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};
