import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Variables } from '../static/variables';
import { Socket } from 'socket.io';
import { GameSessionService } from './game-session.service';
import { GameSession } from '../model/gameSession.entity';
import * as crypto from 'node:crypto';
import { UserGameSession } from 'src/model/userGameSession.entity';
import { EffectService } from './effects/effect.service';
import { UsersService } from '../users/users.service';

interface ISessionInfo {
  sessionKey: string,
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
      console.error('create-session');
      console.error(`Caught error: ${err}`);
      return err.message;
    }
  }

  /**
   * Session is created and persisted to database, mapped to the corresponding user
   * Client receives a confirmation
   * @param client
   * @param duration
   */

  @SubscribeMessage('ready-for-game-start')
  async getConfirmationForGameStart(@ConnectedSocket() client: Socket): Promise<void> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('user uuid could not be read');
      }

      this.readyClients.push(userUuid);
      let allClientsRegistered = Variables.sockets.size <= this.readyClients.length;

      if (allClientsRegistered) {
        let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid);
        let gameSession = userGameSession?.gameSession;

        if (!gameSession) {
          throw new Error('could not find gameSession');
        }

        if (!gameSession.startedAt) {
          gameSession.startedAt = new Date(Date.now());
          await this.gameSessionService.save(gameSession);
        }

        let duration = gameSession.duration - (Date.now() - gameSession.startedAt.getTime());
        for (let socket of Variables.sockets.values()) {
          socket.emit('start-timer', duration);
        }

        clearTimeout(Variables.sessionTimerIntervals.get(gameSession.uuid));
        Variables.sessionTimerIntervals.set(gameSession.uuid, setTimeout(async () => this.stopGameSession(gameSession), duration));
      }
    } catch (err) {
      console.error(`caught error: ${err}`);
    }
  }

  protected async stopGameSession(gameSession: GameSession) {
    for (let socket of Variables.sockets.values()) {
      socket.emit('stop-session', '');
    }
    gameSession.endedAt = new Date(Date.now());
    this.effectService.clearUserEffectTables();

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
   * @param duration
   */

  @SubscribeMessage('get-session-info')
  async handleGetSessionInfo(@ConnectedSocket() client: Socket): Promise<string> {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('could not read user uuid');
      }

      let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid);
      let gameSession = await this.gameSessionService.findOneByUuid(userGameSession?.gameSessionUuid ?? '');

      if(!userGameSession || !gameSession){
        throw new Error("could not find game session");
      }

      let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession.uuid);

      let response: ISessionInfo = {
        sessionKey: gameSession ? gameSession.hexCode : '',
        joinedPlayers: assignedUsers.map(e => e.user?.userName),
        admin: gameSession?.createdByUuid === userUuid,
      };

      return JSON.stringify(response);
    } catch (err) {
      console.error('get-session-info');
      console.error(`Caught error: ${err}`);

      let response: ISessionInfo = {
        sessionKey: '',
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

      let gameSessionUuid: string | undefined;

      if (key) {
        let gameSession = await this.gameSessionService.findOneByKey(key);
        gameSessionUuid = gameSession?.uuid;
      } else {
        let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid);
        gameSessionUuid = userGameSession?.gameSessionUuid;
      }

      if (!gameSessionUuid) {
        throw new Error('could not find game session');
      }

      await this.gameSessionService.assignUserToSession(userUuid, gameSessionUuid);
      client.emit('join-successful', '');

      let joinedUser = await this.userService.findByUuid(userUuid);
      let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSessionUuid);

      for (let user of assignedUsers) {
        let socket = Variables.sockets.get(user.uuid ?? '');
        socket?.emit('player-joined', joinedUser?.userName);
      }

    } catch (err) {
      console.error(`caught error: ${err}`);
      return err.message;
    }
  }

  //TODO provide generic replay function for just replaying
  @SubscribeMessage('start-game')
  handleGameStart(): void {
    for (let socket of Variables.sockets.values()) {
      socket.emit('start-game');
    }
  }
}