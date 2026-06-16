import { describe, it, expect, vi, afterEach } from 'vitest';

const uploadMock = vi.fn();
vi.mock('cloudinary', () => ({
  v2: { uploader: { upload: uploadMock }, config: vi.fn() },
}));

import { resolveAvatarUrl, isCloudEnabled } from './avatarStorage.js';

const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
  vi.clearAllMocks();
});

describe('avatar storage', () => {
  it('returns the local /uploads path when Cloudinary is not configured', async () => {
    delete process.env.CLOUDINARY_URL;
    expect(isCloudEnabled()).toBe(false);

    const url = await resolveAvatarUrl({ path: '/tmp/avatar.png', filename: 'avatar.png' });

    expect(url).toBe('/uploads/avatar.png');
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('uploads to Cloudinary and returns the secure_url when configured', async () => {
    process.env.CLOUDINARY_URL = 'cloudinary://key:secret@cloud';
    uploadMock.mockResolvedValue({ secure_url: 'https://cdn.example/avatar.png' });

    const url = await resolveAvatarUrl({ path: '/tmp/avatar.png', filename: 'avatar.png' });

    expect(uploadMock).toHaveBeenCalledWith('/tmp/avatar.png', expect.objectContaining({ folder: expect.any(String) }));
    expect(url).toBe('https://cdn.example/avatar.png');
  });
});
