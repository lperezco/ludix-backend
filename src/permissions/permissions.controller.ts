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
  @Permissions('manage_users')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('manage_users')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findById(id);
  }

  @Post()
  @Permissions('manage_users')
  create(@Body() createDto: CreatePermissionDto) {
    return this.permissionsService.create(createDto);
  }

  @Put(':id')
  @Permissions('manage_users')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('manage_users')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.remove(id);
  }
}
