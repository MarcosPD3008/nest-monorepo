import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ValidationPipe } from './pipes/validation.pipe';
import { LoggerModule } from './logger/logger.module';
import { LoggerService } from './logger/logger.service';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (loggerService: LoggerService) => {
        return new AllExceptionsFilter(loggerService);
      },
      inject: [LoggerService],
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: LoggerService) => {
        return new LoggingInterceptor(logger);
      },
      inject: [LoggerService],
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  exports: [LoggerModule],
})
export class CommonModule {
  static forRoot() {
    return {
      module: CommonModule,
      global: true,
    };
  }
}
