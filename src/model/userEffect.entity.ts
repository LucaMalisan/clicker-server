import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn, PrimaryGeneratedColumn, Index, Unique,
} from 'typeorm';
import { User } from './user.entity';
import { GameSession } from './gameSession.entity';
import { UserGameSession } from './userGameSession.entity';
import { Effect } from './effect.entity';

/**
 * This table contains the currently activated effects of a user in a current game session
 * They can be positive (power-up) or negative (debuff received by another player)
 * This table gets cleared after the end of a game session
 * A log of all actions is in table "userAction"
 */

@Entity({ name: 'user_effect' })
@Unique(['effectName', 'userUuid'])
export class UserEffect {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => Effect, { eager: true })
  effect: Effect;

  @Column()
  effectName: Effect["name"];

  @ManyToOne(() => User, { eager: true })
  user?: User;

  @Column()
  userUuid: User["uuid"];

  @Column({ type: 'int' })
  currentLevel: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
