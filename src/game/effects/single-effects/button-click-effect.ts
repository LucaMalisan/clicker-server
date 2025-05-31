import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { GameSessionService } from '../../game-session.service';
import { IPublishSubscribe } from '../IPublishSubscribe';
import * as console from 'node:console';

interface IButtonClick {
  buttonClicks: string,
  hexCode: string
}

/**
 * Effect handler for button click
 */

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ButtonClickEffect extends AbstractEffect implements IPublishSubscribe {

  protected subscribers: Map<String, any[]> = new Map();
  public static EVENT_NAME = 'handle-button-clicks';

  constructor(private gameSessionService: GameSessionService) {
    super();
  }

  @SubscribeMessage('handle-button-clicks') async handleButtonClicks(@ConnectedSocket() client: Socket, @MessageBody() clicks: string): Promise<void> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let json = JSON.parse(clicks);

    try {
      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      // adjust the current viruses of the user
      let addPoints = parseInt(json.buttonClicks);
      await this.gameSessionService.updatePoints(userUuid, json.hexCode, addPoints);

      //propagate to the subscribers that viruses were generated
      this.emit(ButtonClickEffect.EVENT_NAME, addPoints);
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

    if (val) {
      val.push(callback);
      this.subscribers.set(eventName, val);
    } else {
      this.subscribers.set(eventName, [callback]);
    }
  }

  unsubscribe(eventName: string, callback: any): void {
    let val = this.subscribers.get(eventName);

    if (val) {
      let index = val.indexOf(callback);
      val.splice(index, 1);
      this.subscribers.set(eventName, val);
    }
  }
}