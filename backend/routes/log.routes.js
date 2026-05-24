const express = require('express');
const protect = require('../middleware/auth');
const validateApiKey = require('../middleware/apiKey');
const { getLogs, postLog } = require('../controllers/log.controller');

// mergeParams exposes :name from the parent app router
const router = express.Router({ mergeParams: true });

router.get('/', protect, getLogs);
router.post('/', validateApiKey, postLog);

module.exports = router;
