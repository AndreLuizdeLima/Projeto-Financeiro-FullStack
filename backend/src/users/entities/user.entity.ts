import { Cliente } from '@/cliente/entities/cliente.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nome!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ length: 255 })
  passwordHash!: string;

  @CreateDateColumn()
  createDate!: Date;

  @UpdateDateColumn()
  updateDate?: Date;

  @OneToMany(() => Cliente, (cliente) => cliente.criadoPor)
  clientesCriados!: Cliente[];
}
