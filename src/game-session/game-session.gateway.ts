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
import { UsersService } from '../users/users.service';
import { UserGameSession } from 'src/model/userGameSession.entity';

interface ISessionInfo {
  sessionKey: string,
  joinedPlayers: any[]
  admin: boolean
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GameSessionGateway {

  protected readyClients: String[] = [];

  constructor(private gameSessionService: GameSessionService,
              private usersService: UsersService) {
  }

  /**
   * Session is created and persisted to database, mapped to the corresponding user
   * Client receives a confirmation
   * @param client
   * @param duration
   */

  @SubscribeMessage('create-session')
  handleSessionCreation(@ConnectedSocket() client: Socket, @MessageBody() duration: string): void {
    //TODO: delete all other userGameSession entries for this user
    try {
      let userUuid = Variables.sockets.get(client) + '';
      let gameSession: GameSession = new GameSession();
      let hexCode = `#${crypto.randomBytes(4).toString('hex')}`;
      let parsedDuration = parseInt(duration);

      if (parsedDuration <= 0) {
        throw new Error('Duration must be greater than 0');
      }

      gameSession.createdByUuid = userUuid + '';
      gameSession.duration = parseInt(duration);
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
  getConfirmationForGameStart(@ConnectedSocket() client: Socket): void {
    let userUuid = Variables.sockets.get(client) + '';

    this.readyClients.push(userUuid);
    let allClientsRegistered = true;

    for (let uuid of Variables.sockets.values()) {
      if (!this.readyClients.includes(uuid)) {
        allClientsRegistered = false;
      }
    }

    if (allClientsRegistered) {
      console.log('all clients ready');

      this.gameSessionService.findOneByUserUuid(userUuid)
        .then((userGameSession: UserGameSession) => {
          for (let socket of Variables.sockets.keys()) {
            socket.emit('start-timer', userGameSession?.gameSession.duration + '');
          }
          return userGameSession?.gameSession;
        })
        .then(async gameSession => {
          gameSession.startedAt = new Date(Date.now());
          return this.gameSessionService.save(gameSession);
        })
        .then((gameSessions: GameSession[]) => {
          let gameSession = gameSessions[0];

          setTimeout(async () => {
            for (let socket of Variables.sockets.keys()) {
              console.log('stop session');
              socket.emit('stop-session', '');
            }
            gameSession.endedAt = new Date(Date.now());
            await this.gameSessionService.save(gameSession);
            Promise.resolve();
          }, gameSession?.duration * 60 * 1000);
        });
    }
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
      let userUuid = Variables.sockets.get(client) + '';

      return await this.gameSessionService.findOneByUserUuid(userUuid)
        .then(userGameSession => {
          return userGameSession?.gameSession;
        })
        .then(async gameSession => {
          let assignedUsers = await this.gameSessionService.findAssignedUsers(gameSession?.uuid + '');
          return { assignedUsers: assignedUsers.map(e => e.user?.userName), gameSession: gameSession };
        })
        .then(json => {
          let gameSession = json.gameSession;
          let assignedUsers = json.assignedUsers;

          let response: ISessionInfo = {
            sessionKey: gameSession?.hexCode + '',
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
    let userUuid = Variables.sockets.get(client) + '';

    this.gameSessionService.findOneByKey(key)
      .then((gameSession: GameSession) => this.gameSessionService.assignUserToSession(userUuid, gameSession.uuid))
      .then(userGameSession => {
        client.emit('join-successful', '');

        let user = userGameSession?.user;
        for (let socket of Variables.sockets.keys()) {
          socket.emit('player-joined', user?.userName);
        }
      });
  }
}