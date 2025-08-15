# 🏦 Banking Portal - Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Railway account (free tier) or local MySQL server
- Git for version control

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration (Railway MySQL)
# Replace with your actual Railway MySQL connection string
DATABASE_URL="mysql://username:password@host:port/Bank"

# Authentication Secrets
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ACCESS_TOKEN_SECRET="your-36-character-access-token-secret-key"

# Environment
NODE_ENV="development"
```

### 2. Railway MySQL Setup

1. Go to [Railway](https://railway.app) and create a free account
2. Create a new project
3. Add a MySQL database service
4. Copy the connection string from Railway dashboard
5. Replace the `DATABASE_URL` in your `.env` file

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migration
npm run db:migrate

# Seed the database with test data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database (⚠️ deletes all data)

## 🧪 Test Credentials

After running the seed script, you can use these credentials:

### Banker Login
- **Email**: `banker@bank.com`
- **Password**: `banker123`
- **Access**: Banker dashboard

### Admin Login
- **Email**: `admin@bank.com`
- **Password**: `admin123`
- **Access**: Full system access

### Customer Login
- **Email**: `customer@example.com`
- **Password**: `customer123`
- **Access**: Customer transactions page

## 🔐 API Endpoints

### Authentication

#### Customer Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "customer123"
}
```

#### Banker Login
```http
POST /api/auth/banker-login
Content-Type: application/json

{
  "email": "banker@bank.com",
  "password": "banker123"
}
```

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "role": "CUSTOMER"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Test Database Connection
```http
GET /api/test-db
```

## 🏗️ Project Structure

```
banking-portal/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts          # Customer login
│   │   │   ├── banker-login/route.ts   # Banker login
│   │   │   ├── register/route.ts       # User registration
│   │   │   └── logout/route.ts         # Logout
│   │   └── test-db/route.ts            # Database test
│   ├── lib/
│   │   ├── auth.ts                     # Authentication utilities
│   │   ├── db.ts                       # Database utilities
│   │   └── middleware.ts               # Auth middleware
│   ├── globals.css                     # Global styles
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Home page
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Database seed file
├── .env                                # Environment variables
└── package.json                       # Dependencies and scripts
```

## 🔒 Security Features

### Password Security
- **bcrypt hashing** with 12 salt rounds
- **Password validation** (8+ chars, uppercase, lowercase, number)
- **Secure storage** in database

### Token Management
- **JWT tokens** for session management (7-day expiry)
- **36-character alphanumeric access tokens** using crypto
- **HTTP-only cookies** for secure token storage
- **Token expiration** and cleanup

### Role-Based Access
- **CUSTOMER**: Access to own transactions
- **BANKER**: Access to all customer accounts
- **ADMIN**: Full system access

## 📊 Database Schema

### Users Table
- Stores both customers and bankers
- Password hashing with bcrypt
- Role-based access control

### Accounts Table
- Customer bank accounts
- Balance tracking
- Account type (SAVINGS, CHECKING, BUSINESS)

### Transactions Table
- All deposit/withdrawal operations
- Balance history tracking
- Transaction status management

### Sessions Table
- Active user sessions
- Token management
- Automatic cleanup of expired sessions

## 🛠️ Development Workflow

1. **Start development server**: `npm run dev`
2. **Make database changes**: Update `prisma/schema.prisma`
3. **Generate migration**: `npm run db:migrate`
4. **Test changes**: Use Prisma Studio or API endpoints
5. **Reset if needed**: `npm run db:reset` (development only)

## 🚀 Production Deployment

1. Set up production database (Railway, PlanetScale, etc.)
2. Update environment variables with production values
3. Run migrations: `npm run db:migrate`
4. Deploy to Vercel, Netlify, or your preferred platform

## 🔧 Troubleshooting

### Database Connection Issues
1. Verify Railway database is running
2. Check connection string format
3. Ensure database user has proper permissions
4. Test connection: `GET /api/test-db`

### Authentication Issues
1. Check JWT_SECRET is set
2. Verify token format in requests
3. Ensure cookies are enabled in browser
4. Check token expiration

### Migration Issues
1. Reset database: `npm run db:reset`
2. Re-run migrations: `npm run db:migrate`
3. Seed fresh data: `npm run db:seed`

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the Prisma documentation
3. Check Next.js API routes documentation
4. Verify Railway database configuration
