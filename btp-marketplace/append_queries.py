import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\lib\supabaseQueries.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we import UserSession if it exists in types, else we'll just use any for profiles for now.
# We'll just define the admin functions.

admin_functions = """

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
"""

if "// ADMIN QUERIES" not in content:
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write(admin_functions)
    print("Admin queries appended.")
else:
    print("Admin queries already exist.")
