import { supabase } from './supabaseClient';
import type { Store, Tender, JobOffer, Auction } from '../types';

export const fetchStores = async (): Promise<Store[]> => {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      profiles:owner_id (
        full_name,
        company_name,
        phone,
        is_verified
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stores:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    owner_id: item.owner_id,
    name: item.name,
    description: item.description,
    logoUrl: item.logo_url,
    bannerUrl: item.banner_url,
    wilaya: item.wilaya,
    phone: item.phone,
    isPremium: item.is_premium,
    isVerified: item.is_verified,
    rating: item.rating,
    categories: item.categories,
    paymentMethods: item.payment_methods,
    joinedDate: item.created_at
  }));
};

export const fetchTenders = async (): Promise<Tender[]> => {
  const { data, error } = await supabase
    .from('tenders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tenders:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    companyName: item.company_name,
    description: item.description,
    wilaya: item.wilaya,
    deadline: item.deadline,
    budget: item.budget,
    category: item.category,
    sellerId: item.seller_id,
    authorId: item.author_id,
    isPremiumOnly: item.is_premium_only,
    dateAdded: item.created_at
  }));
};

export const fetchJobOffers = async (): Promise<JobOffer[]> => {
  const { data, error } = await supabase
    .from('job_offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching job offers:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    companyName: item.company_name,
    candidateName: item.candidate_name,
    description: item.description,
    wilaya: item.wilaya,
    profession: item.profession,
    experience: item.experience,
    cvUrl: item.cv_url,
    authorId: item.author_id,
    dateAdded: item.created_at
  }));
};

export const fetchAuctions = async (): Promise<Auction[]> => {
  const { data, error } = await supabase
    .from('auctions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching auctions:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    companyName: item.company_name,
    description: item.description,
    wilaya: item.wilaya,
    commune: item.commune,
    startingPrice: item.starting_price,
    currentBid: item.current_bid,
    endDate: item.end_date,
    category: item.category,
    images: item.images,
    isVerified: item.is_verified,
    createdAt: item.created_at
  }));
};

export const fetchBanners = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
  return data;
};

export const fetchPaymentRequests = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('payment_requests')
    .select(`
      *,
      profiles:user_id (
        full_name,
        company_name,
        phone,
        whatsapp,
        premium_until
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment requests:', error);
    return [];
  }
  return data;
};

export const submitPaymentRequest = async (userId: string, plan: 'premium' | 'vip', durationMonths: number, receiptUrl: string) => {
  const { error } = await supabase.from('payment_requests').insert({
    user_id: userId,
    requested_plan: plan,
    duration_months: durationMonths,
    receipt_url: receiptUrl,
    status: 'pending'
  });
  
  if (error) {
    // Code '42703' means undefined_column in PostgreSQL
    if (error.code === '42703' || error.message?.includes('duration_months')) {
      const { error: retryError } = await supabase.from('payment_requests').insert({
        user_id: userId,
        requested_plan: plan,
        receipt_url: receiptUrl,
        status: 'pending'
      });
      if (retryError) throw retryError;
    } else {
      throw error;
    }
  }
};

export const approvePaymentRequest = async (requestId: string, userId: string, plan: 'premium' | 'vip', durationMonths: number) => {
  // 1. Update the request status
  const { error: reqError } = await supabase
    .from('payment_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);
    
  if (reqError) throw reqError;

  // Calculate new expiration date (from today)
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + (durationMonths || 1));

  // 2. Update user profile
  const updateData = plan === 'vip' 
    ? { is_vip: true, premium_until: expirationDate.toISOString() } 
    : { is_vip: false, premium_until: expirationDate.toISOString() };
    
  const { error: profError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);
    
  if (profError) throw profError;
};

export const rejectPaymentRequest = async (requestId: string) => {
  const { error } = await supabase
    .from('payment_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);
  if (error) throw error;
};

// --- Chat System Queries ---

export const fetchConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Format the data to attach "other_user" easily
  const formatted = await Promise.all(data.map(async (conv: any) => {
    const isP1 = conv.participant1_id === userId;
    const otherUserId = isP1 ? conv.participant2_id : conv.participant1_id;
    
    // Fetch other user profile manually to avoid FK constraint errors
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, avatar_url')
      .eq('id', otherUserId)
      .single();

    // Fetch listing manually if exists
    let listingData = null;
    if (conv.listing_id) {
       const { data: l } = await supabase
         .from('listings')
         .select('title')
         .eq('id', conv.listing_id)
         .single();
       listingData = l;
    }
    
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
      other_user: profile || { id: otherUserId, full_name: 'Utilisateur Inconnu' },
      listing: listingData,
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


// ADMIN QUERIES
export const fetchAllUsersAdmin = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data;
};

export const updateUserRoleAdmin = async (userId: string, role: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw error;
};

export const deleteListingAdmin = async (listingId: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);
  if (error) throw error;
};

export const verifyStoreAdmin = async (storeId: string, isVerified: boolean, isPremium: boolean) => {
  const { error } = await supabase
    .from('stores')
    .update({ is_verified: isVerified, is_premium: isPremium })
    .eq('id', storeId);
  if (error) throw error;
};

export const deleteUserAdmin = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
};

export const fetchBannersAdmin = async () => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const insertBannerAdmin = async (sponsor_name: string, image_url: string, link_url: string, position: string) => {
  const { error } = await supabase
    .from('banners')
    .insert({ sponsor_name, image_url, link_url, position });
  if (error) throw error;
};

export const deleteBannerAdmin = async (bannerId: string) => {
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', bannerId);
  if (error) throw error;
};

export const fetchListings = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      profiles:seller_id (
        full_name,
        company_name,
        phone,
        is_verified
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
  return data;
};


export const deleteMyListing = async (listingId: string, authorId: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('author_id', authorId);
    
  if (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

export const updateMyListing = async (listingId: string, authorId: string, updates: any) => {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', listingId)
    .eq('author_id', authorId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
  return data;
};

export const deleteStoreAdmin = async (storeId: string) => {
  const { error } = await supabase.from('stores').delete().eq('id', storeId);
  if (error) {
    console.error('Error deleting store:', error);
    return false;
  }
  return true;
};
