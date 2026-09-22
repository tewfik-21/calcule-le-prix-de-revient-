import re

with open('src/lib/supabaseQueries.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_queries = """
export const fetchPaymentRequests = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('payment_requests')
    .select(`
      *,
      profiles:user_id (
        full_name,
        company_name,
        phone,
        whatsapp
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment requests:', error);
    return [];
  }
  return data;
};

export const submitPaymentRequest = async (userId: string, plan: 'premium' | 'vip', receiptUrl: string) => {
  const { error } = await supabase.from('payment_requests').insert({
    user_id: userId,
    requested_plan: plan,
    receipt_url: receiptUrl,
    status: 'pending'
  });
  if (error) throw error;
};

export const approvePaymentRequest = async (requestId: string, userId: string, plan: 'premium' | 'vip') => {
  // 1. Update the request status
  const { error: reqError } = await supabase
    .from('payment_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);
    
  if (reqError) throw reqError;

  // 2. Update user profile
  const updateData = plan === 'vip' 
    ? { is_vip: true, is_premium: true } 
    : { is_premium: true };
    
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
"""

if 'fetchPaymentRequests' not in content:
    content += new_queries

with open('src/lib/supabaseQueries.ts', 'w', encoding='utf-8') as f:
    f.write(content)
