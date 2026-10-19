import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Cliente } from '@/cliente/entities/cliente.entity';
import { ContaBancaria } from '@/conta-bancaria/entities/conta-bancaria.entity';
import { PlanoDeConta } from '@/plano-de-contas/entities/plano-de-conta.entity';
import { CentroDeCusto } from '@/centro-de-custo/entities/centro-de-custo.entity';
import { FormasRecebimento } from '@/formas-recebimento/entities/formas-recebimento.entity';
import { TipoMovimento, OrigemMovimento } from '../financeiro.enums';
import { Liquidacao } from './liquidacao.entity';

@Entity('movimentacoes')
@Check('"valor" > 0')
@Check(
  `("tipo" = 'ENTRADA' AND "contaOrigemId" IS NULL AND "contaDestinoId" IS NOT NULL) OR ("tipo" = 'SAIDA' AND "contaOrigemId" IS NOT NULL AND "contaDestinoId" IS NULL) OR ("tipo" = 'TRANSFERENCIA' AND "contaOrigemId" IS NOT NULL AND "contaDestinoId" IS NOT NULL AND "contaOrigemId" <> "contaDestinoId")`,
)
@Index('movimento_estorno_unico', ['estornoDeId'], { unique: true })
@Index('movimento_liquidacao_unico', ['liquidacaoId'], {
  unique: true,
  where: '"estornoDeId" IS NULL',
})
export class Movimento {
  @PrimaryGeneratedColumn() id!: number;

  @Column({ type: 'enum', enum: TipoMovimento }) tipo!: TipoMovimento;

  @Column({ type: 'enum', enum: OrigemMovimento }) origem!: OrigemMovimento;

  @Column() descricao!: string;

  @Column({ type: 'numeric', precision: 19, scale: 2 }) valor!: string;

  @Index() @Column({ type: 'date' }) data!: string;

  @Column({ type: 'int', nullable: true }) contaOrigemId!: number | null;

  @ManyToOne(() => ContaBancaria, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'contaOrigemId' })
  contaOrigem!: ContaBancaria | null;

  @Column({ type: 'int', nullable: true }) contaDestinoId!: number | null;

  @ManyToOne(() => ContaBancaria, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'contaDestinoId' })
  contaDestino!: ContaBancaria | null;

  @Column({ type: 'int', nullable: true }) liquidacaoId!: number | null;

  @ManyToOne(() => Liquidacao, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'liquidacaoId' })
  liquidacao!: Liquidacao | null;

  @Column({ type: 'int', nullable: true }) clienteId!: number | null;

  @ManyToOne(() => Cliente, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clienteId' })
  cliente!: Cliente | null;

  @Column({ type: 'int', nullable: true }) planoDeContaId!: number | null;

  @ManyToOne(() => PlanoDeConta, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'planoDeContaId' })
  planoDeConta!: PlanoDeConta | null;

  @Column({ type: 'int', nullable: true }) centroDeCustoId!: number | null;

  @ManyToOne(() => CentroDeCusto, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'centroDeCustoId' })
  centroDeCusto!: CentroDeCusto | null;

  @Column({ type: 'int', nullable: true }) formaRecebimentoId!: number | null;

  @ManyToOne(() => FormasRecebimento, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'formaRecebimentoId' })
  formaRecebimento!: FormasRecebimento | null;

  @Column({ type: 'int', nullable: true }) estornoDeId!: number | null;

  @ManyToOne(() => Movimento, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'estornoDeId' })
  estornoDe!: Movimento | null;

  @Column() criadoPorId!: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'criadoPorId' })
  criadoPor!: User;

  @CreateDateColumn() criadoEm!: Date;
}
