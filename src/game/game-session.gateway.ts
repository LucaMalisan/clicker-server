import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Variables } from '../static/variables';
import { Socket } from 'socket.io';
import { GameSessionService } from './game-session.service';
import { GameSession } from '../model/gameSession.entity';
import * as crypto from 'node:crypto';
import { UserGameSession } from 'src/model/userGameSession.entity';

interface ISessionInfo {
  sessionKey: string,
  joinedPlayers: any[]
  admin: boolean
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GameSessionGateway {

  protected readyClients: String[] = [];

  constructor(private gameSessionService: GameSessionService) {
  }

  /**
   * Session is created and persisted to database, mapped to the corresponding user
   * Client receives a confirmation
   * @param client
   * @param duration
   */

  @SubscribeMessage('create-session')
  handleSessionCreation(@ConnectedSocket() client: Socket, @MessageBody() duration: string): void {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('user uuid could not be found');
      }
      let gameSession: GameSession = new GameSession();
      let hexCode = `#${crypto.randomBytes(4).toString('hex')}`;
      let parsedDuration = parseInt(duration);

      if (parsedDuration <= 0) {
        throw new Error('Duration must be greater than 0');
      }

      gameSession.createdByUuid = userUuid;
      gameSession.duration = parseInt(duration) * 60 * 1000;
      gameSession.hexCode = hexCode;

      console.log(`Create new game session: ${JSON.stringify(gameSession)}`);

      this.gameSessionService.save(gameSession)
        .then(() => client.emit('session-creation-successful', gameSession.hexCode));
    } catch (err) {
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
      let allClientsRegistered = true;

      for (let uuid of Variables.sockets.keys()) {
        if (!this.readyClients.includes(uuid)) {
          allClientsRegistered = false;
        }
      }

      if (allClientsRegistered) {
        console.log('all clients ready');

        let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid)
          .then((userGameSession: UserGameSession) => {
            if (!userGameSession) {
              return null;
            }

            let gameSession = userGameSession.gameSession;
            let duration = gameSession.startedAt
              ? (gameSession.duration - (Date.now() - gameSession.startedAt.getTime()))
              : gameSession.duration;

            for (let socket of Variables.sockets.values()) {
              socket.emit('start-timer', duration);
            }
            return userGameSession;
          });

        if (userGameSession && !userGameSession.gameSession?.startedAt) {
          let gameSession = userGameSession.gameSession;
          gameSession.startedAt = new Date(Date.now());
          await this.gameSessionService.save(gameSession);
          setTimeout(async () => this.stopGameSession(gameSession), gameSession.duration);
        }
      }
    } catch (err) {
      console.error(`caught error: ${err}`);
    }
  }

  protected async stopGameSession(gameSession: GameSession) {
    for (let socket of Variables.sockets.values()) {
      console.log('stop session');
      socket.emit('stop-session', '');
    }
    gameSession.endedAt = new Date(Date.now());
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

      return await this.gameSessionService.findOneByUserUuid(userUuid)
        .then(userGameSession => {
          return userGameSession?.gameSession;
        })
        .then(async gameSession => {
          let assignedUsers: UserGameSession[] = [];

          if (gameSession) {
            assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession ? gameSession.uuid : '');
          }

          return { assignedUsers: assignedUsers?.map(e => e.user?.userName), gameSession: gameSession };
        })
        .then(json => {
          let gameSession = json.gameSession;
          let assignedUsers = json.assignedUsers;

          let response: ISessionInfo = {
            sessionKey: gameSession ? gameSession.hexCode : '',
            joinedPlayers: assignedUsers,
            admin: gameSession?.createdByUuid === userUuid,
          };

          return JSON.stringify(response);
        });
    } catch (err) {
      console.error(`Caught error: ${err}`);
      return err.message;
    }
  }

  @SubscribeMessage('join-session')
  async handleSessionJoining(@ConnectedSocket() client: Socket, @MessageBody() key: string) {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('could not read user uuid');
      }

      this.gameSessionService.findOneByKey(key)
        .then((gameSession: GameSession) => this.gameSessionService.assignUserToSession(userUuid, gameSession.uuid))
        .then(userGameSession => {
          client.emit('join-successful', '');

          let user = userGameSession?.user;
          for (let socket of Variables.sockets.values()) {
            socket.emit('player-joined', user?.userName);
          }
        });
    } catch (err) {
      console.error(`caught error: ${err}`);
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