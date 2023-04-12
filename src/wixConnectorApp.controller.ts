import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { WixConnectorAppService } from './wixConnectorApp.service';
import { zodValidator } from './utils/zodValidator';
import { z } from 'zod';
import { ISignUpUser } from './wixConnectorApp.interface';

@Controller('auth')
export class WixConnectorAppController {
  constructor(private readonly appService: WixConnectorAppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('login')
  @HttpCode(200)
  async loginUser(@Body() body: { email: string; password: string }) {
    const loginUserSchema = z.object({
      email: z.string(),
      password: z.string(),
    });
    const response = zodValidator(loginUserSchema, body);
    if (response?.isError)
      throw new HttpException(
        JSON.stringify((response as { message: string }).message),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    else {
      const { email, password } = response as {
        email: string;
        password: string;
      };
      return this.appService.loginUser(email, password);
    }
  }
  @Post('signup')
  signupUser(@Body() body: ISignUpUser) {
    return this.appService.signUpUser(body);
  }
}
