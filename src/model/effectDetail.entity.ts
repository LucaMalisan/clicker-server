import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Effect } from './effect.entity';

/**
 * This entity contains level-specific information for an effect
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
