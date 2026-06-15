import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request, Response, NextFunction } from 'express';

export const uploadsDir = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1] ?? 'png'}`;
    const userId = (req as Request & { userId?: string }).userId ?? 'anon';
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Wraps multer so rejections (wrong type, too large) become a clean 400
// instead of bubbling to the generic 500 error handler.
export const avatarUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('avatar')(req, res, (err: unknown) => {
    if (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : 'Upload failed' });
      return;
    }
    next();
  });
};
