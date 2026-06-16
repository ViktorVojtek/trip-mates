import fs from 'fs';

/** Cloud storage is enabled when CLOUDINARY_URL is configured. */
export const isCloudEnabled = (): boolean => Boolean(process.env.CLOUDINARY_URL);

/**
 * Resolves the public URL to store in `User.profilePicture` for an uploaded
 * avatar. When Cloudinary is configured the local temp file is uploaded to the
 * bucket and removed; otherwise the local `/uploads/...` path is used (dev
 * default — note local disk does not persist on ephemeral hosting).
 */
export async function resolveAvatarUrl(file: { path: string; filename: string }): Promise<string> {
  if (!isCloudEnabled()) {
    return `/uploads/${file.filename}`;
  }

  const { v2: cloudinary } = await import('cloudinary');
  const result = await cloudinary.uploader.upload(file.path, { folder: 'tripmates/avatars' });

  // Best-effort cleanup of the local temp copy.
  try {
    await fs.promises.unlink(file.path);
  } catch {
    /* ignore — temp file may already be gone */
  }

  return result.secure_url;
}
