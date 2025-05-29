import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriveModule } from './drive/drive.module';

@Module({
  imports: [DriveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
