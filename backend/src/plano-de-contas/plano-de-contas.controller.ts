import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Query,
  Req,
} from '@nestjs/common';
import { PlanoDeContasService } from './plano-de-contas.service';
import { CreatePlanoDeContaDto } from './dto/create-plano-de-conta.dto';
import { UpdatePlanoDeContaDto } from './dto/update-plano-de-conta.dto';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '@/auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('plano-de-contas')
export class PlanoDeContasController {
  constructor(private readonly planoDeContasService: PlanoDeContasService) {}

  @Post()
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPlanoDeContaDto: CreatePlanoDeContaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.planoDeContasService.create(
      createPlanoDeContaDto,
      request.user!.sub,
    );
  }

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    pagination: PaginationQueryDto,
  ) {
    return this.planoDeContasService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planoDeContasService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updatePlanoDeContaDto: UpdatePlanoDeContaDto,
  ) {
    return this.planoDeContasService.update(Number(id), updatePlanoDeContaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planoDeContasService.remove(Number(id));
  }
}
