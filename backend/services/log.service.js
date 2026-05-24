const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const getPagination = require('../utils/paginate');
const { LOG_LEVELS, SORT_OPTIONS } = require('../config/constants');

// Returns paginated logs for an application with optional filtering and sorting
const getLogs = async (applicationId, queryParams) => {
  const filter = { application: applicationId };
  // Restrict to valid log levels only — ignore unknown values
  if (queryParams.level && LOG_LEVELS.includes(queryParams.level)) {
    filter.level = queryParams.level;
  }
  // Case-insensitive substring search on message
  if (queryParams.search) {
    filter.message = { $regex: queryParams.search, $options: 'i' };
  }

  // Default sort is most recent; opt-in to most occurred
  const sort = queryParams.sort === 'most_occurred'
    ? SORT_OPTIONS.MOST_OCCURRED
    : SORT_OPTIONS.RECENT;

  const { page, limit, skip } = getPagination(queryParams);

  // Run data and count queries in parallel to minimize latency
  const [logs, total] = await Promise.all([
    Log.find(filter).sort(sort).skip(skip).limit(limit),
    Log.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Upserts a log entry — increments count if identical message+level already exists
const createLog = async (applicationId, { message, level }) => {
  if (!LOG_LEVELS.includes(level)) throw new AppError('Invalid log level', 400);

  const log = await Log.findOneAndUpdate(
    { message, level, application: applicationId },
    {
      $inc: { count: 1 },
      $set: { updatedAt: new Date() },
      // createdAt is immutable — only written on first insert
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return log;
};

module.exports = { getLogs, createLog };
