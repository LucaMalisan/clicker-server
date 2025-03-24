import { Effect } from './effect';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../static/variables';
import { GameSessionService } from '../game-session.service';
import { UserGameSession } from '../../model/userGameSession.entity';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ButtonClickEffect extends Effect {

  constructor(private gameSessionService: GameSessionService) {
    super();
  }

  @SubscribeMessage('handle-button-clicks')
  handleSessionCreation(@ConnectedSocket() client: Socket, @MessageBody() clicks: string): void {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      this.gameSessionService.findOneByUserUuid(userUuid)
        .then(async (userGameSession: UserGameSession) => {
          let factor = 1;
          let addPoints = parseInt(clicks) * factor;
          userGameSession.points = (userGameSession.points == null) ? addPoints : userGameSession.points + addPoints;
          await this.gameSessionService.saveUserGameSession(userGameSession);
        });
    } catch (err) {
      console.error(err);
    }
  }
}