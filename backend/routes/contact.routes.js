const router = require('express').Router();
const asyncHandler = require('../middleware/async-handler');
const { createRateLimit } = require('../middleware/rate-limit');
const { loadUi } = require('../middleware/ui-loader');
const { contact } = require('../controllers/contact.controller');

router.post('/', loadUi(['rate_limit_error']), createRateLimit({ windowMs: 15 * 60_000, max: 8 }), asyncHandler(contact));
module.exports = router;

