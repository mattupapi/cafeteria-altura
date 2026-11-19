const { getChatContext } = require('../models/chat-context.model');

function buildContext(context) {
  const products = context.items.map(item => `- ${item.category}: ${item.name} — ${context.settings.currency_code} ${item.price.toFixed(2)}. ${item.description}`).join('\n');
  const services = context.services.map(item => `- ${item.name}: ${item.description}`).join('\n');
  const hours = context.hours.map(item => `- ${item.day_label}: ${item.time_label}`).join('\n');
  return [
    `CAFETERÍA: ${context.settings.brand_name}`,
    `UBICACIÓN: ${context.settings.address}`,
    `TELÉFONO: ${context.settings.phone}`,
    `NOTA: ${context.settings.demo_notice}`,
    'HORARIOS:', hours,
    'SERVICIOS:', services,
    'MENÚ Y PRECIOS:', products
  ].join('\n');
}

async function askOllama(message, history = []) {
  const context = await getChatContext();
  const controller = new AbortController();
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 45000);
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const safeHistory = history.slice(-6).filter(item =>
    item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string'
  ).map(item => ({ role: item.role, content: item.content.slice(0, 1000) }));
  const system = [
    'Eres el asistente de una cafetería ficticia de Cochabamba.',
    'Responde en español, con calidez y en no más de cuatro párrafos.',
    'Usa exclusivamente los datos de CAFÉ ALTURA incluidos abajo.',
    'Puedes responder sobre productos, precios, servicios, horario y ubicación.',
    'Si el dato no aparece, admite con claridad que no está disponible. No inventes.',
    'Los datos de contacto son demostrativos; indícalo si te preguntan por ellos.',
    '', buildContext(context)
  ].join('\n');
  try {
    const response = await fetch(`${(process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '')}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'gemma3', stream: false,
        options: { temperature: 0.25, num_predict: 350 },
        messages: [{ role: 'system', content: system }, ...safeHistory, { role: 'user', content: message }]
      })
    });
    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
    const data = await response.json();
    const reply = data?.message?.content?.trim();
    if (!reply) throw new Error('Ollama devolvió una respuesta vacía');
    return reply;
  } finally { clearTimeout(timer); }
}

module.exports = { askOllama, buildContext };

