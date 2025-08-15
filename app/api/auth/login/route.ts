import { NextRequest, NextResponse } from 'next/server';
import { PasswordUtils, JWTUtils, AccessTokenUtils, AuthValidation, AUTH_ERRORS } from '../../../lib/auth';
import { UserService, SessionService, AccountService } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role = 'CUSTOMER' } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!AuthValidation.isValidEmail(email)) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_EMAIL.message },
        { status: AUTH_ERRORS.INVALID_EMAIL.statusCode }
      );
    }

    // Find user by email
    const user = await UserService.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_CREDENTIALS.message },
        { status: AUTH_ERRORS.INVALID_CREDENTIALS.statusCode }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Verify role (if specified)
    if (role !== 'CUSTOMER' && user.role !== role) {
      return NextResponse.json(
        { error: AUTH_ERRORS.ACCESS_DENIED.message },
        { status: AUTH_ERRORS.ACCESS_DENIED.statusCode }
      );
    }

    // Verify password
    const isValidPassword = await PasswordUtils.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_CREDENTIALS.message },
        { status: AUTH_ERRORS.INVALID_CREDENTIALS.statusCode }
      );
    }

    // Generate tokens
    const jwtToken = JWTUtils.generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const accessToken = AccessTokenUtils.generateAccessToken();
    const expiresAt = AccessTokenUtils.generateTokenExpiration();

    // Create session
    await SessionService.createSession(user.id, accessToken, expiresAt);

    // For customers, ensure they have at least one account
    if (user.role === 'CUSTOMER' && user.accounts.length === 0) {
      await AccountService.createAccount(user.id);
    }

    // Prepare response data
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens: {
        jwt: jwtToken,
        accessToken: accessToken,
        expiresAt: expiresAt.toISOString(),
      },
      accounts: user.accounts.map(account => ({
        id: account.id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance.toString(),
      })),
    };

    // Create response with secure cookie
    const response = NextResponse.json(responseData, { status: 200 });
    
    // Set HTTP-only cookie for JWT (more secure than localStorage)
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
