import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AdminAppService } from './admin.service';
import { ISupaBaseUser } from './wixConnectorApp.interface';
import { IAccessFE } from './admin.interfaces';
import { HttpException, HttpStatus } from '@nestjs/common';

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
  @Get('get-all-accesses')
  async getAllAccess(@Body() body: { supabaseUser: ISupaBaseUser }) {
    return this.appService.getAllAccessByOrgID(
      body.supabaseUser.user_metadata.employeeCode,
    );
  }
  @Post('add-access-to-org')
  async addAccessToOrg(
    @Body() body: { supabaseUser: ISupaBaseUser; payload: IAccessFE[] },
  ) {
    return this.appService.addAccessToOrg(
      body.supabaseUser.user_metadata.employeeCode,
      body.payload,
    );
  }

  @Get('get-all-accesses-request')
  async getAllAccessRequest(@Body() body: { supabaseUser: ISupaBaseUser }) {
    return this.appService.getAllAccessRequest(
      body.supabaseUser.user_metadata.employeeCode,
    );
  }

  @Get('approve-request-by-request-id')
  async approveRequestByRequestID(
    @Body() body: { supabaseUser: ISupaBaseUser },
    @Query() params: { requestID: string },
  ) {
    if (!params.requestID)
      throw new HttpException('Request ID  not found', HttpStatus.BAD_REQUEST);
    return this.appService.updateUserRequest(
      body.supabaseUser.user_metadata.employeeCode,
      params.requestID,
    );
  }
}
