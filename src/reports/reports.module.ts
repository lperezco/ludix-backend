import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Post, User]), // 👈 Agregamos Post y User
  ],
  controllers: [ReportsController],  // 👈 Agregamos el controller
  providers: [ReportsService],       // 👈 Agregamos el service
  exports: [ReportsService],         // 👈 Exportamos por si otros módulos lo necesitan
})
export class ReportsModule {}