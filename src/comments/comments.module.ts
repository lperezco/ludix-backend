import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Exercise])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
