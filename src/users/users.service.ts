import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';

/**
 * This service provides DB queries for handling users
 */

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {
  }

  async findOne(username: string): Promise<User | null> {
    return this.repo.findOne({
      where: {
        userName: username,
      },
    });
  }

  async findByUuid(uuid: string): Promise<User | null> {
    return this.repo.findOne({
      where: {
        uuid: uuid,
      },
    });
  }

  async create(payload: any) {
    let result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(payload)
      .returning('*')
      .execute();

    return result.raw[0];
  }
}
