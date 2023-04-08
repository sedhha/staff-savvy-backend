import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { zodValidator } from './utils/zodValidator';
import { z } from 'zod';

@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('login')
  loginUser(@Body() body: { email: string; password: string }) {
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
}
