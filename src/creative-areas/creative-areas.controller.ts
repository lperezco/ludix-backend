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
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreativeAreasService } from './creative-areas.service';
import { CreateCreativeAreaDto } from './dto/create-creative-area.dto';
import { UpdateCreativeAreaDto } from './dto/update-creative-area.dto';

@Controller('creative-areas')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CreativeAreasController {
  constructor(private readonly creativeAreasService: CreativeAreasService) {}

  @Get()
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.creativeAreasService.findAll();
  }

  @Get(':id')
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.creativeAreasService.findById(id);
  }

  @Post()
  @Permissions('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCreativeAreaDto: CreateCreativeAreaDto) {
    return this.creativeAreasService.create(createCreativeAreaDto);
  }

  @Put(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCreativeAreaDto: UpdateCreativeAreaDto,
  ) {
    return this.creativeAreasService.update(id, updateCreativeAreaDto);
  }

  @Delete(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.creativeAreasService.remove(id);
  }
}
