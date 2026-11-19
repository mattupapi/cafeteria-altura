const { createContact } = require('../models/contact.model');
const { getUiTexts } = require('../models/ui.model');

const clean = value => typeof value === 'string' ? value.trim() : '';

async function contact(req, res) {
  const ui = await getUiTexts(['contact_success', 'validation_contact_server']);
  const name = clean(req.body?.name), email = clean(req.body?.email), message = clean(req.body?.message);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (name.length < 2 || name.length > 100 || !validEmail || email.length > 160 || message.length < 10 || message.length > 2000) {
    return res.status(400).json({ error: ui.validation_contact_server });
  }
  await createContact({ name, email, message });
  res.status(201).json({ message: ui.contact_success });
}

module.exports = { contact };

