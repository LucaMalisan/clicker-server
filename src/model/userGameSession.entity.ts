import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { GameSession } from './gameSession.entity';

/**
 * This entity is used to protocol which user participated in which game session
 * which place was reached
 */

@Entity({ name: 'user_game_session' })
export class UserGameSession {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, user => user.uuid, { eager: true })
  @JoinColumn({ name: 'user' })
  user?: User;

  @Column({ name: 'user' })
  userUuid?: string;

  @ManyToOne(() => GameSession, gameSession => gameSession.uuid, { eager: true })
  @JoinColumn({ name: 'game_session' })
  gameSession: GameSession;

  @Column({ name: 'game_session' })
  gameSessionUuid: string;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'int' })
  maxVirus: number; //current max of virus user can have

  @Column({ type: 'int' })
  earlyExit: boolean; //user is not allowed to re-join, e.g. because of expulsion

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
