const pool = require('../config/database');
const { getSiteData } = require('../models/site.model');

async function health(req, res) {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', express: true, mysql: true });
  } catch (error) {
    res.status(503).json({ status: 'degraded', express: true, mysql: false });
  }
}

async function site(req, res) { res.json(await getSiteData()); }

module.exports = { health, site };

