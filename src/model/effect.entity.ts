import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * This entity represents an in-game effect of a specific type
 */

@Entity({ name: 'effect' })
export class Effect {

  @PrimaryColumn({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'int' })
  duration: number; //0 = persistent, >0 = seconds active

  @Column({ type: 'int' })
  maxLevel: number;

  @Column({ type: 'varchar' })
  googleIcon: string; //for icon image

  @Column({ type: 'varchar' })
  activationRoute: string; //which URL should be called to activate effect
}
