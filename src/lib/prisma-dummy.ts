/**
 * Dummy Prisma client to satisfy dependencies
 * The actual project uses Drizzle ORM
 */

// This file prevents Prisma-related errors during build
// It's a workaround for dependencies that expect Prisma to be available

export const prismaClient = {
  $connect: async () => {},
  $disconnect: async () => {},
  // Add any other methods that might be called
};

// Export as default for compatibility
export default prismaClient;
