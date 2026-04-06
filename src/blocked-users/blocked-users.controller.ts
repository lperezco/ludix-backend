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
  Query,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { BlockedUsersService } from './blocked-users.service';
import { CreateBlockedUserDto } from './dto/create-blocked-user.dto';
import { UpdateBlockedUserDto } from './dto/update-blocked-user.dto';

@Controller('blocked-users')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class BlockedUsersController {
  constructor(private readonly blockedUsersService: BlockedUsersService) {}

  @Get()
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
    @Query('userId') userId?: string,
    @Query('blockedBy') blockedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.blockedUsersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      isActive ? isActive === 'true' : undefined,
      userId ? parseInt(userId) : undefined,
      blockedBy ? parseInt(blockedBy) : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('stats')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.blockedUsersService.getStats();
  }

  @Get('user/:userId')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blockedUsersService.findByUser(
      userId,
      isActive ? isActive === 'true' : undefined,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('blocker/:blockerId')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async findByBlocker(
    @Param('blockerId', ParseIntPipe) blockerId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blockedUsersService.findByBlocker(
      blockerId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('check/:userId')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async isUserBlocked(@Param('userId', ParseIntPipe) userId: number) {
    const isBlocked = await this.blockedUsersService.isUserBlocked(userId);
    return {
      userId,
      isBlocked,
      message: isBlocked
        ? 'El usuario está bloqueado'
        : 'El usuario no está bloqueado',
    };
  }

  @Get('active/:userId')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async getActiveBlock(@Param('userId', ParseIntPipe) userId: number) {
    return this.blockedUsersService.getActiveBlock(userId);
  }

  @Get('expired')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async getExpiredBlocks(@Query('days') days?: string) {
    return this.blockedUsersService.getExpiredBlocks(
      days ? parseInt(days) : 30,
    );
  }

  @Get(':id')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blockedUsersService.findById(id);
  }

  @Post()
  @Permissions('block_user')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBlockedUserDto: CreateBlockedUserDto) {
    return this.blockedUsersService.create(createBlockedUserDto);
  }

  @Patch('unblock/:userId')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async unblock(@Param('userId', ParseIntPipe) userId: number) {
    return this.blockedUsersService.unblock(userId);
  }

  @Patch('expire-old')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async expireOldBlocks(@Query('days') days?: string) {
    return this.blockedUsersService.expireOldBlocks(days ? parseInt(days) : 30);
  }

  @Put(':id')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlockedUserDto: UpdateBlockedUserDto,
  ) {
    return this.blockedUsersService.update(id, updateBlockedUserDto);
  }

  @Delete(':id')
  @Permissions('block_user')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.blockedUsersService.remove(id);
  }
}
