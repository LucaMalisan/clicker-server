import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession } from '../model/gameSession.entity';
import { UserGameSession } from '../model/userGameSession.entity';

@Injectable()
export class GameSessionService {
  constructor(
    @InjectRepository(GameSession) private readonly gameSessionRepo: Repository<GameSession>,
    @InjectRepository(UserGameSession) private readonly userGameSessionRepo: Repository<UserGameSession>,
  ) {
  }

  async save(gameSession: GameSession): Promise<GameSession[]> {
    return this.gameSessionRepo.save([gameSession]);
  }

  async findOneByKey(key: string): Promise<GameSession | null> {
    return this.gameSessionRepo.findOne({
      where: {
        hexCode: key,
      },
    });
  }

  async findOneByUserUuid(uuid: string): Promise<UserGameSession | null> {
    return this.userGameSessionRepo
      .createQueryBuilder('userGameSession')
      .innerJoinAndSelect('userGameSession.gameSession', 'gs', 'gs.endedAt IS NULL')
      .where('userGameSession.userUuid = :uuid', { uuid: uuid })
      .getOne();
  }

  async assignUserToSession(userUuid: string, sessionUuid: string): Promise<UserGameSession | null> {
    return this.userGameSessionRepo.delete({
      userUuid: userUuid,
    })
      .then(() => {
        let userGameSession: UserGameSession = new UserGameSession();
        userGameSession.userUuid = userUuid;
        userGameSession.gameSessionUuid = sessionUuid;
        return this.userGameSessionRepo.save(userGameSession);
      })
      .then(userGameSession => this.userGameSessionRepo.findOne({ where: { uuid: userGameSession.uuid } }));
  }

  async findAssignedUsers(sessionUuid: string) {
    return this.userGameSessionRepo.find({
      where: {
        gameSessionUuid: sessionUuid,
      },
    });
  }
}
