# CommUnity Backend API

A production-ready Express.js backend with Supabase integration for the CommUnity application.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with Supabase
- 👥 **User Management** - Profile management and user operations
- 📊 **Data Operations** - CRUD operations with pagination and filtering
- 🛡️ **Security** - Rate limiting, input validation, CORS, helmet
- 🚀 **Performance** - Compression, caching, optimized queries
- 📝 **Type Safety** - Full TypeScript implementation
- 🧪 **Testing Ready** - Jest configuration included
- 📚 **API Documentation** - Built-in endpoint documentation

## Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase project
- PostgreSQL database (via Supabase)

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

3. **Database Setup**
   
   Run the migration in your Supabase SQL editor:
   ```bash
   # Copy and execute the contents of:
   supabase/migrations/001_initial_schema.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search?q=query` - Search users

### Data Operations
- `GET /api/data` - Get data with pagination
- `POST /api/data` - Create new data entry
- `GET /api/data/:id` - Get data entry by ID
- `PUT /api/data/:id` - Update data entry
- `DELETE /api/data/:id` - Delete data entry

### System
- `GET /health` - Health check
- `GET /api` - API documentation

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Registration Example
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login Example
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com", 
    "password": "SecurePass123"
  }'
```

## API Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (for paginated endpoints)
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {} // Additional error details
  }
}
```

## Security Features

- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Authentication Rate Limiting** - 5 login attempts per 15 minutes per IP  
- **Input Validation** - Joi schema validation on all inputs
- **CORS Protection** - Configurable origin restrictions
- **Helmet Security** - Security headers and protections
- **Row Level Security** - Database-level access control via Supabase

## Database Schema

The application uses the following main tables:

- **users** - User profiles and settings
- **conversations** - Chat conversations  
- **messages** - Chat messages with multi-format support
- **learning_categories** - Learning content categories
- **learning_lessons** - Individual lessons and tutorials
- **user_lesson_progress** - User progress tracking

All tables have Row Level Security (RLS) enabled for data protection.

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Main server file
├── supabase/
│   └── migrations/      # Database migrations
├── dist/                # Compiled JavaScript (generated)
└── package.json
```

### Adding New Endpoints

1. **Define types** in `src/types/`
2. **Create service** in `src/services/`
3. **Add validation schemas** in `src/middleware/validation.ts`
4. **Create route handler** in `src/routes/`
5. **Register route** in `src/server.ts`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `24h` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=3001
   # ... other variables
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Monitoring & Logging

- **Health Check** - `GET /health` endpoint for monitoring
- **Request Logging** - Morgan HTTP request logging
- **Error Logging** - Comprehensive error logging with context
- **Performance Metrics** - Built-in timing and performance tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details