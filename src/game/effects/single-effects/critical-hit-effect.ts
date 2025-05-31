import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';
import { ButtonClickEffect } from './button-click-effect';
import { IPublishSubscribe } from '../IPublishSubscribe';

/**
 * Effect handler for critical hit
 */

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class CriticalHitEffect extends AbstractEffect implements IPublishSubscribe {

  protected subscribers: Map<String, any[]> = new Map();
  protected static EFFECT_NAME = 'critical-hit';
  public static EVENT_NAME = 'handle-critical-hit';

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil,
              private buttonClick: ButtonClickEffect) {
    super();
  }

  @SubscribeMessage('start-critical-hit')
  public async execute(@ConnectedSocket() client: Socket, @MessageBody() sessionKey: string) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      //create or update the userEffectPurchased entry
      let newUserEffectEntry = await this.effectUtil.updateDatabase(CriticalHitEffect.EFFECT_NAME, userUuid, userUuid);

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      // listen to the button click effect
      this.buttonClick.subscribe(ButtonClickEffect.EVENT_NAME, async (clicks: string) => {
        let effectDetailEntry = await this.effectService.getLevelDetailEntry(CriticalHitEffect.EFFECT_NAME, newUserEffectEntry.currentLevel);
        let randomNumber = Math.random();

        //randomly determines if viruses of button click are multiplied
        if (randomNumber <= (effectDetailEntry?.probability ?? 0)) {
          let addPoints = parseInt(clicks) * ((effectDetailEntry?.efficiency ?? 1) - 1);

          // adjust the current viruses of the user
          await this.gameSessionService.updatePoints(userUuid, addPoints);

          //propagate to the subscribers that viruses were generated
          this.emit(CriticalHitEffect.EVENT_NAME, addPoints);
        }
      });

      //signalize to client that effect is purchasable again
      client.emit('reactivate-effect', CriticalHitEffect.EFFECT_NAME);

      //update client's shop
      return this.effectUtil.getAvailableEffects(userUuid);

    } catch (err) {
      console.error(err);
    }
  }

  emit(eventName: string, ...args: any[]): void {
    this.subscribers.get(eventName)?.forEach(callback => {
      callback(args);
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