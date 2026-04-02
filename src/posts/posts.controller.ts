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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.postsService.findAll();
  }

  @Get('profile/:profileId')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findByProfile(@Param('profileId', ParseIntPipe) profileId: number) {
    return this.postsService.findByProfile(profileId);
  }

  @Get('challenge/:challengeId')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findByChallenge(@Param('challengeId', ParseIntPipe) challengeId: number) {
    return this.postsService.findByChallenge(challengeId);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findById(id);
  }

  @Post()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  @Delete('profile/:profileId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  removeByProfile(@Param('profileId', ParseIntPipe) profileId: number) {
    return this.postsService.removeByProfile(profileId);
  }
}