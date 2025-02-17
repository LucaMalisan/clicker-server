import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';

/**
 * Represents a single game session that was held
 */

@Entity({ name: 'game_session' })
export class GameSession {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'int'})
  duration: number;

  @Column({ type: 'timestamptz'})
  startedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
