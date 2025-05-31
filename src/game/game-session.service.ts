import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { GameSession } from '../model/gameSession.entity';
import { UserGameSession } from '../model/userGameSession.entity';
import { Variables } from '../static/variables';

/**
 * This service provides DB queries for handling game sessions
 */

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

    // return created game session
    return result.raw[0];
  }

  async findActive(): Promise<GameSession[] | null> {
    return this.gameSessionRepo.find({
      where: {
        endedAt: IsNull(), //active game sessions are those that have not ended yet
      },
    });
  }

  async updatePoints(userUuid: string, hexCode: string, pointsToAdd: number) {
    let userGameSession = await this.findOneByUserUuidAndKey(userUuid, hexCode);

    if(!userGameSession) {
      throw new Error("user game session not found");
    }

    let evaluationMethod = userGameSession?.gameSession.evaluationMethod;

    if(!evaluationMethod) {
      throw new Error("evaluation method not found:" + evaluationMethod);
    }

    pointsToAdd = Variables.evaluationMethods.get(evaluationMethod)?.pointsToAdd(pointsToAdd) ?? pointsToAdd;
    userGameSession.points += pointsToAdd;
    await this.userGameSessionRepo.save(userGameSession);
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

  /**
   * UserGameSession entries are kept after a game session has ended.
   * Therefore we use the user uuid and the gamesession key to find a unique entry
   *
   * @param uuid
   * @param sessionKey
   */

  async findOneByUserUuidAndKey(uuid: string, sessionKey: string): Promise<UserGameSession | null> {
    return this.userGameSessionRepo
      .createQueryBuilder('userGameSession')
      .innerJoinAndSelect('userGameSession.gameSession', 'gs')
      .where('userGameSession.userUuid = :uuid AND gs.hexCode = :hexCode', { uuid: uuid, hexCode: sessionKey })
      .getOne();
  }

  async assignUserToSession(userUuid: string, sessionUuid: string): Promise<UserGameSession | null> {

    // set the user as offline in all other game sessions
    // this might be necessary if the user didn't close the tab of the old game session
    await this.userGameSessionRepo
      .createQueryBuilder()
      .update(UserGameSession)
      .set({ offline: true })
      .where('userUuid = :userUuid AND gameSessionUuid != :sessionUuid', {
        userUuid: userUuid,
        sessionUuid: sessionUuid,
      })
      .execute();

    // add a new userGameSession entry to indicate the user belongs to the session
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

  /**
   * Returns all active users of a game session
   * @param sessionUuid
   */
  async findAssignedUsers(sessionUuid: string) {
    return this.userGameSessionRepo.find({
      where: {
        gameSessionUuid: sessionUuid,
        offline: false,
      },
    });
  }

  /**
   * This method is necessary for some effects that affect other users
   * It picks a random user that isn't equal to the current user and is not offline
   * @param userUuid
   * @param gameSessionUuid
   */
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
