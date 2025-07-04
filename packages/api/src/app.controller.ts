import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('/health')
  health(@Res() res: Response): void {
    res.status(HttpStatus.OK).json({ status: 'ok' });
  }

  @Get('/protected')
  protected(@Res() res: Response): void {
    res.status(HttpStatus.OK).json({ status: 'ok' });
  }
}
