export interface Profile {
  id: string;
  email?: string;
  username: string;
  username_lower?: string;
  native_language: string;
  native_language_updated_at?: string;
  updated_at: string;
  full_name?: string;
  avatar_url?: string;
  gab_points: number;
  status?: 'active' | 'suspended' | 'deleted';
  suspended_at?: string;
  referral_code?: string;
  referred_by?: string;
  created_at?: string;
  public_key?: string;
  encrypted_private_key?: string;
  bonus_plan?: string;
  bonus_claims?: Partial<Record<string, boolean>>;
  signup_position?: number;
  show_start_chat_guide_modal?: boolean;
  expo_push_token?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  type: 'direct' | 'group' | 'individual';
  name?: string;
  admin_id?: string;
  pending_participants?: string[];
  avatar_url?: string;
  last_message?: string;
  last_message_at: string;
  created_at?: string;
  unread_count?: Record<string, number>;
  pinned_event?: {
    id: string;
    title: string;
    description?: string;
    date: string;
    created_by: string;
  } | null;
}

export interface ConversationWithDetails extends Conversation {
  other_user?: Profile | null;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  type: 'text' | 'voice' | 'event';
  audio_url?: string | null;
  duration?: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  client_id?: string;
  created_at: string;
  translated_content?: string;
  translated_audio_url?: string | null;
  is_translated?: boolean;
  is_translation_loading?: boolean;
  sender_name?: string;
  reply_to?: {
    id: string;
    content: string;
    sender_id: string;
    sender_name?: string;
  } | null;
  is_e2ee?: boolean;
  decryption_failed?: boolean;
  event_id?: string;
  event_data?: {
    id: string;
    title: string;
    description?: string;
    date: string;
    created_by: string;
    status?: string;
  };
  is_edited?: boolean;
  deleted_for?: string[];
}
