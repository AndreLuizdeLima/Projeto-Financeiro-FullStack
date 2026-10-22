import { registerDecorator } from 'class-validator';

export function DataFinanceira() {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'dataFinanceira',
      target: target.constructor,
      propertyName,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            Number.isFinite(Date.parse(value)) &&
            new Date(value).toISOString().slice(0, 10) === value
          );
        },
        defaultMessage: () => 'Data deve ser válida no formato YYYY-MM-DD.',
      },
    });
}
