require('dotenv').config();
const path = require('path');
const express = require('express');
const siteRoutes = require('./routes/site.routes');
const contactRoutes = require('./routes/contact.routes');
const chatRoutes = require('./routes/chat.routes');
const { notFound, errorHandler } = require('./middleware/error-handler');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '16kb' }));
app.use('/media', express.static(path.join(__dirname, 'public', 'media'), { maxAge: '1d' }));
app.use('/api', siteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, '127.0.0.1', () => console.log(`Café Altura API: http://127.0.0.1:${port}`));
}

module.exports = app;

