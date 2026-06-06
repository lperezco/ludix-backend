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
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.profilesService.findAll();
  }

  @Get('user/:userId')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.OK)
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.profilesService.findByUserId(userId);
  }

  @Get(':id')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findById(id);
  }

  @Post()
  @Permissions('create_profile')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() updateProfileDto: UpdateProfileDto) {
    // Primero obtener el perfil para verificar que pertenece al usuario
    const profile = await this.profilesService.findById(id);
    if (profile.userId !== req.user.id) {
      throw new UnauthorizedException('No puedes editar el perfil de otro usuario');
    }
    return this.profilesService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.remove(id);
  }
}
