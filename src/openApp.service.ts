import { Injectable, Headers } from '@nestjs/common';
import { IResponse } from './response.interface';

@Injectable()
export class OpenAppService {
  getPing(
    @Headers() headers: Record<string, unknown>,
  ): IResponse<{ message: string; from: Record<string, unknown> }> {
    return {
      error: false,
      data: { message: 'Pong', from: headers },
    };
  }
}
