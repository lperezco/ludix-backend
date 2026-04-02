import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Profile } from '../profiles/entities/profile.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { Report } from '../reports/entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Profile, Challenge, Report]), // 👈 Agregamos todas las entidades necesarias
  ],
  controllers: [PostsController],  
  providers: [PostsService],       
  exports: [PostsService],         
})
export class PostsModule {}