import sys

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

# 1. Add import and helper function
import_statement = "import imageCompression from 'browser-image-compression';\n"
helper_function = """
const compressImage = async (file: File) => {
  if (!file.type.startsWith('image/')) return file;
  const options = {
    maxSizeMB: 0.5, // 500KB Max
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp'
  };
  try {
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob back to File
    const ext = compressedBlob.type.split('/')[1] || 'webp';
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.' + ext;
    return new File([compressedBlob], newFileName, { type: compressedBlob.type });
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
};
"""

if 'import imageCompression' not in app:
    app = app.replace("import React, { useState, useEffect, useRef, useCallback } from 'react';", 
                      "import React, { useState, useEffect, useRef, useCallback } from 'react';\n" + import_statement)
    
    # insert helper function just before the `export default function App() {`
    app = app.replace("export default function App() {", helper_function + "\nexport default function App() {")


# Now we modify the upload occurrences.
# Occurrence 1: handlePostAd -> upload images
# file is used in a loop:
"""
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);
"""
app = app.replace(
    ".upload(filePath, file);", 
    ".upload(filePath, await compressImage(file));"
)

# Occurrence 2: logoFile and bannerFile in handlePostStore
"""
          const { error: err1 } = await supabase.storage.from('listings').upload(`${user?.id || "guest"}/logo_${logoFile.name}`, logoFile);
"""
app = app.replace(
    ", logoFile);",
    ", await compressImage(logoFile));"
)
app = app.replace(
    ", bannerFile);",
    ", await compressImage(bannerFile));"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("App.tsx modified successfully.")
