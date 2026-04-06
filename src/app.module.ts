import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';

// Módulos de la aplicación
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolModule } from './rol/rol.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolPermissionsModule } from './rol-permissions/rol-permissions.module';
import { CommentsModule } from './comments/comments.module';
import { AchievementsModule } from './achievements/achievements.module';
import { BlockedUsersModule } from './blocked-users/blocked-users.module';
import { CreativeAreasModule } from './creative-areas/creative-areas.module';
import { ExerciseHistoryModule } from './exercise-history/exercise-history.module';
import { ExerciseTypesModule } from './exercise-types/exercise-type.module';
import { ExercisesModule } from './exercises/exercises.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ReportsModule } from './reports/reports.module';
import { UserAchievementsModule } from './user-achievements/user-achievements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        if (databaseUrl) {
          console.log('✅ Conectando a Railway con DATABASE_URL');
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: ['dist/**/*.entity.js'],
            synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
            logging: configService.get('DB_LOGGING') === 'true',
            ssl: { rejectUnauthorized: false },
          };
        }
        console.log('📦 Usando configuración local para desarrollo');
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5433),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_DATABASE', 'ludix'),
          entities: ['dist/**/*.entity.js'],
          synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
          logging: configService.get('DB_LOGGING') === 'true',
        };
      },
    }),
    AuthModule,
    UsersModule,
    RolModule,
    PermissionsModule,
    RolPermissionsModule,
    CommentsModule,
    AchievementsModule,
    BlockedUsersModule,
    CreativeAreasModule,
    ExerciseHistoryModule,
    ExerciseTypesModule,
    ExercisesModule,
    FavoritesModule,
    ProfilesModule,
    ReportsModule,
    UserAchievementsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
