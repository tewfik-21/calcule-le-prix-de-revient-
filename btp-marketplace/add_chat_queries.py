import re

with open('src/lib/supabaseQueries.ts', 'r', encoding='utf-8') as f:
    content = f.read()

chat_queries = """
// --- Chat System Queries ---

export const fetchConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant1:participant1_id(id, full_name, company_name, avatar_url),
      participant2:participant2_id(id, full_name, company_name, avatar_url),
      listing:listing_id(title)
    `)
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Format the data to attach "other_user" easily
  const formatted = await Promise.all(data.map(async (conv: any) => {
    const isP1 = conv.participant1_id === userId;
    const otherUser = isP1 ? conv.participant2 : conv.participant1;
    
    // Fetch last message separately since supabase nested limits on foreign tables can be tricky
    const { data: lastMsgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1);

    // Fetch unread count
    const { count, error: countErr } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .eq('is_read', false)
      .neq('sender_id', userId);

    return {
      ...conv,
      other_user: otherUser,
      last_message: lastMsgs && lastMsgs.length > 0 ? lastMsgs[0] : null,
      unread_count: count || 0
    };
  }));

  return formatted;
};

export const fetchMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    });

  if (error) throw error;

  // Update conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
};

export const createOrGetConversation = async (currentUserId: string, otherUserId: string, listingId?: string) => {
  // Check if it exists
  let query = supabase
    .from('conversations')
    .select('*')
    .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`);
    
  if (listingId) {
    query = query.eq('listing_id', listingId);
  } else {
    query = query.is('listing_id', null);
  }

  const { data, error } = await query;

  if (data && data.length > 0) {
    return data[0];
  }

  // Create new
  const { data: newConv, error: insertError } = await supabase
    .from('conversations')
    .insert({
      participant1_id: currentUserId,
      participant2_id: otherUserId,
      listing_id: listingId || null
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return newConv;
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);
};
"""

if 'fetchConversations' not in content:
    content += chat_queries

with open('src/lib/supabaseQueries.ts', 'w', encoding='utf-8') as f:
    f.write(content)
