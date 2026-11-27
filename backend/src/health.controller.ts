import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly database: DataSource) {}

  @Get()
  async verificar() {
    await this.database.query('SELECT 1');
    return { status: 'ok' };
  }
}
