const pool = require('../config/database');

async function getChatContext() {
  const [settings] = await pool.execute("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('brand_name','address','phone','demo_notice','currency_code')");
  const [hours] = await pool.execute('SELECT day_label, time_label FROM business_hours ORDER BY sort_order');
  const [services] = await pool.execute('SELECT name, description FROM services WHERE active = 1 ORDER BY sort_order');
  const [items] = await pool.execute(`SELECT c.name AS category, i.name, i.description, i.price
    FROM menu_items i JOIN menu_categories c ON c.id = i.category_id
    WHERE i.active = 1 AND c.active = 1 ORDER BY c.sort_order, i.sort_order`);
  return {
    settings: Object.fromEntries(settings.map(row => [row.setting_key, row.setting_value])),
    hours,
    services,
    items: items.map(item => ({ ...item, price: Number(item.price) }))
  };
}

module.exports = { getChatContext };

