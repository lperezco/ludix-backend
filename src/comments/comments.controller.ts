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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @Permissions('manage_comments')   // antes 'read_comment'
  @ApiOperation({ summary: 'Obtener todos los comentarios' })
  findAll() {
    return this.commentsService.findAll();
  }

  @Get('exercise/:exerciseId')
  @Permissions('manage_comments')   // antes 'read_comment'
  @ApiOperation({ summary: 'Obtener comentarios por ejercicio' })
  findByExercise(@Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.commentsService.findByExercise(exerciseId);
  }

  @Get('user/:userId')
  @Permissions('manage_comments')   // antes 'read_comment'
  @ApiOperation({ summary: 'Obtener comentarios por usuario' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.commentsService.findByUser(userId);
  }

  @Get(':id')
  @Permissions('manage_comments')   // antes 'read_comment'
  @ApiOperation({ summary: 'Obtener comentario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findById(id);
  }

  @Post()
  @Permissions('create_comment')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear comentario' })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Put(':id')
  @Permissions('manage_comments')   // antes 'update_comment'
  @ApiOperation({ summary: 'Actualizar comentario' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @Permissions('delete_comment')
  @ApiOperation({ summary: 'Eliminar comentario' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.remove(id);
  }
}
