import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreativeAreasService } from './creative-areas.service';
import { CreateCreativeAreaDto } from './dto/create-creative-area.dto';
import { UpdateCreativeAreaDto } from './dto/update-creative-area.dto';

@Controller('creative-areas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CreativeAreasController {
  constructor(private readonly creativeAreasService: CreativeAreasService) {}

  @Get()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.creativeAreasService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.creativeAreasService.findById(id);
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCreativeAreaDto: CreateCreativeAreaDto) {
    return this.creativeAreasService.create(createCreativeAreaDto);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCreativeAreaDto: UpdateCreativeAreaDto,
  ) {
    return this.creativeAreasService.update(id, updateCreativeAreaDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.creativeAreasService.remove(id);
  }
}