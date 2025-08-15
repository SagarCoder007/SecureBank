import { NextRequest, NextResponse } from 'next/server';
import { PasswordUtils, AuthValidation, AUTH_ERRORS } from '../../../lib/auth';
import { UserService, AccountService } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, firstName, lastName, role = 'CUSTOMER' } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    if (!AuthValidation.isValidEmail(email)) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_EMAIL.message },
        { status: AUTH_ERRORS.INVALID_EMAIL.statusCode }
      );
    }

    if (!AuthValidation.isValidPassword(password)) {
      return NextResponse.json(
        { error: AUTH_ERRORS.WEAK_PASSWORD.message },
        { status: AUTH_ERRORS.WEAK_PASSWORD.statusCode }
      );
    }

    if (username && !AuthValidation.isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters, alphanumeric and underscores only' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmailUser = await UserService.findByEmail(email);
    if (existingEmailUser) {
      return NextResponse.json(
        { error: AUTH_ERRORS.EMAIL_ALREADY_EXISTS.message },
        { status: AUTH_ERRORS.EMAIL_ALREADY_EXISTS.statusCode }
      );
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsernameUser = await UserService.findByUsername(username);
      if (existingUsernameUser) {
        return NextResponse.json(
          { error: AUTH_ERRORS.USERNAME_ALREADY_EXISTS.message },
          { status: AUTH_ERRORS.USERNAME_ALREADY_EXISTS.statusCode }
        );
      }
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hashPassword(password);

    // Create user
    const user = await UserService.createUser({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role: role as 'CUSTOMER' | 'BANKER' | 'ADMIN',
    });

    // Create default account for customers
    if (role === 'CUSTOMER') {
      await AccountService.createAccount(user.id);
    }

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
