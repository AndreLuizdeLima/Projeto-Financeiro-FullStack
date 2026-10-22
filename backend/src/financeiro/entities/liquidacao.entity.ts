import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { ContaBancaria } from '@/conta-bancaria/entities/conta-bancaria.entity';
import { FormasRecebimento } from '@/formas-recebimento/entities/formas-recebimento.entity';
import { Conta } from './conta.entity';

@Entity('liquidacoes')
@Index('liquidacao_ativa_unica', ['contaId'], {
  unique: true,
  where: '"estornadaEm" IS NULL',
})
export class Liquidacao {
  @PrimaryGeneratedColumn() id!: number;

  @Column() contaId!: number;

  @ManyToOne(() => Conta, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'contaId' })
  conta!: Conta;

  @Column({ type: 'date' }) dataPagamento!: string;

  @Column({ type: 'numeric', precision: 19, scale: 2 }) valorOriginal!: string;

  @Column({ type: 'numeric', precision: 9, scale: 6 }) taxaJurosDiaria!: string;

  @Column({ type: 'numeric', precision: 9, scale: 6 }) taxaMulta!: string;

  @Column() diasAtraso!: number;

  @Column({ type: 'numeric', precision: 19, scale: 2 }) juros!: string;

  @Column({ type: 'numeric', precision: 19, scale: 2 }) multa!: string;

  @Column({ type: 'numeric', precision: 19, scale: 2 }) valorTotal!: string;

  @Column() formaRecebimentoId!: number;

  @ManyToOne(() => FormasRecebimento, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'formaRecebimentoId' })
  formaRecebimento!: FormasRecebimento;

  @Column() contaBancariaId!: number;
  @ManyToOne(() => ContaBancaria, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'contaBancariaId' })
  contaBancaria!: ContaBancaria;

  @Column() criadoPorId!: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'criadoPorId' })
  criadoPor!: User;

  @Column({ type: 'timestamptz', nullable: true }) estornadaEm!: Date | null;

  @Column({ type: 'int', nullable: true }) estornadoPorId!: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'estornadoPorId' })
  estornadoPor!: User | null;

  @CreateDateColumn() criadoEm!: Date;
}
