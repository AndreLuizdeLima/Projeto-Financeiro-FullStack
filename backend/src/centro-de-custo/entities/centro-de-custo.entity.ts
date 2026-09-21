import { User } from '@/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CentroDeCusto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  isActive!: boolean;

  @ManyToOne(() => User, (user) => user.centroDeCustosCriados, {
    nullable: false,
  })
  criadoPor!: User;
}
