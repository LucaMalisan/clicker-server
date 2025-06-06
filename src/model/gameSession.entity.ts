import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Variables } from '../static/variables';
import { IsIn } from "class-validator";

/**
 * Represents a single game session
 */

@Entity({ name: 'game_session' })
export class GameSession {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar' })
  hexCode: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @Column({ name: 'created_by' })
  createdByUuid?: User["uuid"];

  @Column({ name: 'evaluation_method' })
  @IsIn(Variables.getEvaluationMethods(), {
    message: `Evaluation method must be one of: ${Variables.getEvaluationMethods().join(", ")}`,
  })
  evaluationMethod?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
