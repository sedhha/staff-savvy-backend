import { Post, Controller, Get, Body } from '@nestjs/common';
import { AdminAppService } from './admin.service';
import { ISupaBaseUser } from './wixConnectorApp.interface';

@Controller('admin')
export class AdminAppController {
  constructor(private readonly appService: AdminAppService) {}

  @Get('ping')
  returnAdmin() {
    return 'Hello Admin';
  }

  @Post('generate-magic-link')
  async generateMagicLink(@Body() body: { user: ISupaBaseUser }) {
    return this.appService.generateMagicLinkForEmployee(
      body.user.user_metadata.employeeCode,
    );
  }
}
