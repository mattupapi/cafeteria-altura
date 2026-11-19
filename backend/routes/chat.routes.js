const router = require('express').Router();
const asyncHandler = require('../middleware/async-handler');
const { createRateLimit } = require('../middleware/rate-limit');
const { loadUi } = require('../middleware/ui-loader');
const { chat } = require('../controllers/chat.controller');

router.post('/', loadUi(['rate_limit_error']), createRateLimit({ windowMs: 60_000, max: 12 }), asyncHandler(chat));
module.exports = router;

