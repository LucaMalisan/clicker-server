import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', unique: true})
  userName: string;

  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
