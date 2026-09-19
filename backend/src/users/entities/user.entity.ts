export class User {
  id!: number;

  nome!: string;

  email!: string;

  passwordHash!: string;

  createDate!: Date;

  updateDate?: Date;
}
