import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Variables } from '../static/variables';
import { Socket } from 'socket.io';
import { GameSessionService } from './game-session.service';
import { GameSession } from '../model/gameSession.entity';
import * as crypto from 'node:crypto';
import { EffectService } from './effects/effect.service';
import { UsersService } from '../users/users.service';

interface ISessionInfo {
  sessionKey: string,
  started: boolean,
  joinedPlayers: any[]
  admin: boolean
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GameSessionGateway {

  protected readyClients: String[] = [];

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              protected userService: UsersService) {
  }

  /**
   * Session is created and persisted to database, mapped to the corresponding user
   * Client receives a confirmation
   * @param client
   * @param duration
   */

  @SubscribeMessage('create-session') async handleSessionCreation(@ConnectedSocket() client: Socket, @MessageBody() duration: string): Promise<void> {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('user uuid could not be found');
      }

      let parsedDuration = parseInt(duration);

      if (parsedDuration <= 0 || isNaN(parsedDuration) || !Number.isInteger(parsedDuration)) {
        throw new Error('Duration must be greater than 0');
      }

      let gameSession = await this.gameSessionService.create({
        createdByUuid: userUuid,
        duration: parsedDuration * 60 * 1000,
        hexCode: `#${crypto.randomBytes(4).toString('hex')}`,
      });

      console.log('created game session: ' + gameSession.hexCode);
      client.emit('session-creation-successful', gameSession.hexCode);

    } catch (err) {
      console.error(`Caught error: ${err}`);
      return err.message;
    }
  }

  /**
   * Session is created and persisted to database, mapped to the corresponding user
   * Client receives a confirmation
   * @param client
   * @param key
   */

  @SubscribeMessage('ready-for-game-start')
  async getConfirmationForGameStart(@ConnectedSocket() client: Socket, @MessageBody() key: string): Promise<void> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('user uuid could not be read');
      }

      let userGameSession = await this.gameSessionService.findOneByUserUuidAndKey(userUuid, key);
      let gameSession = userGameSession?.gameSession;

      if (!userGameSession) {
        throw new Error('user is not assigned to this game session');
      }

      if (gameSession?.createdByUuid !== userUuid) {
        throw new Error('user is not the creator of this game session');
      }

      if (!gameSession) {
        throw new Error('could not find gameSession');
      }

      if (!gameSession.startedAt) {
        gameSession.startedAt = new Date(Date.now());
        await this.gameSessionService.save(gameSession);
      }

      for (let socket of Variables.sockets.values()) {
        socket.emit('start-game');
      }

      clearTimeout(Variables.sessionTimerIntervals.get(gameSession.uuid));
      Variables.sessionTimerIntervals.set(gameSession.uuid, setTimeout(async () => this.stopGameSession(gameSession), this.getRemainingDuration(gameSession)));
    } catch (err) {
      console.error(`caught error: ${err}`);
    }
  }

  @SubscribeMessage('get-remaining-duration')
  async handleGetRemainingDuration(@ConnectedSocket() client: Socket, @MessageBody() key): Promise<String> {
    let gameSession = await this.gameSessionService.findOneByKey(key);

    if (!gameSession) {
      throw new Error('could not find game session');
    }

    return this.getRemainingDuration(gameSession) + '';
  }

  protected getRemainingDuration(gameSession: GameSession): number {
    if (!gameSession || !gameSession.startedAt || !gameSession.duration) {
      return 0;
    }

    return gameSession.duration - (Date.now() - gameSession.startedAt.getTime());
  }

  protected async stopGameSession(gameSession: GameSession) {
    for (let socket of Variables.sockets.values()) {
      socket.emit('stop-session', '');
    }
    gameSession.endedAt = new Date(Date.now());

    let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession.uuid);
    this.effectService.clearUserEffectTables(assignedUsers.map(e => e.userUuid ?? ''));

    Variables.userEffectIntervals.forEach((interval, key) => {
      clearInterval(interval);
    });

    await this.gameSessionService.save(gameSession);
    this.readyClients = [];

    Promise.resolve();
  }

  /**
   * Session is created and persisted to database, mapped to the corresponding user
   * Client receives a confirmation
   * @param client
   * @param sessionKey
   */

  @SubscribeMessage('get-session-info')
  async handleGetSessionInfo(@ConnectedSocket() client: Socket, @MessageBody() sessionKey: string): Promise<string> {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('could not read user uuid');
      }

      let userGameSession = await this.gameSessionService.findOneByUserUuidAndKey(userUuid, sessionKey);

      if (!userGameSession) {
        throw new Error('could not find user game session');
      }

      let gameSession = await this.gameSessionService.findOneByUuid(userGameSession.gameSessionUuid);

      if (!gameSession) {
        throw new Error('could not find game session');
      }

      let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession.uuid);

      let response: ISessionInfo = {
        sessionKey: gameSession && userGameSession ? gameSession.hexCode : '',
        started: gameSession?.startedAt != null,
        joinedPlayers: assignedUsers.map(e => e.user?.userName),
        admin: gameSession?.createdByUuid === userUuid,
      };

      return JSON.stringify(response);
    } catch (err) {
      console.error(`Caught error: ${err}`);

      let response: ISessionInfo = {
        sessionKey: '',
        started: false,
        joinedPlayers: [],
        admin: false,
      };

      return JSON.stringify(response);
    }
  }

  @SubscribeMessage('join-session')
  async handleSessionJoining(@ConnectedSocket() client: Socket, @MessageBody() key: string) {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('could not read user uuid');
      }

      let gameSession = await this.gameSessionService.findOneByKey(key);

      if (!gameSession) {
        throw new Error('could not find game session');
      }

      let existingEntry = await this.gameSessionService.findOneByUserUuidAndKey(userUuid, key);

      if (existingEntry) {
        throw new Error('user is already assigned to this session');
      }

      await this.gameSessionService.assignUserToSession(userUuid, gameSession.uuid);
      this.effectService.clearUserEffectTables([userUuid]);

      client.emit('join-successful', '');

      let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession.uuid);
      let userNames = assignedUsers.map(e => e.user?.userName);

      for (let user of assignedUsers) {
        let socket = Variables.sockets.get(user.userUuid ?? '');
        socket?.emit('player-joined', JSON.stringify(userNames));
      }

    } catch (err) {
      console.error(`caught error: ${err}`);
      return err.message;
    }
  }
}