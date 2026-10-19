import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimentacoeDto } from './create-movimentacoe.dto';

export class UpdateMovimentacoeDto extends PartialType(CreateMovimentacoeDto) {}
