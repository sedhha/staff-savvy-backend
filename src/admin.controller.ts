import { Controller, Get, Body } from '@nestjs/common';
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
  async generateMagicLink(@Body() body: { supabaseUser: ISupaBaseUser }) {
    return this.appService.generateMagicLinkForEmployee(
      body.supabaseUser.user_metadata.employeeCode,
    );
  }
}
