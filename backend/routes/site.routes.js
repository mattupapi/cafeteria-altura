const router = require('express').Router();
const asyncHandler = require('../middleware/async-handler');
const { health, site } = require('../controllers/site.controller');

router.get('/health', asyncHandler(health));
router.get('/site', asyncHandler(site));
module.exports = router;

