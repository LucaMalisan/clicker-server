import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Effect } from './effect.entity';

/**
 * This entity represents an in-game effect of a specific type
 */

@Entity({ name: 'effect_detail' })
export class EffectDetail {

  @PrimaryColumn({ type: 'varchar' })
  uuid: string;

  @ManyToOne(() => Effect, { eager: true })
  effect: Effect;

  @Column()
  effectName: Effect["name"];

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  efficiency: number;

  @Column({ type: 'real', nullable: true })
  probability: number;
}
