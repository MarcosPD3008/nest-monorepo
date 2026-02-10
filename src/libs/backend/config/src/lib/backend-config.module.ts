import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UserService } from './users/services/user.service';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService],
  exports: [ConfigModule, TypeOrmModule, UserService],
})
export class BackendConfigModule {
  static forRoot() {
    return {
      module: BackendConfigModule,
      global: true,
    };
  }

  static forRootAsync(options?: {
    entities?: any[];
    services?: any[];
  }) {
    return {
      module: BackendConfigModule,
      imports: [
        TypeOrmModule.forFeature(options?.entities || [User]),
      ],
      providers: options?.services || [UserService],
      exports: [TypeOrmModule, ...(options?.services || [UserService])],
      global: true,
    };
  }
}

