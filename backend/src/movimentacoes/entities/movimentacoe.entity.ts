import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Movimentacoe {
  @PrimaryGeneratedColumn()
  id!: number;
}
