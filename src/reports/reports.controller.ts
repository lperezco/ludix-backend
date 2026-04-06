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
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Permissions('manage_reports')
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('user/:userId')
  @Permissions('manage_reports')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.reportsService.findByUser(userId);
  }

  @Get('comment/:commentId')
  @Permissions('manage_reports')
  findByComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.reportsService.findByComment(commentId);
  }

  @Get('status/:status')
  @Permissions('manage_reports')
  findByStatus(@Param('status') status: string) {
    return this.reportsService.findByStatus(status);
  }

  @Get(':id')
  @Permissions('manage_reports')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findById(id);
  }

  @Post()
  @Permissions('manage_reports')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateReportDto) {
    return this.reportsService.create(createDto);
  }

  @Patch(':id/status')
  @Permissions('manage_reports')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.reportsService.updateStatus(id, status);
  }

  @Put(':id')
  @Permissions('manage_reports')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('manage_reports')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }

  @Delete('comment/:commentId')
  @Permissions('manage_reports')
  removeByComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.reportsService.removeByComment(commentId);
  }
}
