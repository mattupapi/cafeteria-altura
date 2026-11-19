-- Café Altura · MySQL 8+
-- Reimportable: crea/actualiza el contenido inicial y NUNCA elimina contact_messages.
CREATE DATABASE IF NOT EXISTS cafeteria_altura
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cafeteria_altura;

CREATE TABLE IF NOT EXISTS media_assets (
  id INT UNSIGNED PRIMARY KEY,
  asset_code VARCHAR(80) NOT NULL UNIQUE,
  asset_type ENUM('image','video') NOT NULL,
  url VARCHAR(700) NOT NULL,
  alt_text VARCHAR(300) NOT NULL,
  credit_name VARCHAR(160) NOT NULL,
  credit_url VARCHAR(700) NOT NULL,
  gallery TINYINT(1) NOT NULL DEFAULT 0,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  setting_value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ui_texts (
  text_key VARCHAR(100) PRIMARY KEY,
  text_value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS navigation_items (
  id INT UNSIGNED PRIMARY KEY,
  label VARCHAR(80) NOT NULL,
  target VARCHAR(80) NOT NULL UNIQUE,
  sort_order SMALLINT UNSIGNED NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sections (
  id INT UNSIGNED PRIMARY KEY,
  section_code VARCHAR(80) NOT NULL UNIQUE,
  eyebrow VARCHAR(160) NOT NULL,
  title VARCHAR(250) NOT NULL,
  body TEXT NOT NULL,
  cta_label VARCHAR(120) NULL,
  cta_target VARCHAR(80) NULL,
  media_id INT UNSIGNED NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_sections_media FOREIGN KEY (media_id) REFERENCES media_assets(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  media_id INT UNSIGNED NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_services_media FOREIGN KEY (media_id) REFERENCES media_assets(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_categories (
  id INT UNSIGNED PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order SMALLINT UNSIGNED NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items (
  id INT UNSIGNED PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(140) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  media_id INT UNSIGNED NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order SMALLINT UNSIGNED NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT chk_menu_price CHECK (price >= 0),
  CONSTRAINT fk_menu_category FOREIGN KEY (category_id) REFERENCES menu_categories(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_menu_media FOREIGN KEY (media_id) REFERENCES media_assets(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_hours (
  id INT UNSIGNED PRIMARY KEY,
  day_label VARCHAR(100) NOT NULL,
  time_label VARCHAR(100) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_created_at (created_at),
  INDEX idx_contact_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO media_assets (id, asset_code, asset_type, url, alt_text, credit_name, credit_url, gallery, sort_order, active) VALUES
(1,'hero_video','video','/media/hero-latte.mp4','Barista vertiendo leche para dibujar una roseta sobre un café','Video de Emre Vonal en Pexels','https://www.pexels.com/video/close-up-of-pouring-milk-to-coffee-13662307/',0,1,1),
(2,'hero_poster','image','/media/hero-latte-poster.jpg','Primer plano de una barista preparando latte art','Emre Vonal · Pexels','https://www.pexels.com/video/close-up-of-pouring-milk-to-coffee-13662307/',0,2,1),
(3,'service_shop','image','https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=82','Mesa de madera y ambiente cálido dentro de una cafetería','Unsplash','https://unsplash.com/photos/1501339847302-ac426a4a7cbb',0,3,1),
(4,'service_takeaway','image','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=82','Café filtrado servido junto a granos tostados','Unsplash','https://unsplash.com/photos/1495474472287-4d71bcdd2085',0,4,1),
(5,'service_specialty','image','https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=82','Barra de cafetería de especialidad con luz natural','Unsplash','https://unsplash.com/photos/1445116572660-236099ec97a0',0,5,1),
(6,'service_pastry','image','https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=82','Croissants dorados recién horneados','Unsplash','https://unsplash.com/photos/1555507036-ab1f4038808a',0,6,1),
(7,'product_latte','image','https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1200&q=84','Taza de latte con arte de corazón sobre una mesa','Unsplash','https://unsplash.com/photos/1541167760496-1628856ab772',0,7,1),
(8,'product_coldbrew','image','https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=84','Vaso de café frío servido con hielo','Unsplash','https://unsplash.com/photos/1517701604599-bb29b565090c',0,8,1),
(9,'product_croissant','image','https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=84','Piezas de panadería artesanal sobre una mesa','Unsplash','https://unsplash.com/photos/1509440159596-0249088772ff',0,9,1),
(10,'gallery_counter','image','https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1400&q=84','Interior de cafetería con barra, plantas y mesas de madera','Unsplash','https://unsplash.com/photos/1493857671505-72967e2e2760',1,1,1),
(11,'gallery_barista','image','https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=1000&q=84','Barista sosteniendo una taza de café con leche','Unsplash','https://unsplash.com/photos/1512568400610-62da28bc8a13',1,2,1),
(12,'gallery_pastry','image','https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1000&q=84','Galletas artesanales sobre papel de hornear','Unsplash','https://unsplash.com/photos/1499636136210-6f4ee915583e',1,3,1)
ON DUPLICATE KEY UPDATE asset_type=VALUES(asset_type),url=VALUES(url),alt_text=VALUES(alt_text),credit_name=VALUES(credit_name),credit_url=VALUES(credit_url),gallery=VALUES(gallery),sort_order=VALUES(sort_order),active=VALUES(active);

INSERT INTO site_settings (setting_key, setting_value) VALUES
('page_title','Café Altura · Café de especialidad en Cochabamba'),
('brand_name','Café Altura'),
('brand_mark','A'),
('brand_tagline','Cochabamba · Bolivia'),
('currency_code','BOB'),
('address','Av. de las Jacarandás 418, Cochabamba'),
('phone','+591 4 400 1842'),
('demo_notice','Dirección y teléfono ficticios, incluidos únicamente con fines académicos.'),
('hero_poster_url','/media/hero-latte-poster.jpg'),
('hero_poster_alt','Primer plano de una barista preparando latte art')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

INSERT INTO ui_texts (text_key, text_value) VALUES
('brand_home_aria','Ir al inicio de Café Altura'),('main_nav_aria','Navegación principal'),('menu_toggle_aria','Abrir o cerrar el menú'),
('video_pause_aria','Pausar video de portada'),('video_play_aria','Reproducir video de portada'),('video_pause_label','Pausar escena'),('video_play_label','Reproducir escena'),
('address_label','Dirección'),('phone_label','Teléfono'),('hours_label','Horario'),
('contact_name_label','Nombre'),('contact_email_label','Correo electrónico'),('contact_message_label','Mensaje'),
('contact_name_placeholder','Tu nombre'),('contact_email_placeholder','nombre@ejemplo.com'),('contact_message_placeholder','Cuéntanos en qué podemos ayudarte'),
('contact_submit','Enviar mensaje'),('contact_sending','Guardando…'),('contact_success','Recibimos tu mensaje. Gracias por escribirnos.'),('contact_error','No pudimos guardar tu mensaje. Inténtalo nuevamente.'),
('validation_name_required','Escribe tu nombre.'),('validation_name_short','El nombre debe tener al menos 2 caracteres.'),
('validation_email_required','Escribe tu correo.'),('validation_email_invalid','Escribe un correo válido.'),
('validation_message_required','Escribe un mensaje.'),('validation_message_short','El mensaje debe tener al menos 10 caracteres.'),
('validation_contact_server','Revisa el nombre, el correo y el mensaje antes de enviar.'),('rate_limit_error','Has realizado demasiadas solicitudes. Espera un momento e inténtalo de nuevo.'),
('chat_button','Pregúntanos'),('chat_title','Asistente Café Altura'),('chat_status','Conectado con Gemma 3'),
('chat_greeting','¡Hola! Soy el asistente de Café Altura. Puedo ayudarte con el menú, los precios, los servicios, el horario y la ubicación.'),
('chat_suggestion_1','¿Cuánto cuesta el latte de tumbo?'),('chat_suggestion_2','¿Cuál es el horario del sábado?'),('chat_suggestion_3','¿Qué opciones frías tienen?'),
('chat_placeholder','Escribe tu pregunta…'),('chat_error','El asistente no está disponible en este momento. Verifica que Ollama esté ejecutándose e inténtalo de nuevo.'),
('chat_validation_error','Escribe una pregunta de hasta 500 caracteres.'),('chat_retry','Reintentar'),('chat_open_aria','Abrir asistente de Café Altura'),('chat_close_aria','Cerrar asistente'),
('chat_panel_aria','Conversación con el asistente de Café Altura'),('chat_input_aria','Pregunta para el asistente'),('chat_send_aria','Enviar pregunta'),('chat_typing_aria','El asistente está escribiendo'),
('footer_text','Proyecto académico · Cafetería ficticia · Cochabamba, Bolivia'),('back_to_top_aria','Volver al inicio')
ON DUPLICATE KEY UPDATE text_value=VALUES(text_value);

INSERT INTO navigation_items (id,label,target,sort_order,active) VALUES
(1,'Inicio','inicio',1,1),(2,'Servicios','servicios',2,1),(3,'Especialidades','especialidades',3,1),(4,'Nosotros','nosotros',4,1),(5,'Precios','precios',5,1),(6,'Contacto','contacto',6,1)
ON DUPLICATE KEY UPDATE label=VALUES(label),target=VALUES(target),sort_order=VALUES(sort_order),active=VALUES(active);

INSERT INTO sections (id,section_code,eyebrow,title,body,cta_label,cta_target,media_id,active) VALUES
(1,'inicio','Café de altura · Cochabamba','Pausa arriba. Saborea despacio.','Una barra tranquila, granos bolivianos y manos que cuidan cada extracción desde el primer aroma hasta el último sorbo.','Descubrir el menú','especialidades',1,1),
(2,'servicios','Hecho para tu ritmo','Una pausa, cuatro maneras de disfrutarla','Desde una mesa junto a la ventana hasta un café para el camino: elegimos ingredientes honestos y una atención cercana.','',NULL,NULL,1),
(3,'especialidades','Selección de la casa','Sabores que cuentan de dónde vienen','Recetas que combinan café boliviano, frutas del valle y repostería preparada cada mañana.','',NULL,NULL,1),
(4,'nosotros','Nuestra historia','Una cafetería imaginada desde la altura','Café Altura nació como un proyecto académico inspirado en los mercados, las montañas y las sobremesas de Cochabamba. Nuestra historia es ficticia, pero el cuidado por el origen, la hospitalidad y el buen café guía cada detalle de esta demostración.','',NULL,NULL,1),
(5,'precios','Carta completa','Elige tu próxima pausa','Precios académicos expresados en bolivianos. Las especialidades mostradas arriba provienen de esta misma carta.','',NULL,NULL,1),
(6,'contacto','Hablemos','Hay una mesa esperando tu mensaje','Escríbenos para consultas, pedidos demostrativos o para conocer más sobre este proyecto académico.','',NULL,NULL,1)
ON DUPLICATE KEY UPDATE eyebrow=VALUES(eyebrow),title=VALUES(title),body=VALUES(body),cta_label=VALUES(cta_label),cta_target=VALUES(cta_target),media_id=VALUES(media_id),active=VALUES(active);

INSERT INTO services (id,name,description,media_id,sort_order,active) VALUES
(1,'En nuestra mesa','Un rincón sereno para conversar, leer o mirar cómo nace cada taza.',3,1,1),
(2,'Para llevar','Tu bebida favorita preparada con el mismo cuidado, lista para acompañarte.',4,2,1),
(3,'Café de especialidad','Granos bolivianos seleccionados, molienda al momento y extracción precisa.',5,3,1),
(4,'Repostería artesanal','Masas, galletas y tartas horneadas en pequeñas tandas cada mañana.',6,4,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),media_id=VALUES(media_id),sort_order=VALUES(sort_order),active=VALUES(active);

INSERT INTO menu_categories (id,name,sort_order,active) VALUES
(1,'Bebidas calientes',1,1),(2,'Bebidas frías',2,1),(3,'Repostería',3,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),sort_order=VALUES(sort_order),active=VALUES(active);

INSERT INTO menu_items (id,category_id,name,description,price,media_id,featured,sort_order,active) VALUES
(1,1,'Espresso Tunari','Doble extracción de café boliviano con notas de cacao y nuez.',16.00,NULL,0,1,1),
(2,1,'Latte de tumbo','Espresso, leche texturizada y un toque ácido de tumbo del valle.',24.00,7,1,2,1),
(3,1,'Mocaccino de altura','Chocolate oscuro, espresso y leche sedosa.',26.00,NULL,0,3,1),
(4,2,'Cold brew cítrico','Extracción en frío de 16 horas con piel de naranja.',25.00,8,1,1,1),
(5,2,'Tónica de café','Espresso, agua tónica y hierbas aromáticas.',27.00,NULL,0,2,1),
(6,2,'Té helado de durazno','Infusión de té negro, durazno y limón.',20.00,NULL,0,3,1),
(7,3,'Croissant de quirquiña','Masa hojaldrada, queso suave y quirquiña fresca.',18.00,9,1,1,1),
(8,3,'Tarta de manzana y canela','Manzana caramelizada sobre masa quebrada.',19.00,NULL,0,2,1),
(9,3,'Galleta de chocolate y sal','Chocolate semiamargo y un delicado final salino.',12.00,12,0,3,1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id),name=VALUES(name),description=VALUES(description),price=VALUES(price),media_id=VALUES(media_id),featured=VALUES(featured),sort_order=VALUES(sort_order),active=VALUES(active);

INSERT INTO business_hours (id,day_label,time_label,sort_order,active) VALUES
(1,'Lunes a viernes','07:30 – 20:30',1,1),(2,'Sábado','08:00 – 21:00',2,1),(3,'Domingo','08:30 – 18:00',3,1)
ON DUPLICATE KEY UPDATE day_label=VALUES(day_label),time_label=VALUES(time_label),sort_order=VALUES(sort_order),active=VALUES(active);

