import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\lib\supabaseQueries.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_functions = """
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
"""

if "deleteMyListing" not in content:
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write("\n" + new_functions)
    print("Added deleteMyListing and updateMyListing!")
else:
    print("Functions already exist.")

