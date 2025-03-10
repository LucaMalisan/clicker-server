import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Variables } from '../static/variables';
import { Socket } from 'socket.io';
import { UserGameSessionService } from './user-game-session.service';
import { GameSessionService } from '../game-session/game-session.service';
import { GameSession } from '../model/gameSession.entity';
import { UsersService } from '../users/users.service';


interface ISessionInfo {
  sessionKey: string,
  joinedPlayers: any[]
  admin: boolean
}

@WebSocketGateway({ cors: { origin: '*' } })
export class UserGameSessionGateway {

  constructor(private userGameSessionService: UserGameSessionService,
              private gameSessionService: GameSessionService,
              private usersService: UsersService) {
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

      return await this.userGameSessionService.findOneByUserUuid(userUuid)
        .then(userGameSession => userGameSession?.gameSession)
        .then(async gameSession => {
          let assignedUsers = await this.userGameSessionService.findAssignedUsers(gameSession?.uuid + '');
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
      .then((gameSession: GameSession) => this.userGameSessionService.assignUserToSession(userUuid, gameSession.uuid))
      .then(() => this.usersService.findOneByUuid(userUuid))
      .then(user => {
        client.emit('join-successful', '');
        return user;
      })
      .then(user => {
        for (let socket of Variables.sockets.keys()) {
          socket.emit('player-joined', user?.userName);
        }
      });
  }
}