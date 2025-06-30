import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '@/config/supabase';
import { SignupRequest, LoginRequest, AuthResponse } from '@/types/auth';
import { createError } from '@/middleware/errorHandler';

export class AuthService {
  private generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async signup(signupData: SignupRequest): Promise<AuthResponse> {
    const { email, password, firstName, lastName, ...otherData } = signupData;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw createError('User already exists with this email', 409, 'USER_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (authError || !authData.user) {
      throw createError('Failed to create user account', 500, 'AUTH_CREATE_ERROR', authError);
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        accessibility_settings: otherData.accessibilitySettings || {},
        emergency_contacts: [],
        preferred_language: otherData.preferredLanguage || 'en',
        sign_language_preference: otherData.signLanguagePreference || 'asl',
        email_verified: true,
        is_active: true
      })
      .select()
      .single();

    if (userError || !userData) {
      // Cleanup auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw createError('Failed to create user profile', 500, 'PROFILE_CREATE_ERROR', userError);
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(userData.id, userData.email);

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    return {
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profilePictureUrl: userData.profile_picture_url,
        accessibilitySettings: userData.accessibility_settings,
        emergencyContacts: userData.emergency_contacts,
        preferredLanguage: userData.preferred_language,
        signLanguagePreference: userData.sign_language_preference,
        emailVerified: userData.email_verified
      },
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      throw createError('User profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    if (!userData.is_active) {
      throw createError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(userData.id, userData.email);

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    return {
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profilePictureUrl: userData.profile_picture_url,
        accessibilitySettings: userData.accessibility_settings,
        emergencyContacts: userData.emergency_contacts,
        preferredLanguage: userData.preferred_language,
        signLanguagePreference: userData.sign_language_preference,
        emailVerified: userData.email_verified
      },
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60
    };
  }

  async logout(userId: string): Promise<void> {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // In a production environment, you might want to:
    // 1. Add the token to a blacklist
    // 2. Clear any cached user data
    // 3. Log the logout event
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      if (decoded.type !== 'refresh') {
        throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Verify user still exists and is active
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, is_active')
        .eq('id', decoded.userId)
        .single();

      if (error || !userData || !userData.is_active) {
        throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: userData.id, email: userData.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        accessToken,
        expiresIn: 24 * 60 * 60
      };
    } catch (error) {
      throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }
}