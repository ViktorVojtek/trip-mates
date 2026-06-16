import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gracefulShutdown } from './shutdown.js';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('gracefulShutdown()', () => {
  it('closes io, the http server, and prisma, then exits 0', async () => {
    const io = { close: vi.fn() };
    const httpServer = { close: vi.fn() };
    const prisma = { $disconnect: vi.fn().mockResolvedValue(undefined) };
    const exit = vi.fn();

    await gracefulShutdown({ httpServer, io, prisma, exit })('SIGTERM');

    expect(io.close).toHaveBeenCalled();
    expect(httpServer.close).toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(0);
  });
});
