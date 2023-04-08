import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { OpenAppController } from './openApp.controller';
import { AppService } from './app.service';
import { OpenAppService } from './openApp.service';

@Module({
  imports: [],
  controllers: [AppController, OpenAppController],
  providers: [AppService, OpenAppService],
})
export class AppModule {}
