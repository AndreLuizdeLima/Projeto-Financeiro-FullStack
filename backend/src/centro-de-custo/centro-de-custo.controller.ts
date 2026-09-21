import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CentroDeCustoService } from './centro-de-custo.service';
import { CreateCentroDeCustoDto } from './dto/create-centro-de-custo.dto';
import { UpdateCentroDeCustoDto } from './dto/update-centro-de-custo.dto';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '@/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('centro-de-custo')
export class CentroDeCustoController {
  constructor(private readonly centroDeCustoService: CentroDeCustoService) {}

  @Post()
  create(
    @Body() createCentroDeCustoDto: CreateCentroDeCustoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.centroDeCustoService.create(
      createCentroDeCustoDto,
      request.user!.sub,
    );
  }

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    pagination: PaginationQueryDto,
  ) {
    return this.centroDeCustoService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.centroDeCustoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCentroDeCustoDto: UpdateCentroDeCustoDto,
  ) {
    return this.centroDeCustoService.update(+id, updateCentroDeCustoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centroDeCustoService.remove(+id);
  }
}
