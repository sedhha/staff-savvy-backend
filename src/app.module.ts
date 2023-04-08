import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { OpenAppController } from './openApp.controller';
import { AppService } from './app.service';
import { OpenAppService } from './openApp.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.TEST_ENVIRONMENT ? '.env.test' : '.env',
      isGlobal: true,
    }),
  ],
  controllers: [AppController, OpenAppController],
  providers: [AppService, OpenAppService],
})
export class AppModule {}
