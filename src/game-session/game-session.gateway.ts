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

@WebSocketGateway({ cors: { origin: '*' } })
export class GameSessionGateway {

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
}