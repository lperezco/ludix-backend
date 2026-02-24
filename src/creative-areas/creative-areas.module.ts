import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreativeArea } from './entities/creative-area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreativeArea])],
  controllers: [],
  providers: [],
})
export class CreativeAreasModule {}