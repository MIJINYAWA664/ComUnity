import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import middleware
import { rateLimitMiddleware } from '@/middleware/rateLimiter';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import dataRoutes from '@/routes/data';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(rateLimitMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/data', dataRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'CommUnity Backend API',
      version: '1.0.0',
      description: 'Backend API for CommUnity application with Supabase integration',
      endpoints: {
        auth: {
          'POST /api/auth/signup': 'User registration',
          'POST /api/auth/login': 'User login',
          'POST /api/auth/logout': 'User logout',
          'POST /api/auth/refresh': 'Refresh access token'
        },
        users: {
          'GET /api/users/profile': 'Get current user profile',
          'PUT /api/users/profile': 'Update user profile',
          'GET /api/users/:id': 'Get user by ID',
          'GET /api/users/search': 'Search users'
        },
        data: {
          'GET /api/data': 'Get data with pagination',
          'POST /api/data': 'Create new data entry',
          'GET /api/data/:id': 'Get data entry by ID',
          'PUT /api/data/:id': 'Update data entry',
          'DELETE /api/data/:id': 'Delete data entry'
        }
      }
    }
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API documentation available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;