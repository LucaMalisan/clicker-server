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
 * This entity is used to map users and game sessions
 */

@Entity({ name: 'user_game_session' })
export class UserGameSession {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { eager: true })
  user?: User;

  @Column()
  userUuid?: User['uuid'];

  @ManyToOne(() => GameSession, { eager: true })
  gameSession: GameSession;

  @Column()
  gameSessionUuid: GameSession['uuid'];

  @Column({ type: 'int', nullable: false, default: 0 })
  points: number;

  @Column({ type: 'int', nullable: true })
  maxVirus: number; //current max of virus user can have

  @Column({ type: 'boolean', nullable: false, default: false })
  offline: boolean;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
