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

  @ManyToOne(() => User, { eager: true })
  user?: User;

  @Column()
  userUuid?: User["uuid"];

  @ManyToOne(() => GameSession, { eager: true })
  gameSession: GameSession;

  @Column()
  gameSessionUuid: GameSession["uuid"];

  @Column({ type: 'int', nullable: true })
  points: number;

  @Column({ type: 'int', nullable: true })
  rank: number;

  @Column({ type: 'int', nullable: true })
  maxVirus: number; //current max of virus user can have

  @Column({ type: 'int', nullable: true })
  earlyExit: boolean; //user is not allowed to re-join, e.g. because of expulsion

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
