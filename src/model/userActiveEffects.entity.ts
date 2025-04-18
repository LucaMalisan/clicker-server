import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Effect } from './effect.entity';
import { User } from './user.entity';

/**
 * This table contains all currently active effects of a user
 * This table gets cleared after the end of a game session
 */

@Entity({ name: 'user_active_effects' })
export class UserActiveEffects {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => Effect, { eager: true })
  effect: Effect;

  @Column()
  effectName: Effect["name"];

  @ManyToOne(() => User, { eager: true })
  activatedBy?: User;

  @Column()
  activatedByUuid: User["uuid"];

  @ManyToOne(() => User, { eager: true })
  influencedUser?: User;

  @Column()
  influencedUserUuid: User["uuid"];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}