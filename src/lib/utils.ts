export function validateImage(file: File): string | null {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    return "Image size must be less than 10MB.";
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";

  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export async function createHDDownloadUrl(
  file: File,
  blob: Blob,
  ultra: boolean = false
): Promise<string> {
  return URL.createObjectURL(blob);
}
