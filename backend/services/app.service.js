const Application = require("../models/Application");
const AppError = require("../utils/AppError");

const getAllApplications = async (developerId) => {
  return Application.find({ owner: developerId });
};

const getApplicationByName = async (name, developerId) => {
  const application = await Application.findOne({ name, owner: developerId });
  if (!application) {
    throw new AppError("Application not found", 404);
  }
  return application;
};

const createApplication = async (name, developerId) => {
  const existing = await Application.findOne({ name });
  if (existing) {
    throw new AppError("Application name already exists", 409);
  }
  return Application.create({ name, owner: developerId });
};

const deleteApplication = async (name, developerId) => {
  const application = await Application.findOneAndDelete({
    name,
    owner: developerId,
  });
  if (!application) {
    throw new AppError("Application not found", 404);
  }
  return;
};

module.exports = {
  getAllApplications,
  getApplicationByName,
  createApplication,
  deleteApplication,
};
