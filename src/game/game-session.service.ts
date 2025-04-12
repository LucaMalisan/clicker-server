import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { GameSession } from '../model/gameSession.entity';
import { UserGameSession } from '../model/userGameSession.entity';

//TODO set earlyExit and filter after it

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

  async create(payload) {
    let result = await this.gameSessionRepo
      .createQueryBuilder()
      .insert()
      .into(GameSession)
      .values(payload)
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async findActive(): Promise<GameSession[] | null> {
    return this.gameSessionRepo.find({
      where: {
        endedAt: IsNull(),
      },
    });
  }

  async updatePoints(userUuid: string, pointsToAdd: number) {
    await this.userGameSessionRepo
      .createQueryBuilder()
      .update(UserGameSession)
      .set({ points: () => `points + ${pointsToAdd}` })
      .where('userUuid = :userUuid', { userUuid: userUuid })
      .execute();
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
    let result = await this.userGameSessionRepo
      .createQueryBuilder()
      .insert()
      .into(UserGameSession)
      .values({
        userUuid: userUuid,
        gameSessionUuid: sessionUuid,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async findAssignedUsers(sessionUuid: string) {
    return this.userGameSessionRepo.find({
      where: {
        gameSessionUuid: sessionUuid,
      },
    });
  }

  async findBySessionUuid(uuid: string): Promise<UserGameSession[] | null> {
    return this.userGameSessionRepo.find({
      where: {
        gameSessionUuid: uuid,
      },
    });
  }
}
