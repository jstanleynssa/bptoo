import imageCompression from 'browser-image-compression'

const OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2000,
  useWebWorker: true,
  initialQuality: 0.85,
}

/**
 * Compresses an image file client-side before upload.
 * - Max output: 2MB, 2000px on longest side
 * - Skips non-image files, returns original on failure
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  try {
    return await imageCompression(file, OPTIONS)
  } catch {
    // If compression fails for any reason, upload the original
    return file
  }
}
