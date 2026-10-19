export enum TipoConta {
  PAGAR = 'PAGAR',
  RECEBER = 'RECEBER',
}
export enum SituacaoConta {
  ABERTA = 'ABERTA',
  LIQUIDADA = 'LIQUIDADA',
  CANCELADA = 'CANCELADA',
}
export enum TipoMovimento {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  TRANSFERENCIA = 'TRANSFERENCIA',
}
export enum OrigemMovimento {
  AVULSA = 'AVULSA',
  SALDO_INICIAL = 'SALDO_INICIAL',
  LIQUIDACAO = 'LIQUIDACAO',
  ESTORNO = 'ESTORNO',
}
