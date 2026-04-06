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
  @Permissions('manage_users')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('manage_users')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Get('rol/:rolId')
  @Permissions('manage_users')
  findByRol(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.service.findByRol(rolId);
  }

  @Post()
  @Permissions('manage_users')
  create(@Body() createDto: CreateRolPermissionDto) {
    return this.service.create(createDto);
  }

  @Put(':id')
  @Permissions('manage_users')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRolPermissionDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('manage_users')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
