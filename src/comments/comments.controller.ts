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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @Permissions('read_comment')
  findAll() {
    return this.commentsService.findAll();
  }

  @Get('exercise/:exerciseId')
  @Permissions('read_comment')
  findByExercise(@Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.commentsService.findByExercise(exerciseId);
  }

  @Get('user/:userId')
  @Permissions('read_comment')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.commentsService.findByUser(userId);
  }

  @Get(':id')
  @Permissions('read_comment')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findById(id);
  }

  @Post()
  @Permissions('create_comment')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Put(':id')
  @Permissions('update_comment')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @Permissions('delete_comment')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.remove(id);
  }
}
