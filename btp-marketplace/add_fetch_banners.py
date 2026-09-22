import re

with open('src/lib/supabaseQueries.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_function = """
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
"""

if 'fetchBanners' not in content:
    content += new_function

with open('src/lib/supabaseQueries.ts', 'w', encoding='utf-8') as f:
    f.write(content)
