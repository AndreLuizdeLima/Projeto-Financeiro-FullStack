import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoPlanoConta } from '../dto/tipo-de-plano.enum';
import { NaturezaConta } from '../dto/natureza-da-conta';
import { User } from '@/users/entities/user.entity';
import { MAX_TAMANHO_CODIGO_PLANO_DE_CONTAS } from '../plano-de-contas.constants';

@Entity()
export class PlanoDeConta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: MAX_TAMANHO_CODIGO_PLANO_DE_CONTAS, unique: true })
  codigo!: string;

  @Column()
  nome!: string;

  @Column({
    type: 'enum',
    enum: TipoPlanoConta,
  })
  tipo!: TipoPlanoConta;

  @Column({
    type: 'enum',
    enum: NaturezaConta,
  })
  natureza!: NaturezaConta;

  @Column()
  isActive!: boolean;

  @ManyToOne(() => PlanoDeConta, (planodeConta) => planodeConta.filhos, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  contaPai?: PlanoDeConta | null;

  @OneToMany(() => PlanoDeConta, (planodeConta) => planodeConta.contaPai)
  filhos!: PlanoDeConta[];

  @ManyToOne(() => User, (user) => user.planosDeContaCriados, {
    nullable: false,
  })
  criadoPor!: User;
}
