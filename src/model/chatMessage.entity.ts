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

@Entity({ name: 'chat_message' })
export class ChatMessage {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'text'})
  content: string;

  @ManyToOne(() => User, user => user.uuid)
  @JoinColumn({ name: 'written_by' })
  writtenBy: User;

  @ManyToOne(() => GameSession, gameSession => gameSession.uuid)
  @JoinColumn({ name: 'game_session' })
  gameSession: GameSession;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
