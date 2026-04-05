import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreativeArea } from './entities/creative-area.entity';
import { CreativeAreasService } from './creative-areas.service';
import { CreativeAreasController } from './creative-areas.controller';
import { Profile } from '../profiles/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreativeArea, Profile])],
  controllers: [CreativeAreasController],
  providers: [CreativeAreasService],
  exports: [CreativeAreasService],
})
export class CreativeAreasModule {}
