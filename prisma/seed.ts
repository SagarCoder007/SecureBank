import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create banker user
  const bankerPassword = await bcrypt.hash('banker123', 12);
  const banker = await prisma.user.upsert({
    where: { email: 'banker@bank.com' },
    update: {},
    create: {
      email: 'banker@bank.com',
      username: 'banker',
      password: bankerPassword,
      firstName: 'John',
      lastName: 'Banker',
      role: 'BANKER',
    },
  });

  console.log('✅ Created banker user:', banker.email);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bank.com' },
    update: {},
    create: {
      email: 'admin@bank.com',
      username: 'admin',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      username: 'customer',
      password: customerPassword,
      firstName: 'Jane',
      lastName: 'Customer',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Created customer user:', customer.email);

  // Create account for customer
  const account = await prisma.account.upsert({
    where: { accountNumber: '1234567890' },
    update: {},
    create: {
      userId: customer.id,
      accountNumber: '1234567890',
      accountType: 'SAVINGS',
      balance: 1000.00,
    },
  });

  console.log('✅ Created account for customer:', account.accountNumber);

  // Create sample transactions
  const transactions = [
    {
      accountId: account.id,
      type: 'DEPOSIT' as const,
      amount: 1000.00,
      balanceAfter: 1000.00,
      description: 'Initial deposit',
    },
    {
      accountId: account.id,
      type: 'DEPOSIT' as const,
      amount: 500.00,
      balanceAfter: 1500.00,
      description: 'Salary deposit',
    },
    {
      accountId: account.id,
      type: 'WITHDRAWAL' as const,
      amount: 200.00,
      balanceAfter: 1300.00,
      description: 'ATM withdrawal',
    },
    {
      accountId: account.id,
      type: 'WITHDRAWAL' as const,
      amount: 300.00,
      balanceAfter: 1000.00,
      description: 'Shopping',
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log('✅ Created sample transactions');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Banker: banker@bank.com / banker123');
  console.log('Admin: admin@bank.com / admin123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
