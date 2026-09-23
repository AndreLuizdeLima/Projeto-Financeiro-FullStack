import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ContaBancariaService } from './conta-bancaria.service';
import { CreateContaBancariaDto } from './dto/create-conta-bancaria.dto';
import { UpdateContaBancariaDto } from './dto/update-conta-bancaria.dto';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '@/auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('conta-bancaria')
export class ContaBancariaController {
  constructor(private readonly contaBancariaService: ContaBancariaService) {}

  @Post()
  create(
    @Body() createContaBancariaDto: CreateContaBancariaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.contaBancariaService.create(
      createContaBancariaDto,
      request.user!.sub,
    );
  }

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    pagination: PaginationQueryDto,
  ) {
    return this.contaBancariaService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contaBancariaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContaBancariaDto: UpdateContaBancariaDto,
  ) {
    return this.contaBancariaService.update(+id, updateContaBancariaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contaBancariaService.remove(+id);
  }
}
