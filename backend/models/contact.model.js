const pool = require('../config/database');

async function createContact({ name, email, message }) {
  const [result] = await pool.execute(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message]
  );
  return result.insertId;
}

module.exports = { createContact };

