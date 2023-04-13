import {
  Controller,
  Get,
  Body,
  HttpCode,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AdminAppService } from './admin.service';
import { ISupaBaseUser } from './wixConnectorApp.interface';

@Controller('admin')
export class AdminAppController {
  constructor(private readonly appService: AdminAppService) {}

  @Get('ping')
  returnAdmin() {
    return 'Hello Admin';
  }

  @Get('generate-magic-link')
  @HttpCode(201)
  async generateMagicLink(@Body() body: { supabaseUser: ISupaBaseUser }) {
    return this.appService.generateMagicLinkForEmployee(
      body.supabaseUser.user_metadata.employeeCode,
    );
  }

  @Get('get-pending-magic-links')
  async getPendingMagicLinks(@Body() body: { supabaseUser: ISupaBaseUser }) {
    return this.appService.getPendingGeneratedLinks(
      body.supabaseUser.user_metadata.employeeCode,
    );
  }
  @Get('revoke-pending-magic-link')
  @HttpCode(204)
  async revokePendingMagicLink(
    @Query('employeeCode') employeeCode: string,
    @Body() body: { supabaseUser: ISupaBaseUser },
  ) {
    if (!employeeCode)
      throw new NotFoundException('Employee code is not found in the API.');
    return this.appService.removeInviteByCode(
      body.supabaseUser.user_metadata.employeeCode,
      employeeCode,
    );
  }
}
