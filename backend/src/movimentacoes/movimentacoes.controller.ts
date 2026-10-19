import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { MovimentacoesService } from '@/financeiro/movimentacoes.service';
import { SaldosService } from '@/financeiro/saldos.service';
import { CreateMovimentoDto } from '@/financeiro/dto/create-movimento.dto';
import { FiltroFinanceiroDto } from '@/financeiro/dto/filtro-financeiro.dto';
@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(
    private readonly service: MovimentacoesService,
    private readonly saldosService: SaldosService,
  ) {}

  @Post() criar(
    @Body() dto: CreateMovimentoDto,
    @Req() r: AuthenticatedRequest,
  ) {
    return this.service.criarMovimento(dto, r.user!.sub);
  }

  @Get() listar(@Query() dto: FiltroFinanceiroDto) {
    return this.service.listarMovimentos(dto);
  }

  @Get('saldos') saldos(@Query() dto: FiltroFinanceiroDto) {
    return this.saldosService.saldos(dto);
  }

  @Get('resumo') resumo(@Query() dto: FiltroFinanceiroDto) {
    return this.service.resumoMovimentos(dto);
  }

  @Get(':id') obter(@Param('id', ParseIntPipe) id: number) {
    return this.service.obterMovimento(id);
  }

  @Post(':id/estornar') estornar(
    @Param('id', ParseIntPipe) id: number,
    @Req() r: AuthenticatedRequest,
  ) {
    return this.service.estornarMovimento(id, r.user!.sub);
  }
}
