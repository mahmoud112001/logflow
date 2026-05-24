const express = require('express');
const protect = require('../middleware/auth');
const logRouter = require('./log.routes');
const {
  getAllApplications,
  getApplicationByName,
  createApplication,
  deleteApplication,
} = require('../controllers/app.controller');

const router = express.Router();

// protect applied individually — log subrouter defines its own middleware per verb
router.get('/', protect, getAllApplications);
router.post('/', protect, createApplication);
router.get('/:name', protect, getApplicationByName);
router.delete('/:name', protect, deleteApplication);

// Delegate log requests to logRouter; mergeParams gives it access to :name
router.use('/:name/logs', logRouter);

module.exports = router;
