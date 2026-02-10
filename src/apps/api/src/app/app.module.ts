import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BackendConfigModule } from '@libs/backend-config';
import { CommonModule } from '@libs/backend-common';
import { UsersController } from '../controllers/users.controller';

@Module({
  imports: [
    BackendConfigModule.forRoot(),
    CommonModule.forRoot(),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
