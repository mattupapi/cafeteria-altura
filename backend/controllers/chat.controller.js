const { askOllama } = require('../chatbot/chatbot.service');
const { getUiTexts } = require('../models/ui.model');

async function chat(req, res) {
  const ui = await getUiTexts(['chat_error', 'chat_validation_error']);
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  if (!message || message.length > 500 || history.length > 12) return res.status(400).json({ error: ui.chat_validation_error });
  try { res.json({ reply: await askOllama(message, history) }); }
  catch (error) {
    console.error('[Café Altura chatbot]', error.message);
    res.status(503).json({ error: ui.chat_error });
  }
}

module.exports = { chat };

