import { supabase } from './supabaseClient';

/**
 * Uploads a file to a specified Supabase Storage bucket.
 * 
 * @param file The File object to upload
 * @param bucket The name of the storage bucket
 * @param folderPath Optional folder path inside the bucket (e.g., 'user_123')
 * @returns The public URL of the uploaded file, or null if it failed.
 */
export const uploadFileToSupabase = async (
  file: File,
  bucket: string,
  folderPath: string = ''
): Promise<string | null> => {
  try {
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`Error uploading to ${bucket}:`, uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Unexpected error in uploadFileToSupabase:', err);
    return null;
  }
};
