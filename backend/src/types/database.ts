export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          profile_picture_url?: string;
          accessibility_settings: Record<string, any>;
          emergency_contacts: Array<Record<string, any>>;
          preferred_language: string;
          sign_language_preference: string;
          created_at: string;
          updated_at: string;
          last_login?: string;
          is_active: boolean;
          email_verified: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          profile_picture_url?: string;
          accessibility_settings?: Record<string, any>;
          emergency_contacts?: Array<Record<string, any>>;
          preferred_language?: string;
          sign_language_preference?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          is_active?: boolean;
          email_verified?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          profile_picture_url?: string;
          accessibility_settings?: Record<string, any>;
          emergency_contacts?: Array<Record<string, any>>;
          preferred_language?: string;
          sign_language_preference?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          is_active?: boolean;
          email_verified?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          type: 'direct' | 'group' | 'emergency';
          name?: string;
          description?: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          settings: Record<string, any>;
        };
        Insert: {
          id?: string;
          type: 'direct' | 'group' | 'emergency';
          name?: string;
          description?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          settings?: Record<string, any>;
        };
        Update: {
          id?: string;
          type?: 'direct' | 'group' | 'emergency';
          name?: string;
          description?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          settings?: Record<string, any>;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: 'text' | 'voice' | 'sign' | 'image' | 'video' | 'file';
          original_language?: string;
          translations: Record<string, string>;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
          deleted_at?: string;
          is_edited: boolean;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: 'text' | 'voice' | 'sign' | 'image' | 'video' | 'file';
          original_language?: string;
          translations?: Record<string, string>;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string;
          is_edited?: boolean;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          message_type?: 'text' | 'voice' | 'sign' | 'image' | 'video' | 'file';
          original_language?: string;
          translations?: Record<string, string>;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string;
          is_edited?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}