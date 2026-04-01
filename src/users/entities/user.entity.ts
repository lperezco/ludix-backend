import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserType } from '../../user-types/entities/user-type.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { UserAchievement } from '../../user-achievements/entities/user-achievement.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { ExerciseHistory } from '../../exercise-history/entities/exercise-history.entity';
import { Report } from '../../reports/entities/report.entity';
import { BlockedUser } from '../../blocked-users/entities/blocked-user.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @ManyToOne(() => UserType, (userType) => userType.users)
  @JoinColumn({ name: 'userTypeId' })
  userType: UserType;

  @Column()
  userTypeId: number;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => UserAchievement, (ua) => ua.user)
  userAchievements: UserAchievement[];

  @OneToMany(() => Favorite, (fav) => fav.user)
  favorites: Favorite[];

  @OneToMany(() => ExerciseHistory, (eh) => eh.user)
  exerciseHistories: ExerciseHistory[];

  @OneToMany(() => Report, (report) => report.reportedByUser)
  reportsMade: Report[];

  @OneToMany(() => BlockedUser, (blocked) => blocked.user)
  blockedRecords: BlockedUser[];

  @OneToMany(() => BlockedUser, (blocked) => blocked.blockedByUser)
  blockedByRecords: BlockedUser[];
}
