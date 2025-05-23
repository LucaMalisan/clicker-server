import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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

  async create(payload: any): Promise<GameSession> {
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

  async findOneByUuid(uuid: string): Promise<GameSession | null> {
    return this.gameSessionRepo.findOne({
      where: {
        uuid: uuid,
      },
    });
  }

  async findOneByUserUuidAndKey(uuid: string, sessionKey: string): Promise<UserGameSession | null> {
    return this.userGameSessionRepo
      .createQueryBuilder('userGameSession')
      .innerJoinAndSelect('userGameSession.gameSession', 'gs')
      .where('userGameSession.userUuid = :uuid AND gs.hexCode = :hexCode', { uuid: uuid, hexCode: sessionKey })
      .getOne();
  }

  async assignUserToSession(userUuid: string, sessionUuid: string): Promise<UserGameSession | null> {
    await this.userGameSessionRepo
      .createQueryBuilder()
      .update(UserGameSession)
      .set({ offline: true })
      .where('userUuid = :userUuid AND gameSessionUuid != :sessionUuid', {
        userUuid: userUuid,
        sessionUuid: sessionUuid,
      })
      .execute();

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
        offline: false,
      },
    });
  }

  async findBySessionUuid(uuid: string): Promise<UserGameSession[] | null> {
    return this.userGameSessionRepo.find({
      where: {
        gameSessionUuid: uuid,
        offline: false,
      },
    });
  }

  async findAnyButNotCurrentUser(userUuid: string, gameSessionUuid: string) {
    return this.userGameSessionRepo
      .createQueryBuilder()
      .select()
      .where('UserGameSession.gameSessionUuid = :gameSessionUuid AND UserGameSession.userUuid != :userUuid AND UserGameSession.offline = false', {
        gameSessionUuid: gameSessionUuid,
        userUuid: userUuid,
      })
      .getOne();
  }

  async setPlayerOffline(userUuid: string, offline: boolean, gameSessionUuid: string) {
    return this.userGameSessionRepo
      .update({ userUuid: userUuid, gameSessionUuid: gameSessionUuid }, { offline: offline });
  }
}
