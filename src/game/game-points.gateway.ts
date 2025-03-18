import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameSessionService } from './game-session.service';
import { Variables } from '../static/variables';
import { UserGameSession } from '../model/userGameSession.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class GamePointsGateway {

  constructor(private gameSessionService: GameSessionService) {
  }

  @SubscribeMessage('handle-button-click')
  handleSessionCreation(@ConnectedSocket() client: Socket): void {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      this.gameSessionService.findOneByUserUuid(userUuid)
        .then(async (userGameSession: UserGameSession) => {
          userGameSession.points = (userGameSession.points == null) ? 1 : userGameSession.points + 1;
          await this.gameSessionService.saveUserGameSession(userGameSession);
        });
    } catch (err) {
      console.error(err);
    }
  }

}