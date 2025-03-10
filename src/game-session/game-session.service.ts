import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession } from '../model/gameSession.entity';

@Injectable()
export class GameSessionService {
  constructor(
    @InjectRepository(GameSession) private readonly repo: Repository<GameSession>,
  ) {
  }

  async save(gameSession: GameSession): Promise<GameSession[]> {
    return this.repo.save([gameSession]);
  }
}
