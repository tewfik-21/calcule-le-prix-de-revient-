import re

with open('src/types.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_types = """
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id?: string;
  created_at: string;
  updated_at: string;
  // Extra fields populated by join
  other_user?: {
    id: string;
    full_name: string;
    company_name: string;
    avatar_url?: string;
  };
  listing?: {
    title: string;
  };
  last_message?: Message;
  unread_count?: number;
}
"""

if 'export interface Message' not in content:
    content += new_types

with open('src/types.ts', 'w', encoding='utf-8') as f:
    f.write(content)
