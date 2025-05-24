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
import { GameSession } from './gameSession.entity';
import { Effect } from './effect.entity';

/**
 * Represents a chat message
 */

@Entity({ name: 'chat_message' })
export class ChatMessage {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'text'})
  content: string;

  @ManyToOne(() => User, { eager: true })
  writtenBy?: User;

  @Column()
  writtenByUuid: User["uuid"];

  @ManyToOne(() => GameSession)
  gameSession: GameSession;

  @Column()
  gameSessionUuid: GameSession["uuid"];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
