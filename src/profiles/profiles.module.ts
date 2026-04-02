import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { User } from '../users/entities/user.entity';
import { CreativeArea } from '../creative-areas/entities/creative-area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User, CreativeArea])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}