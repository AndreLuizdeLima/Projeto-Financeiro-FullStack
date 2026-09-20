import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteDto } from './create-cliente.dto';
import { IsBoolean } from 'class-validator';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
  @IsBoolean()
  isActive!: boolean;
}
