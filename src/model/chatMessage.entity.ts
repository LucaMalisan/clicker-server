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

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'written_by' })
  writtenBy?: User;

  @Column({ name: 'written_by'})
  writtenByUuid?: User["uuid"];

  @ManyToOne(() => GameSession)
  gameSession: GameSession;

  @Column()
  gameSessionUuid: GameSession["uuid"];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
