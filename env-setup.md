# Environment Setup Instructions

## Create `.env` file

Create a `.env` file in the root directory with the following content:

```env
# Database Configuration (Railway MySQL)
# Replace with your actual Railway MySQL connection string
# Format: mysql://username:password@host:port/database_name
DATABASE_URL="mysql://root:password@localhost:3306/Bank"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ACCESS_TOKEN_SECRET="your-36-character-access-token-secret-key"

# Environment
NODE_ENV="development"
```

## Railway MySQL Setup

1. Go to [Railway](https://railway.app) and create a free account
2. Create a new project and add a MySQL database
3. Copy the connection string from Railway dashboard
4. Replace the `DATABASE_URL` in your `.env` file with the Railway connection string

## Security Notes

- Generate strong, unique secrets for production
- Never commit the `.env` file to version control
- Use Railway's environment variables in production
