import { User } from '@/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TipoDeContaBancaria } from '../dto/tipo-de-conta.enum';

@Entity()
export class ContaBancaria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  conta!: string;

  @Column()
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: TipoDeContaBancaria,
  })
  tipo!: TipoDeContaBancaria;

  @ManyToOne(() => User, (user) => user.contasBancariasCriados, {
    nullable: false,
  })
  criadoPor!: User;
}
