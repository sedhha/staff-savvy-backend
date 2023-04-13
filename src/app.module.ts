import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WixConnectorAppController } from './wixConnectorApp.controller';
import { OpenAppController } from './openApp.controller';
import { WixConnectorAppService } from './wixConnectorApp.service';
import { OpenAppService } from './openApp.service';
import { WixApiKeyMiddleware } from './wixConnectorApp.middleware';
import { AdminAppController } from './admin.controller';
import { AdminAppService } from './admin.service';
import { AdminAppMiddleware } from './admin.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.TEST_ENVIRONMENT ? '.env.test' : '.env',
      isGlobal: true,
    }),
  ],
  controllers: [
    WixConnectorAppController,
    OpenAppController,
    AdminAppController,
  ],
  providers: [WixConnectorAppService, OpenAppService, AdminAppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WixApiKeyMiddleware).forRoutes(WixConnectorAppController);
    consumer.apply(AdminAppMiddleware).forRoutes(AdminAppController);
  }
}
