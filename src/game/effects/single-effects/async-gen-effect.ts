import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { UserGameSession } from '../../../model/userGameSession.entity';
import { GameSessionService } from '../../game-session.service';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class AsyncGenEffect extends AbstractEffect {

  constructor(private gameSessionService: GameSessionService) {
    super();
  }

  @SubscribeMessage('start-async-gen')
  public async execute(@ConnectedSocket() client: Socket) {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid);

    try {
      if (!userGameSession) {
        throw new Error('could not find user game session');
      }

      userGameSession.points -= 50;
      await this.gameSessionService.saveUserGameSession(userGameSession);

      setInterval(async () => {
        this.gameSessionService.findOneByUserUuid(userUuid)
          .then((userGameSession: UserGameSession) => {
            userGameSession.points += 1;
            this.gameSessionService.saveUserGameSession(userGameSession);
          });
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  }
}