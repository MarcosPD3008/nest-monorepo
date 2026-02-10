import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.logWithContext('info', `${method} ${url}`, {
      module: 'HTTP',
      method: 'request',
      httpMethod: method,
      url,
      body: this.sanitizeBody(body),
      query,
      params,
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          this.logger.logWithContext(
            statusCode >= 400 ? 'warn' : 'info',
            `${method} ${url} ${statusCode} - ${duration}ms`,
            {
              module: 'HTTP',
              method: 'response',
              httpMethod: method,
              url,
              statusCode,
              duration,
              responseSize: this.getResponseSize(data),
            }
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          this.logger.logWithContext('error', `${method} ${url} ${statusCode} - ${duration}ms`, {
            module: 'HTTP',
            method: 'response',
            httpMethod: method,
            url,
            statusCode,
            duration,
            error: error.message,
          });
        },
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  private getResponseSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}
