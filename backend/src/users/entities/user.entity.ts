import { CentroDeCusto } from '@/centro-de-custo/entities/centro-de-custo.entity';
import { Cliente } from '@/cliente/entities/cliente.entity';
import { ContaBancaria } from '@/conta-bancaria/entities/conta-bancaria.entity';
import { FormasRecebimento } from '@/formas-recebimento/entities/formas-recebimento.entity';
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

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createDate!: Date;

  @UpdateDateColumn()
  updateDate?: Date;

  @OneToMany(() => Cliente, (cliente) => cliente.criadoPor)
  clientesCriados!: Cliente[];

  @OneToMany(
    () => FormasRecebimento,
    (formasRecebimento) => formasRecebimento.criadoPor,
  )
  formasRecebimentosCriados!: FormasRecebimento[];

  @OneToMany(() => CentroDeCusto, (centrodecusto) => centrodecusto.criadoPor)
  centroDeCustosCriados!: CentroDeCusto[];

  @OneToMany(() => ContaBancaria, (contabancaria) => contabancaria.criadoPor)
  contasBancariasCriados!: CentroDeCusto[];
}
