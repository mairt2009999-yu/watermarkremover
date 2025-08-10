import { type NextRequest, NextResponse } from 'next/server';

/**
 * Timeout configuration for middleware operations
 */
export const MIDDLEWARE_TIMEOUT_MS = Number.parseInt(
  process.env.MIDDLEWARE_TIMEOUT_MS || '2500',
  10
);

/**
 * Generate a unique request ID for debugging and tracking
 */
export function createRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Timeout error class for middleware operations
 */
export class MiddlewareTimeoutError extends Error {
  constructor(timeoutMs: number, operation: string) {
    super(`Middleware operation '${operation}' timed out after ${timeoutMs}ms`);
    this.name = 'MiddlewareTimeoutError';
  }
}

/**
 * Performance metrics for middleware operations
 */
export interface MiddlewareMetrics {
  requestId: string;
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}

/**
 * Log middleware performance metrics
 */
export function logMiddlewareMetrics(metrics: MiddlewareMetrics): void {
  const { requestId, operation, duration, success, error } = metrics;

  if (process.env.NODE_ENV === 'development') {
    const status = success ? '✅' : '❌';
    console.log(
      `${status} Middleware ${operation} [${requestId}]: ${duration}ms${error ? ` - ${error}` : ''}`
    );
  }

  // In production, you might want to send these metrics to a monitoring service
  if (process.env.NODE_ENV === 'production' && (!success || duration > 1000)) {
    console.warn(
      `Middleware performance issue: ${operation} took ${duration}ms`,
      {
        requestId,
        operation,
        duration,
        success,
        error,
      }
    );
  }
}

/**
 * Wrap a middleware function with timeout protection and performance monitoring
 *
 * @param middlewareFn - The middleware function to wrap
 * @param operation - Name of the operation for logging
 * @param timeoutMs - Timeout in milliseconds (default: MIDDLEWARE_TIMEOUT_MS)
 * @returns Promise that resolves to NextResponse or throws timeout error
 */
export async function withMiddlewareTimeout(
  middlewarePromise: Promise<NextResponse>,
  operation: string,
  timeoutMs: number = MIDDLEWARE_TIMEOUT_MS
): Promise<NextResponse> {
  const requestId = createRequestId();
  const startTime = performance.now();

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutHandle = setTimeout(() => {
      reject(new MiddlewareTimeoutError(timeoutMs, operation));
    }, timeoutMs);

    // Store timeout handle for cleanup (though Promise.race handles this)
    timeoutHandle.unref?.(); // Don't keep process alive
  });

  try {
    // Race between middleware execution and timeout
    const response = await Promise.race([middlewarePromise, timeoutPromise]);

    // Log success metrics
    const endTime = performance.now();
    logMiddlewareMetrics({
      requestId,
      operation,
      startTime,
      endTime,
      duration: Math.round(endTime - startTime),
      success: true,
    });

    return response;
  } catch (error) {
    const endTime = performance.now();
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Log error metrics
    logMiddlewareMetrics({
      requestId,
      operation,
      startTime,
      endTime,
      duration: Math.round(endTime - startTime),
      success: false,
      error: errorMessage,
    });

    // Re-throw the error for upstream handling
    throw error;
  }
}

/**
 * Create a graceful fallback response when middleware operations fail
 *
 * @param req - The original request
 * @param error - The error that occurred
 * @param operation - Name of the failed operation
 * @returns NextResponse with appropriate fallback behavior
 */
export function createMiddlewareFallback(
  req: NextRequest,
  error: Error,
  operation: string
): NextResponse {
  const { nextUrl } = req;

  console.warn(`Middleware fallback activated for ${operation}:`, {
    url: nextUrl.pathname,
    error: error.message,
    timestamp: new Date().toISOString(),
  });

  // For timeout errors, continue without i18n processing
  if (error instanceof MiddlewareTimeoutError) {
    console.warn(
      `⚠️ ${operation} timed out, continuing without i18n processing`
    );
    return NextResponse.next();
  }

  // For other errors, also continue but log more details
  console.error(`❌ ${operation} failed:`, error);
  return NextResponse.next();
}

/**
 * Wrap intlMiddleware with timeout protection and fallback handling
 *
 * @param intlMiddleware - The next-intl middleware function
 * @param req - The request object
 * @returns Promise<NextResponse> with timeout protection
 */
export async function withIntlMiddlewareTimeout(
  intlMiddleware: (req: NextRequest) => NextResponse | Promise<NextResponse>,
  req: NextRequest
): Promise<NextResponse> {
  try {
    const middlewarePromise = Promise.resolve(intlMiddleware(req));
    return await withMiddlewareTimeout(middlewarePromise, 'intlMiddleware');
  } catch (error) {
    // Create graceful fallback for intl middleware failures
    return createMiddlewareFallback(req, error as Error, 'intlMiddleware');
  }
}
