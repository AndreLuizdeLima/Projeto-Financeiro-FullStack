import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { FormasRecebimentoService } from './formas-recebimento.service';
import { CreateFormasRecebimentoDto } from './dto/create-formas-recebimento.dto';
import { UpdateFormasRecebimentoDto } from './dto/update-formas-recebimento.dto';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '@/auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('formas-recebimento')
export class FormasRecebimentoController {
  constructor(
    private readonly formasRecebimentoService: FormasRecebimentoService,
  ) {}

  @Post()
  create(
    @Body() createFormasRecebimentoDto: CreateFormasRecebimentoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.formasRecebimentoService.create(
      createFormasRecebimentoDto,
      request.user!.sub,
    );
  }

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    pagination: PaginationQueryDto,
  ) {
    return this.formasRecebimentoService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formasRecebimentoService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormasRecebimentoDto: UpdateFormasRecebimentoDto,
  ) {
    return this.formasRecebimentoService.update(
      Number(id),
      updateFormasRecebimentoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formasRecebimentoService.remove(Number(id));
  }
}
