import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGameSession } from '../model/userGameSession.entity';

@Injectable()
export class UserGameSessionService {
  constructor(
    @InjectRepository(UserGameSession) private readonly repo: Repository<UserGameSession>,
  ) {
  }

  async findOneByUserUuid(uuid: string): Promise<UserGameSession | null> {
    return this.repo.findOne({
      where: {
        userUuid: uuid
      }
    });
  }
}
