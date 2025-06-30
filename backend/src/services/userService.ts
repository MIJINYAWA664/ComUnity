import { supabase } from '@/config/supabase';
import { createError } from '@/middleware/errorHandler';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  accessibilitySettings: Record<string, any>;
  emergencyContacts: Array<Record<string, any>>;
  preferredLanguage: string;
  signLanguagePreference: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  emailVerified: boolean;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  accessibilitySettings?: Record<string, any>;
  emergencyContacts?: Array<Record<string, any>>;
  preferredLanguage?: string;
  signLanguagePreference?: string;
}

export class UserService {
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      profilePictureUrl: data.profile_picture_url,
      accessibilitySettings: data.accessibility_settings,
      emergencyContacts: data.emergency_contacts,
      preferredLanguage: data.preferred_language,
      signLanguagePreference: data.sign_language_preference,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastLogin: data.last_login,
      emailVerified: data.email_verified
    };
  }

  async updateUserProfile(userId: string, updateData: UpdateProfileData): Promise<UserProfile> {
    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };

    if (updateData.firstName !== undefined) updatePayload.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) updatePayload.last_name = updateData.lastName;
    if (updateData.profilePictureUrl !== undefined) updatePayload.profile_picture_url = updateData.profilePictureUrl;
    if (updateData.accessibilitySettings !== undefined) updatePayload.accessibility_settings = updateData.accessibilitySettings;
    if (updateData.emergencyContacts !== undefined) updatePayload.emergency_contacts = updateData.emergencyContacts;
    if (updateData.preferredLanguage !== undefined) updatePayload.preferred_language = updateData.preferredLanguage;
    if (updateData.signLanguagePreference !== undefined) updatePayload.sign_language_preference = updateData.signLanguagePreference;

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      throw createError('Failed to update user profile', 500, 'UPDATE_FAILED', error);
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      profilePictureUrl: data.profile_picture_url,
      accessibilitySettings: data.accessibility_settings,
      emergencyContacts: data.emergency_contacts,
      preferredLanguage: data.preferred_language,
      signLanguagePreference: data.sign_language_preference,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastLogin: data.last_login,
      emailVerified: data.email_verified
    };
  }

  async getUserById(requesterId: string, targetUserId: string): Promise<Partial<UserProfile>> {
    // Basic user info that can be shared (privacy-conscious)
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, profile_picture_url, preferred_language, sign_language_preference')
      .eq('id', targetUserId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      profilePictureUrl: data.profile_picture_url,
      preferredLanguage: data.preferred_language,
      signLanguagePreference: data.sign_language_preference
    };
  }

  async searchUsers(query: string, limit: number = 20): Promise<Partial<UserProfile>[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, profile_picture_url, preferred_language')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(limit);

    if (error) {
      throw createError('Search failed', 500, 'SEARCH_FAILED', error);
    }

    return data.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePictureUrl: user.profile_picture_url,
      preferredLanguage: user.preferred_language
    }));
  }
}