import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Variables } from '../static/variables';
import { Socket } from 'socket.io';
import { UserGameSessionService } from './user-game-session.service';


interface ISessionInfo {
  sessionKey: string,
  admin: boolean
}

@WebSocketGateway({ cors: { origin: '*' } })
export class UserGameSessionGateway {

  constructor(private userGameSessionService: UserGameSessionService) {
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
        .then(gameSession => {
          let response: ISessionInfo = {
            sessionKey: gameSession?.hexCode + '',
            admin: gameSession?.createdByUuid === userUuid,
          };
          return JSON.stringify(response);
        });
    } catch (err) {
      console.error(`Caught error: ${err}`);
      return err.message;
    }
  }
}