import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@/users/entities/user.entity';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nomeFantasia!: string;

  @Column({ length: 100 })
  razaoSocial!: string;

  @Column()
  cnpj!: string;

  @Column()
  isActive!: boolean;

  @ManyToOne(() => User, (user) => user.clientesCriados, {
    nullable: false,
  })
  criadoPor!: User;
}
