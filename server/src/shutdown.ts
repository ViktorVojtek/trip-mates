interface ShutdownDeps {
  httpServer: { close: (cb?: (err?: Error) => void) => void };
  io: { close: (cb?: () => void) => void };
  prisma: { $disconnect: () => Promise<void> };
  exit?: (code: number) => void;
}

/**
 * Builds a signal handler that closes Socket.IO, the HTTP server, and the
 * Prisma connection before exiting — so in-flight work drains cleanly.
 */
export const gracefulShutdown =
  (deps: ShutdownDeps) =>
  async (signal: string): Promise<void> => {
    console.log(`${signal} received — shutting down gracefully...`);
    deps.io.close();
    deps.httpServer.close();
    await deps.prisma.$disconnect();
    (deps.exit ?? process.exit)(0);
  };
