import { Matches } from 'class-validator';

export class DashboardQueryDto {
  @Matches(/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mes deve estar no formato YYYY-MM, com ano entre 0001 e 9999.',
  })
  mes!: string;
}
