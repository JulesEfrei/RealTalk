import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('/health')
  health(@Res() res): string {
    return res.status(HttpStatus.OK).json({ status: 'ok' });
  }

  @Get('/protected')
  protected(@Res() res): string {
    return res.status(HttpStatus.OK).json({ status: 'ok' });
  }
}
