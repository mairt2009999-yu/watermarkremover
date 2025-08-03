/**
 * Prisma shim to prevent runtime errors
 * This file intercepts Prisma Client imports and provides a no-op implementation
 */

if (typeof window === 'undefined') {
  // Server-side only
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function (id) {
    if (id === '@prisma/client' || id === 'prisma') {
      // Return a mock Prisma client
      return {
        PrismaClient: class PrismaClient {
          constructor() {
            console.warn('Prisma Client shimmed - using Drizzle ORM instead');
          }
          $connect() {
            return Promise.resolve();
          }
          $disconnect() {
            return Promise.resolve();
          }
          $on() {}
          $use() {}
        },
        Prisma: {
          PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
          PrismaClientUnknownRequestError: class PrismaClientUnknownRequestError extends Error {},
          PrismaClientRustPanicError: class PrismaClientRustPanicError extends Error {},
          PrismaClientInitializationError: class PrismaClientInitializationError extends Error {},
          PrismaClientValidationError: class PrismaClientValidationError extends Error {},
        },
      };
    }
    return originalRequire.apply(this, arguments);
  };
}

module.exports = {};
