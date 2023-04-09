import { Test, TestingModule } from '@nestjs/testing';
import { WixConnectorAppController } from './wixConnectorApp.controller';
import { WixConnectorAppService } from './wixConnectorApp.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [WixConnectorAppController],
      providers: [WixConnectorAppService],
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get(WixConnectorAppController);
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
