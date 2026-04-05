import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolPermission } from './entities/rol-permission.entity';
import { RolPermissionsService } from './rol-permissions.service';
import { RolPermissionsController } from './rol-permissions.controller';
import { RolModule } from '../rol/rol.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolPermission]),
    RolModule,
    PermissionsModule,
  ],
  controllers: [RolPermissionsController],
  providers: [RolPermissionsService],
  exports: [RolPermissionsService],
})
export class RolPermissionsModule {}
