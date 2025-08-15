import { NextRequest, NextResponse } from 'next/server';
import { PasswordUtils, JWTUtils, AccessTokenUtils, AuthValidation, AUTH_ERRORS } from '../../../lib/auth';
import { UserService, SessionService } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

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

    // Check if user is a banker
    if (user.role !== 'BANKER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Banker credentials required.' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
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
    };

    // Create response with secure cookie
    const response = NextResponse.json(responseData, { status: 200 });
    
    // Set HTTP-only cookie for JWT (more secure than localStorage)
    response.cookies.set('banker-auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Banker login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
