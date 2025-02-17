import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn, PrimaryGeneratedColumn,
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
export class UserEffect {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => UserGameSession, userGameSession => userGameSession.uuid)
  @JoinColumn({ name: 'game_session' })
  userGameSession: UserGameSession;

  @ManyToOne(() => Effect, effect => effect.name)
  @JoinColumn({ name: 'effect' })
  effect: Effect;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
