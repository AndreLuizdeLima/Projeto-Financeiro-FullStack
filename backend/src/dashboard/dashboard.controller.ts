import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  cards(@Query() query: DashboardQueryDto) {
    return this.dashboardService.cardsDashboards(query.mes);
  }

  @Get('evolucao-saldo')
  evolucaoSaldo(@Query() query: DashboardQueryDto) {
    return this.dashboardService.evolucaoSaldo(query.mes);
  }
}
