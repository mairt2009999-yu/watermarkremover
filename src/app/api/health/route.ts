import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring application status
 * GET /api/health
 */
export async function GET() {
  const startTime = performance.now();

  try {
    // Basic health checks
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      middleware: {
        timeoutMs: Number.parseInt(
          process.env.MIDDLEWARE_TIMEOUT_MS || '2500',
          10
        ),
        status: 'operational',
      },
    };

    const responseTime = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        ...checks,
        responseTime,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'X-Health-Check': 'ok',
        },
      }
    );
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'X-Health-Check': 'error',
        },
      }
    );
  }
}
