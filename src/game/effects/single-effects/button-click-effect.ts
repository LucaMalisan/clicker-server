import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { GameSessionService } from '../../game-session.service';
import { UserGameSession } from '../../../model/userGameSession.entity';
import { IPublishSubscribe } from '../IPublishSubscribe';
import * as console from 'node:console';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ButtonClickEffect extends AbstractEffect implements IPublishSubscribe {

  protected subscribers: Map<String, any[]> = new Map();

  constructor(private gameSessionService: GameSessionService) {
    super();
  }

  @SubscribeMessage('handle-button-clicks')
  handleSessionCreation(@ConnectedSocket() client: Socket, @MessageBody() clicks: string): void {
    this.emit('handle-button-clicks', clicks);

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

  emit(eventName: string, ...args: any[]): void {
    this.subscribers.get(eventName)?.forEach(callback => {
      callback(...args);
    });
  }

  subscribe(eventName: string, callback: any): void {
    let val = this.subscribers.get(eventName);
    console.log(eventName);

    if (val) {
      val.push(callback);
      this.subscribers.set(eventName, val);
    } else {
      this.subscribers.set(eventName, [callback]);
    }
  }
}