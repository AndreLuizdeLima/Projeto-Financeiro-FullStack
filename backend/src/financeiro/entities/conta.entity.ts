import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Cliente } from '@/cliente/entities/cliente.entity';
import { PlanoDeConta } from '@/plano-de-contas/entities/plano-de-conta.entity';
import { CentroDeCusto } from '@/centro-de-custo/entities/centro-de-custo.entity';
import { TipoConta, SituacaoConta } from '../financeiro.enums';

@Entity('contas')
@Check('"valorOriginal" > 0')
export class Conta {
  @PrimaryGeneratedColumn() id!: number;

  @Column({ type: 'enum', enum: TipoConta }) tipo!: TipoConta;

  @Column() descricao!: string;

  @Column({ type: 'numeric', precision: 19, scale: 2 }) valorOriginal!: string;

  @Column({ type: 'numeric', precision: 9, scale: 6, default: '0' })
  taxaJurosDiaria!: string;

  @Column({ type: 'numeric', precision: 9, scale: 6, default: '0' })
  taxaMulta!: string;

  @Column({ type: 'date' }) dataEmissao!: string;

  @Index() @Column({ type: 'date' }) dataVencimento!: string;

  @Column({ type: 'enum', enum: SituacaoConta, default: SituacaoConta.ABERTA })
  situacao!: SituacaoConta;

  @Column() clienteId!: number;

  @ManyToOne(() => Cliente, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clienteId' })
  cliente!: Cliente;

  @Column() planoDeContaId!: number;

  @ManyToOne(() => PlanoDeConta, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'planoDeContaId' })
  planoDeConta!: PlanoDeConta;

  @Column({ type: 'int', nullable: true }) centroDeCustoId!: number | null;

  @ManyToOne(() => CentroDeCusto, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'centroDeCustoId' })
  centroDeCusto!: CentroDeCusto | null;

  @Column() criadoPorId!: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'criadoPorId' })
  criadoPor!: User;

  @CreateDateColumn() criadoEm!: Date;

  @UpdateDateColumn() atualizadoEm!: Date;
}
