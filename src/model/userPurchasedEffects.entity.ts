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
 * This table contains the purchae history of a user and helps to determine which effects can be purchased next
 * This table gets cleared after the end of a game session
 */

@Entity({ name: 'user_purchased_effects' })
@Unique(['effectName', 'userUuid'])
export class UserPurchasedEffects {

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
