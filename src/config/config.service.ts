import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import 'dotenv/config';

class ConfigService {
  constructor(private readonly env: { [k: string]: string | undefined }) {
  }

  //helper methods
  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];

    if (!value) {
      if (throwOnMissing) {
        throw new Error(`config error - missing env.${key}`);
      } else {
        return '';
      }
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  //creates a JSON with the database configurations read from .env file
  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),

      synchronize: true,

      entities: [__dirname + '/../**/*.entity.{js,ts}'],

      ssl: this.isProduction(),
    };
  }
}

// assure that all relevant fields for database are set
const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { configService };
