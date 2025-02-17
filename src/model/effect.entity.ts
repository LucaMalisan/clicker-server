import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { GameSession } from './gameSession.entity';

/**
 * This entity represents an in-game effect of a specific type
 */

@Entity({ name: 'effect' })
export class Effect {

  @PrimaryColumn({ type: 'varchar'})
  name: string; // TODO: I think association between name and functionality is determined on client side?

  @Column({ type: 'int'})
  duration: number; //0 = persistent, >0 = seconds active

  @Column({ type: 'int'})
  maxLevel: number;

  @Column({ type: 'real'})
  startEfficiency: number; //can be virus amount, probability etc.

  @Column({ type: 'real'})
  startPrice: number; //per level

  @Column({ type: 'real'})
  efficiencyIncrease: number; //per level

  @Column({ type: 'real'})
  priceIncrease: number; //per level

  @Column({ type: 'varchar'})
  pathToIcon: string; //for icon image

  @Column({ type: 'varchar'})
  activationRoute: string; //which URL should be called to activate effect
}
