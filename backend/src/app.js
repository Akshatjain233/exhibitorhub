const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middleware/error');

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route Imports
const authRoutes = require('./routes/authRoutes');
const exhibitorRoutes = require('./routes/exhibitorRoutes');
const productRoutes = require('./routes/productRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const documentRoutes = require('./routes/documentRoutes');
const exhibitionRoutes = require('./routes/exhibitionRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const platformSettingRoutes = require('./routes/platformsettingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const venueRoutes = require('./routes/venueRoutes');
const hallRoutes = require('./routes/hallRoutes');
const boothRoutes = require('./routes/boothRoutes');

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/venues', venueRoutes);
app.use('/api/v1/halls', hallRoutes);
app.use('/api/v1/booths', boothRoutes);
app.use('/api/v1/exhibitors', exhibitorRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/exhibitions', exhibitionRoutes);
app.use('/api/v1/sponsors', sponsorRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/organizers', organizerRoutes);
app.use('/api/v1/platform-settings', platformSettingRoutes);

// Health check
app.get('/', (req, res) => res.send('ExhibitorHub Enterprise API is running...'));

// Global Error Handler
app.use(errorHandler);

module.exports = app;
