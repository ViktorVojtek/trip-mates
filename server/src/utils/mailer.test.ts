import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { createTransport, sendMailMock } = vi.hoisted(() => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'x' });
  const createTransport = vi.fn(() => ({ sendMail: sendMailMock }));
  return { createTransport, sendMailMock };
});

vi.mock('nodemailer', () => ({
  default: { createTransport },
}));

import { sendMail, notifyTripInterest } from './mailer.js';

const ENV = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  process.env = { ...ENV };
});

describe('sendMail()', () => {
  it('is a no-op returning false when SMTP_HOST is not set', async () => {
    delete process.env.SMTP_HOST;
    const ok = await sendMail({ to: 'a@b.com', subject: 'Hi', text: 'Body' });
    expect(ok).toBe(false);
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('sends through the transporter when SMTP_HOST is configured', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';

    const ok = await sendMail({ to: 'a@b.com', subject: 'Hi', text: 'Body' });

    expect(ok).toBe(true);
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.example.com', port: 587, secure: false })
    );
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@b.com', subject: 'Hi', text: 'Body' })
    );
  });
});

describe('notifyTripInterest()', () => {
  it('emails the owner with the trip title and interested user name', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';

    await notifyTripInterest({
      ownerEmail: 'owner@b.com',
      ownerName: 'Olivia',
      tripTitle: 'Beach Trip',
      interestedName: 'Ivan',
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@b.com',
        subject: expect.stringContaining('Beach Trip'),
        text: expect.stringContaining('Ivan'),
      })
    );
  });
});
