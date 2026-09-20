import { User } from '@/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FormasRecebimento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  isActive!: boolean;

  @ManyToOne(() => User, (user) => user.formasRecebimentosCriados, {
    nullable: false,
  })
  criadoPor!: User;
}
