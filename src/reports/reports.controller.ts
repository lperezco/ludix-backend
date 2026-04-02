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
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('user/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.reportsService.findByUser(userId);
  }

  @Get('post/:postId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.reportsService.findByPost(postId);
  }

  @Get('status/:status')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findByStatus(@Param('status') status: string) {
    return this.reportsService.findByStatus(status);
  }

  @Get(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findById(id);
  }

  @Post()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Patch(':id/status')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.reportsService.updateStatus(id, status);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }

  @Delete('post/:postId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  removeByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.reportsService.removeByPost(postId);
  }
}