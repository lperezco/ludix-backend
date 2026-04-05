import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  
  @Get()
  @ApiOperation({ summary: 'Mensaje de bienvenida' })
  getHello(): string {
    return 'Hello World!';
  }
}
