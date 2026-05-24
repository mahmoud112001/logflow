const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const appService = require('../services/app.service');
const logService = require('../services/log.service');

// Returns paginated logs for an application the developer owns
const getLogs = catchAsync(async (req, res, next) => {
  const { name } = req.params;
  const developerId = req.developer._id;
  // Ownership check — throws 404 if application doesn't belong to this developer
  const application = await appService.getApplicationByName(name, developerId);
  const { logs, pagination } = await logService.getLogs(application._id, req.query);
  sendSuccess(res, 200, { logs, pagination });
});

// Records a log entry; req.application already resolved by validateApiKey
const postLog = catchAsync(async (req, res, next) => {
  const { message, level } = req.body;
  // req.application set by validateApiKey — no redundant DB lookup needed
  const log = await logService.createLog(req.application._id, { message, level });
  sendSuccess(res, 200, { log }, 'Log recorded');
});

module.exports = { getLogs, postLog };
