import { Controller, Get, Headers } from '@nestjs/common';
import { OpenAppService } from './openApp.service';
import { IResponse } from './response.interface';

@Controller('open')
export class OpenAppController {
  constructor(private readonly openAppService: OpenAppService) {}

  @Get('ping')
  getPing(
    @Headers() headers: Record<string, unknown>,
  ): IResponse<{ message: string; from: Record<string, unknown> }> {
    return this.openAppService.getPing(headers);
  }
}
