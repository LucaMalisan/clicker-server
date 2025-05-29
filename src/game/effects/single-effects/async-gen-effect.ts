import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { UserGameSession } from '../../../model/userGameSession.entity';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';
import { IPublishSubscribe } from '../IPublishSubscribe';
import * as console from 'node:console';

/**
 * Effect handler for auto clicker
 */

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class AsyncGenEffect extends AbstractEffect implements IPublishSubscribe {

  protected subscribers: Map<String, any[]> = new Map();
  protected static EFFECT_NAME = 'autoclick';
  public static EVENT_NAME = 'handle-auto-click';

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil) {
    super();
  }

  @SubscribeMessage('start-auto-click')
  public async execute(@ConnectedSocket() client: Socket, @MessageBody() sessionKey: string) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      //create or update the userEffectPurchased entry
      let userEffect = await this.effectService.findByEffectName(AsyncGenEffect.EFFECT_NAME, userUuid);
      let newEntry = await this.effectUtil.updateDatabase(AsyncGenEffect.EFFECT_NAME, userUuid, userUuid);

      //if there's already existed an userEffectPurchased entry, there's already an active interval. we need to clear it
      if (userEffect) {
        this.effectUtil.clearOldInterval(userEffect);
      }

      if (!newEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      let efficiency = await this.effectService.getEfficiencyOfEffectLevel(newEntry.effectName, newEntry.currentLevel);

      //create a new interval with new efficiency (how many viruses are created per second)
      let newInterval = setInterval(async () => {
        let pointsToAdd = efficiency ?? 0;

        // adjust the current viruses of the user
        await this.gameSessionService.updatePoints(userUuid, pointsToAdd);

        //propagate to the subscribers that viruses were generated
        this.emit(AsyncGenEffect.EVENT_NAME, pointsToAdd);
      }, 1000);

      //add entry to be able to clear the interval later
      Variables.userEffectIntervals.set(newEntry.uuid, newInterval);

      //signalize to client that effect is purchasable again
      client.emit('reactivate-effect', AsyncGenEffect.EFFECT_NAME);

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