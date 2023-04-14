import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserAppService } from './user.service';
import { ISupaBaseUser } from './wixConnectorApp.interface';
import { IAccessRequest } from './admin.interfaces';

@Controller('user')
export class UserAppController {
  constructor(private readonly appService: UserAppService) {}

  @Get('ping')
  returnAdmin() {
    return 'Hello User';
  }

  @Get('get-request-categories')
  async getRequestCategories(@Body() body: { supabaseUser: ISupaBaseUser }) {
    return this.appService.getAllCategories(
      body.supabaseUser.user_metadata.orgCode,
    );
  }

  @Get('get-my-access')
  async getMyAccess(@Body() body: { supabaseUser: ISupaBaseUser }) {
    return this.appService.getMyAccess(
      body.supabaseUser.user_metadata.orgCode,
      body.supabaseUser.user_metadata.employeeCode,
    );
  }

  @Post('request-access')
  async requestAccess(
    @Body() body: { supabaseUser: ISupaBaseUser; payload: IAccessRequest },
  ) {
    return this.appService.addAnAccessRequest(
      body.supabaseUser.user_metadata.orgCode,
      body.supabaseUser.user_metadata.employeeCode,
      body.payload,
    );
  }
}
