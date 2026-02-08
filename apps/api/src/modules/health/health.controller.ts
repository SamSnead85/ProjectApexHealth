import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: {
    database: { status: string; responseTime?: number; error?: string };
    redis: { status: string; responseTime?: number; error?: string };
    memory: { status: string; heapUsed: number; heapTotal: number; rss: number };
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Service health check with dependency status' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async getHealth(): Promise<HealthStatus> {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      memory: this.checkMemory(),
    };

    const allHealthy = checks.database.status === 'up'
      && checks.redis.status !== 'down'
      && checks.memory.status === 'ok';

    const someDegraded = checks.redis.status === 'unknown';

    return {
      status: allHealthy ? (someDegraded ? 'degraded' : 'healthy') : 'unhealthy',
      version: this.configService.get('npm_package_version', '1.0.0'),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readinessCheck(): Promise<{ status: string; timestamp: string }> {
    // Check critical dependencies for readiness
    const dbCheck = await this.checkDatabase();

    if (dbCheck.status !== 'up') {
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async livenessCheck(): Promise<{ status: string; uptime: number; timestamp: string }> {
    return {
      status: 'alive',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Private Checks ─────────────────────────────────

  private async checkDatabase(): Promise<{ status: string; responseTime?: number; error?: string }> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - start;

      return { status: 'up', responseTime };
    } catch (error) {
      return { status: 'down', error: error.message };
    }
  }

  private async checkRedis(): Promise<{ status: string; responseTime?: number; error?: string }> {
    try {
      // Redis check - in production this would use the actual Redis client.
      // For now, return unknown since we don't inject a Redis client here.
      return { status: 'unknown', error: 'Redis check not configured' };
    } catch (error) {
      return { status: 'down', error: error.message };
    }
  }

  private checkMemory(): { status: string; heapUsed: number; heapTotal: number; rss: number } {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);

    // Flag as warning if heap usage > 90%
    const heapPercent = memUsage.heapUsed / memUsage.heapTotal;
    const status = heapPercent > 0.9 ? 'warning' : 'ok';

    return {
      status,
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      rss: rssMB,
    };
  }
}
