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
import { RolPermissionsService } from './rol-permissions.service';
import { CreateRolPermissionDto } from './dto/create-rol-permission.dto';
import { UpdateRolPermissionDto } from './dto/update-rol-permission.dto';

@Controller('rol-permissions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RolPermissionsController {
  constructor(private readonly service: RolPermissionsService) {}

  @Get()
  @Permissions('read_rol_permission')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('read_rol_permission')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Get('rol/:rolId')
  @Permissions('read_rol_permission')
  findByRol(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.service.findByRol(rolId);
  }

  @Post()
  @Permissions('create_rol_permission')
  create(@Body() createDto: CreateRolPermissionDto) {
    return this.service.create(createDto);
  }

  @Put(':id')
  @Permissions('update_rol_permission')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRolPermissionDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('delete_rol_permission')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
