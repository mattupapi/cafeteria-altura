const pool = require('../config/database');

async function getUiTexts(keys = []) {
  let sql = 'SELECT text_key, text_value FROM ui_texts';
  const params = [];
  if (keys.length) { sql += ` WHERE text_key IN (${keys.map(() => '?').join(',')})`; params.push(...keys); }
  const [rows] = await pool.execute(sql, params);
  return Object.fromEntries(rows.map(row => [row.text_key, row.text_value]));
}

module.exports = { getUiTexts };

