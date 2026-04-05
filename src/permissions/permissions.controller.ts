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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions('read_permission')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('read_permission')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findById(id);
  }

  @Post()
  @Permissions('create_permission')
  create(@Body() createDto: CreatePermissionDto) {
    return this.permissionsService.create(createDto);
  }

  @Put(':id')
  @Permissions('update_permission')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('delete_permission')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.remove(id);
  }
}
