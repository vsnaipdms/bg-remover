export async function createHDDownloadUrl(
  file: File,
  blob: Blob,
  ultra: boolean = false
): Promise<string> {
  return URL.createObjectURL(blob);
}
