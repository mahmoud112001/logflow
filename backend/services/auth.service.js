const Developer = require("../models/Developer");
const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

const registerDeveloper = async ({ username, email, password }) => {
  const existing = await Developer.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new AppError("Username or email already in use", 409);
  }

  const developer = await Developer.create({ username, email, password });
  return { developer };
};

const loginDeveloper = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const developer = await Developer.findOne({ email }).select("+password");
  if (!developer || !(await developer.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign({ id: developer._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  developer.password = undefined;

  return { developer, token };
};

module.exports = {
  registerDeveloper,
  loginDeveloper,
};
