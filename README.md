# 🏦 SecureBank - Modern Banking Portal

A comprehensive banking system built with **Next.js 15**, **TypeScript**, **Prisma ORM**, and **MySQL**. Features separate interfaces for customers and bankers with modern UI/UX design, secure authentication, and real-time transaction management.

## 🌟 Features

### 👤 Customer Portal
- **Secure Authentication**: Login with email/password and JWT-based session management
- **Account Dashboard**: View account balances and comprehensive transaction history
- **Real-time Transactions**: Instant deposits and withdrawals with balance updates
- **Transaction History**: Sortable transaction table with detailed records
- **Responsive Design**: Modern, mobile-first interface with dark mode support

### 🏛️ Banker Portal
- **Administrative Dashboard**: Overview of all customer accounts and banking analytics
- **Customer Management**: View all customer accounts with real-time balances
- **Transaction Oversight**: Access detailed transaction history for any customer
- **Banking Analytics**: Comprehensive insights and financial reporting
- **Account Management**: Monitor customer account activities and patterns

### 🔐 Security Features
- **bcrypt Password Hashing**: Industry-standard password encryption (12 salt rounds)
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **36-Character Access Tokens**: Cryptographically secure session management
- **Role-Based Access Control**: Separate access levels for customers, bankers, and admins
- **Session Management**: Automatic cleanup of expired sessions

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **Backend**: Next.js API Routes (RESTful APIs)
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT + bcrypt + crypto
- **UI Components**: Custom component library with modern design patterns

## 📁 Project Structure

```
banking-portal/
├── app/
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/                 # Customer login
│   │   └── banker/login/          # Banker login
│   ├── api/                       # API routes
│   │   ├── auth/                  # Authentication endpoints
│   │   │   ├── login/             # Customer login API
│   │   │   ├── banker-login/      # Banker login API
│   │   │   ├── register/          # User registration
│   │   │   └── logout/            # Logout endpoint
│   │   ├── banker/                # Banker-specific APIs
│   │   │   ├── dashboard/         # Banking analytics
│   │   │   └── accounts/          # Customer account management
│   │   └── transactions/          # Transaction APIs
│   │       ├── deposit/           # Deposit endpoint
│   │       └── withdraw/          # Withdrawal endpoint
│   ├── banker/                    # Banker interface pages
│   │   ├── dashboard/             # Banker dashboard
│   │   └── accounts/              # Customer accounts view
│   ├── components/                # Reusable UI components
│   │   ├── ui/                    # Base UI components
│   │   ├── layout/                # Layout components
│   │   ├── banker/                # Banker-specific components
│   │   └── transactions/          # Transaction components
│   ├── dashboard/                 # Customer dashboard
│   ├── lib/                       # Utility libraries
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── db.ts                 # Database services
│   │   └── middleware.ts         # Request middleware
│   └── globals.css               # Global styles
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Database seeding
│   └── migrations/               # Database migrations
└── lib/
    └── utils.ts                  # Shared utilities
```

## 🗄️ Database Schema

The application uses a MySQL database with the following main entities:

- **Users**: Stores customer, banker, and admin accounts
- **Accounts**: Bank accounts linked to customers
- **Transactions**: All deposit/withdrawal records
- **Sessions**: User authentication sessions

Key features:
- Role-based user system (CUSTOMER, BANKER, ADMIN)
- Multiple account types (SAVINGS, CHECKING, BUSINESS)
- Comprehensive transaction logging with balance tracking
- Secure session management with token expiration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL database
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd banking-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://username:password@host:port/database_name"
   JWT_SECRET="your-super-secure-jwt-secret-key"
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 Test Credentials

After running the database seed, you can use these test accounts:

### Banker/Admin Access
- **Banker**: `banker@bank.com` / `banker123`
- **Admin**: `admin@bank.com` / `admin123`

### Customer Accounts
- **Jane Customer**: `customer@example.com` / `customer123`
- **Alice Smith**: `alice.smith@email.com` / `password123`
- **Bob Johnson**: `bob.johnson@email.com` / `password123`
- **Carol Davis**: `carol.davis@email.com` / `password123`
- **David Wilson**: `david.wilson@email.com` / `password123`
- **Emma Brown**: `emma.brown@email.com` / `password123`

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database Operations
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database and run migrations
```

## 🎨 Design System

The application follows a modern fintech design approach:

- **Color Palette**: Indigo/Blue primary, with success (green) and danger (red) variants
- **Typography**: Clean, readable fonts with consistent sizing
- **Components**: Reusable UI components with consistent styling
- **Responsive**: Mobile-first design with breakpoint-specific layouts
- **Dark Mode**: Full dark mode support throughout the application

## 🔒 Security Implementation

- **Password Security**: bcrypt with 12 salt rounds
- **Session Management**: JWT tokens with HTTP-only cookies
- **Access Control**: Role-based permissions and route protection
- **Token Validation**: Automatic session cleanup and token expiration
- **Input Validation**: Server-side validation for all user inputs

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Customer login
- `POST /api/auth/banker-login` - Banker login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions/deposit` - Make a deposit
- `POST /api/transactions/withdraw` - Make a withdrawal

### Banker Operations
- `GET /api/banker/dashboard` - Banking analytics
- `GET /api/banker/accounts` - All customer accounts
- `GET /api/banker/accounts/[id]/transactions` - Customer transaction history

## 🧪 Testing

The application includes comprehensive test data and can be tested using the provided seed accounts. Each customer has realistic transaction histories and account balances for thorough testing of all features.

## 🚀 Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting provider. Ensure your production environment has:

- MySQL database connection
- Proper environment variables
- SSL/TLS certificates for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Add your deployment URL]
- **Documentation**: [Add documentation URL]
- **Issues**: [Add issues URL]

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.