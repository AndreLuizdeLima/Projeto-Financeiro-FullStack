import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '@/auth/guards/jwt-auth.guard';
import { ContasService } from '@/financeiro/contas.service';
import { LiquidacoesService } from '@/financeiro/liquidacoes.service';
import { CreateContaDto } from '@/financeiro/dto/create-conta.dto';
import { FiltroFinanceiroDto } from '@/financeiro/dto/filtro-financeiro.dto';
import { LiquidarContaDto } from '@/financeiro/dto/liquidar-conta.dto';
import { UpdateContaDto } from '@/financeiro/dto/update-conta.dto';
@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
@Controller('contas')
export class ContasController {
  constructor(
    private readonly service: ContasService,
    private readonly liquidacoes: LiquidacoesService,
  ) {}

  @Post() criar(@Body() dto: CreateContaDto, @Req() r: AuthenticatedRequest) {
    return this.service.criarConta(dto, r.user!.sub);
  }

  @Get() listar(@Query() dto: FiltroFinanceiroDto) {
    return this.service.listarContas(dto);
  }

  @Get('resumo') resumo(@Query() dto: FiltroFinanceiroDto) {
    return this.service.resumoContas(dto);
  }

  @Get(':id') obter(@Param('id', ParseIntPipe) id: number) {
    return this.service.obterConta(id);
  }

  @Patch(':id') editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContaDto,
  ) {
    return this.service.editarConta(id, dto);
  }

  @Delete(':id') excluir(@Param('id', ParseIntPipe) id: number) {
    return this.service.excluirConta(id);
  }

  @Post(':id/cancelar') cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancelarConta(id);
  }

  @Post(':id/liquidar') liquidar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LiquidarContaDto,
    @Req() r: AuthenticatedRequest,
  ) {
    return this.liquidacoes.liquidar(id, dto, r.user!.sub);
  }

  @Post(':id/estornar') estornar(
    @Param('id', ParseIntPipe) id: number,
    @Req() r: AuthenticatedRequest,
  ) {
    return this.liquidacoes.estornarConta(id, r.user!.sub);
  }
}
