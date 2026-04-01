import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { UserTypesModule } from './user-types/user-types.module';
import { CreativeAreasModule } from './creative-areas/creative-areas.module';
import { AchievementsModule } from './achievements/achievements.module';
import { UserAchievementsModule } from './user-achievements/user-achievements.module';
import { ExercisesModule } from './exercises/exercises.module';
import { ExerciseTypesModule } from './exercise-types/exercise-types.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ExerciseHistoryModule } from './exercise-history/exercise-history.module';
import { ChallengesModule } from './challenges/challenges.module';
import { PostsModule } from './posts/posts.module';
import { ReportsModule } from './reports/reports.module';
import { BlockedUsersModule } from './blocked-users/blocked-users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    UsersModule,
    ProfilesModule,
    UserTypesModule,
    CreativeAreasModule,
    AchievementsModule,
    UserAchievementsModule,
    ExercisesModule,
    ExerciseTypesModule,
    FavoritesModule,
    ExerciseHistoryModule,
    ChallengesModule,
    PostsModule,
    ReportsModule,
    BlockedUsersModule,
    AuthModule,
  ],
})
export class AppModule {}
