import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export interface LoggerContext {
  module?: string;
  method?: string;
  [key: string]: unknown;
}

// Use require to avoid esModuleInterop issues
const pino = require('pino');

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: any;

  constructor() {
    const isDevelopment = process.env['NODE_ENV'] !== 'production';
    
    this.logger = pino({
      level: process.env['LOG_LEVEL'] || (isDevelopment ? 'debug' : 'info'),
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      formatters: {
        level: (label: string) => {
          return { level: label.toUpperCase() };
        },
      },
    });
  }

  log(message: string, context?: LoggerContext): void {
    this.logger.info({ ...context }, message);
  }

  error(message: string, trace?: string, context?: LoggerContext): void {
    this.logger.error({ ...context, trace }, message);
  }

  warn(message: string, context?: LoggerContext): void {
    this.logger.warn({ ...context }, message);
  }

  debug(message: string, context?: LoggerContext): void {
    this.logger.debug({ ...context }, message);
  }

  verbose(message: string, context?: LoggerContext): void {
    this.logger.trace({ ...context }, message);
  }

  /**
   * Log with custom level and context
   */
  logWithContext(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: LoggerContext): void {
    this.logger[level]({ ...context }, message);
  }

  /**
   * Create a child logger with default context
   */
  child(context: LoggerContext): any {
    return this.logger.child(context);
  }

  /**
   * Log HTTP request with response details
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LoggerContext
  ): void {
    const logData = {
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: 'http_request',
    };

    if (statusCode >= 500) {
      this.logger.error(logData, `${method} ${url} - ${statusCode} (${duration}ms)`);
    } else if (statusCode >= 400) {
      this.logger.warn(logData, `${method} ${url} - ${statusCode} (${duration}ms)`);
    } else {
      this.logger.info(logData, `${method} ${url} - ${statusCode} (${duration}ms)`);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, context?: LoggerContext): void {
    this.logger.info(
      {
        ...context,
        operation,
        duration,
        type: 'performance',
      },
      `Performance: ${operation} took ${duration}ms`
    );
  }

  /**
   * Log custom metric
   */
  logMetric(metric: string, value: number, unit?: string, context?: LoggerContext): void {
    this.logger.info(
      {
        ...context,
        metric,
        value,
        unit,
        type: 'metric',
      },
      `Metric: ${metric} = ${value}${unit ? ` ${unit}` : ''}`
    );
  }

  /**
   * Log database query (for debugging)
   */
  logQuery(query: string, duration?: number, context?: LoggerContext): void {
    this.logger.debug(
      {
        ...context,
        query,
        duration,
        type: 'database_query',
      },
      `Query: ${query}${duration ? ` (${duration}ms)` : ''}`
    );
  }
}
