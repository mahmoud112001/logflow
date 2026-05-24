const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const appService = require('../services/app.service');

// Returns all applications belonging to the authenticated developer
const getAllApplications = catchAsync(async (req, res, next) => {
  const developerId = req.developer._id;
  const applications = await appService.getAllApplications(developerId);
  sendSuccess(res, 200, { applications });
});

// Returns a single application by URL param name, scoped to the owner
const getApplicationByName = catchAsync(async (req, res, next) => {
  const { name } = req.params;
  const developerId = req.developer._id;
  const application = await appService.getApplicationByName(name, developerId);
  sendSuccess(res, 200, { application });
});

// Creates a new application owned by the authenticated developer
const createApplication = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const developerId = req.developer._id;
  const application = await appService.createApplication(name, developerId);
  sendSuccess(res, 201, { application }, 'Application created');
});

// Hard-deletes an application; returns 204 with no body on success
const deleteApplication = catchAsync(async (req, res, next) => {
  const { name } = req.params;
  const developerId = req.developer._id;
  await appService.deleteApplication(name, developerId);
  res.status(204).send();
});

module.exports = { getAllApplications, getApplicationByName, createApplication, deleteApplication };
