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

  // Create additional customers with accounts and transactions
  const additionalCustomers = [
    {
      email: 'alice.smith@email.com',
      username: 'alice_smith',
      firstName: 'Alice',
      lastName: 'Smith',
      accountNumber: '2345678901',
      accountType: 'CHECKING' as const,
      initialBalance: 2500.00,
      transactions: [
        { type: 'DEPOSIT' as const, amount: 2500.00, description: 'Opening deposit' },
        { type: 'DEPOSIT' as const, amount: 1200.00, description: 'Paycheck' },
        { type: 'WITHDRAWAL' as const, amount: 800.00, description: 'Rent payment' },
        { type: 'WITHDRAWAL' as const, amount: 150.00, description: 'Groceries' },
        { type: 'DEPOSIT' as const, amount: 300.00, description: 'Freelance payment' },
      ]
    },
    {
      email: 'bob.johnson@email.com',
      username: 'bob_johnson',
      firstName: 'Bob',
      lastName: 'Johnson',
      accountNumber: '3456789012',
      accountType: 'SAVINGS' as const,
      initialBalance: 5000.00,
      transactions: [
        { type: 'DEPOSIT' as const, amount: 5000.00, description: 'Initial savings' },
        { type: 'DEPOSIT' as const, amount: 2000.00, description: 'Bonus payment' },
        { type: 'WITHDRAWAL' as const, amount: 1000.00, description: 'Emergency fund' },
        { type: 'DEPOSIT' as const, amount: 800.00, description: 'Investment return' },
      ]
    },
    {
      email: 'carol.davis@email.com',
      username: 'carol_davis',
      firstName: 'Carol',
      lastName: 'Davis',
      accountNumber: '4567890123',
      accountType: 'CHECKING' as const,
      initialBalance: 1800.00,
      transactions: [
        { type: 'DEPOSIT' as const, amount: 1800.00, description: 'Opening deposit' },
        { type: 'WITHDRAWAL' as const, amount: 600.00, description: 'Car payment' },
        { type: 'DEPOSIT' as const, amount: 1100.00, description: 'Salary' },
        { type: 'WITHDRAWAL' as const, amount: 250.00, description: 'Utilities' },
        { type: 'WITHDRAWAL' as const, amount: 400.00, description: 'Insurance' },
        { type: 'DEPOSIT' as const, amount: 750.00, description: 'Side business' },
      ]
    },
    {
      email: 'david.wilson@email.com',
      username: 'david_wilson',
      firstName: 'David',
      lastName: 'Wilson',
      accountNumber: '5678901234',
      accountType: 'SAVINGS' as const,
      initialBalance: 3200.00,
      transactions: [
        { type: 'DEPOSIT' as const, amount: 3200.00, description: 'Transfer from checking' },
        { type: 'DEPOSIT' as const, amount: 1500.00, description: 'Tax refund' },
        { type: 'WITHDRAWAL' as const, amount: 2000.00, description: 'Home renovation' },
        { type: 'DEPOSIT' as const, amount: 900.00, description: 'Quarterly dividend' },
      ]
    },
    {
      email: 'emma.brown@email.com',
      username: 'emma_brown',
      firstName: 'Emma',
      lastName: 'Brown',
      accountNumber: '6789012345',
      accountType: 'CHECKING' as const,
      initialBalance: 4200.00,
      transactions: [
        { type: 'DEPOSIT' as const, amount: 4200.00, description: 'Opening balance' },
        { type: 'WITHDRAWAL' as const, amount: 1200.00, description: 'Mortgage payment' },
        { type: 'DEPOSIT' as const, amount: 2800.00, description: 'Salary deposit' },
        { type: 'WITHDRAWAL' as const, amount: 350.00, description: 'Phone & Internet' },
        { type: 'WITHDRAWAL' as const, amount: 180.00, description: 'Gas bill' },
        { type: 'DEPOSIT' as const, amount: 450.00, description: 'Cashback rewards' },
        { type: 'WITHDRAWAL' as const, amount: 800.00, description: 'Credit card payment' },
      ]
    }
  ];

  for (const customerData of additionalCustomers) {
    // Create customer user
    const customerPassword = await bcrypt.hash('password123', 12);
    const newCustomer = await prisma.user.upsert({
      where: { email: customerData.email },
      update: {},
      create: {
        email: customerData.email,
        username: customerData.username,
        password: customerPassword,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        role: 'CUSTOMER',
      },
    });

    console.log(`✅ Created customer: ${newCustomer.email}`);

    // Create account for customer
    const newAccount = await prisma.account.upsert({
      where: { accountNumber: customerData.accountNumber },
      update: {},
      create: {
        userId: newCustomer.id,
        accountNumber: customerData.accountNumber,
        accountType: customerData.accountType,
        balance: customerData.initialBalance,
      },
    });

    console.log(`✅ Created account: ${newAccount.accountNumber}`);

    // Create transactions for the account
    let currentBalance = 0;
    for (const transactionData of customerData.transactions) {
      if (transactionData.type === 'DEPOSIT') {
        currentBalance += transactionData.amount;
      } else {
        currentBalance -= transactionData.amount;
      }

      await prisma.transaction.create({
        data: {
          accountId: newAccount.id,
          type: transactionData.type,
          amount: transactionData.amount,
          balanceAfter: currentBalance,
          description: transactionData.description,
        },
      });
    }

    // Update account balance to final amount
    await prisma.account.update({
      where: { id: newAccount.id },
      data: { balance: currentBalance },
    });

    console.log(`✅ Created ${customerData.transactions.length} transactions for ${customerData.firstName}`);
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Banker: banker@bank.com / banker123');
  console.log('Admin: admin@bank.com / admin123');
  console.log('Customer: customer@example.com / customer123');
  console.log('Alice: alice.smith@email.com / password123');
  console.log('Bob: bob.johnson@email.com / password123');
  console.log('Carol: carol.davis@email.com / password123');
  console.log('David: david.wilson@email.com / password123');
  console.log('Emma: emma.brown@email.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
