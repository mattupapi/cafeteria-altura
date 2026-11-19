const pool = require('../config/database');

const mediaFrom = row => row.media_id ? ({
  id: row.media_id, code: row.media_code, type: row.media_type, url: row.media_url,
  altText: row.alt_text, creditName: row.credit_name, creditUrl: row.credit_url
}) : null;

async function getSiteData() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[settings], [ui], [navigation], [sectionRows], [serviceRows], [categoryRows], [itemRows], [galleryRows], [hours]] = await Promise.all([
      connection.query('SELECT setting_key, setting_value FROM site_settings'),
      connection.query('SELECT text_key, text_value FROM ui_texts'),
      connection.query('SELECT id, label, target, sort_order FROM navigation_items WHERE active = 1 ORDER BY sort_order'),
      connection.query(`SELECT s.*, m.id media_id, m.asset_code media_code, m.asset_type media_type, m.url media_url,
        m.alt_text, m.credit_name, m.credit_url FROM sections s LEFT JOIN media_assets m ON m.id = s.media_id WHERE s.active = 1`),
      connection.query(`SELECT s.*, m.id media_id, m.asset_code media_code, m.asset_type media_type, m.url media_url,
        m.alt_text, m.credit_name, m.credit_url FROM services s JOIN media_assets m ON m.id = s.media_id WHERE s.active = 1 ORDER BY s.sort_order`),
      connection.query('SELECT id, name, sort_order FROM menu_categories WHERE active = 1 ORDER BY sort_order'),
      connection.query(`SELECT i.*, m.id media_id, m.asset_code media_code, m.asset_type media_type, m.url media_url,
        m.alt_text, m.credit_name, m.credit_url FROM menu_items i LEFT JOIN media_assets m ON m.id = i.media_id
        JOIN menu_categories c ON c.id = i.category_id WHERE i.active = 1 AND c.active = 1 ORDER BY c.sort_order, i.sort_order`),
      connection.query(`SELECT m.id media_id, m.asset_code media_code, m.asset_type media_type, m.url media_url,
        m.alt_text, m.credit_name, m.credit_url FROM media_assets m WHERE m.gallery = 1 AND m.active = 1 ORDER BY m.sort_order`),
      connection.query('SELECT id, day_label, time_label, sort_order FROM business_hours WHERE active = 1 ORDER BY sort_order')
    ]);
    await connection.commit();

    const items = itemRows.map(row => ({
      id: row.id, categoryId: row.category_id, name: row.name, description: row.description,
      price: Number(row.price), featured: Boolean(row.featured), media: mediaFrom(row)
    }));
    return {
      settings: Object.fromEntries(settings.map(row => [row.setting_key, row.setting_value])),
      ui: Object.fromEntries(ui.map(row => [row.text_key, row.text_value])),
      navigation: navigation.map(row => ({ id: row.id, label: row.label, target: row.target, sortOrder: row.sort_order })),
      sections: Object.fromEntries(sectionRows.map(row => [row.section_code, {
        id: row.id, code: row.section_code, eyebrow: row.eyebrow, title: row.title, body: row.body,
        ctaLabel: row.cta_label, ctaTarget: row.cta_target, media: mediaFrom(row)
      }])),
      services: serviceRows.map(row => ({ id: row.id, name: row.name, description: row.description, media: mediaFrom(row) })),
      menu: categoryRows.map(category => ({ id: category.id, name: category.name, sortOrder: category.sort_order, items: items.filter(item => item.categoryId === category.id) })),
      featured: items.filter(item => item.featured),
      gallery: galleryRows.map(mediaFrom),
      hours: hours.map(row => ({ id: row.id, dayLabel: row.day_label, timeLabel: row.time_label, sortOrder: row.sort_order }))
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

module.exports = { getSiteData };

