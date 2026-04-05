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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Controller('rol')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Get()
  @Permissions('read_rol')
  findAll() {
    return this.rolService.findAll();
  }

  @Get(':id')
  @Permissions('read_rol')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.findById(id);
  }

  @Post()
  @Permissions('create_rol')
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolService.create(createRolDto);
  }

  @Put(':id')
  @Permissions('update_rol')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return this.rolService.update(id, updateRolDto);
  }

  @Delete(':id')
  @Permissions('delete_rol')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.remove(id);
  }
}
