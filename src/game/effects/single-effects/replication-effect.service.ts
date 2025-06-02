import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';
import { ButtonClickEffect } from './button-click-effect';
import { AsyncGenEffect } from './async-gen-effect';
import { CriticalHitEffect } from './critical-hit-effect';
import { IPublishSubscribe } from '../IPublishSubscribe';

/**
 * Effect handler for replication effect
 */

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ReplicationEffect extends AbstractEffect implements IPublishSubscribe {

  protected subscribers: Map<String, any[]> = new Map();
  protected static EFFECT_NAME = 'replication';
  public static EVENT_NAME = 'replication';
  protected collectedPoints: Map<String, number> = new Map();

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil,
              private criticalHit: CriticalHitEffect,
              private autoclick: AsyncGenEffect,
              private buttonClick: ButtonClickEffect) {
    super();
  }

  @SubscribeMessage('start-replication')
  public async execute(@ConnectedSocket() client: Socket, @MessageBody() sessionKey: string) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      //create or update the userEffectPurchased entry
      let newUserEffectEntry = await this.effectUtil.updateDatabase(ReplicationEffect.EFFECT_NAME, sessionKey, userUuid, userUuid);

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      //logic to update the collected points by user
      let callback = async (clicks: string, userUuid: string) => {
        let points: number = this.collectedPoints.get(userUuid) ?? 0;
        points += parseInt(clicks);
        this.collectedPoints.set(userUuid, points);
      };

      //this effect considers all points collected by other effects
      this.autoclick.subscribe(AsyncGenEffect.EVENT_NAME, (clicks: string) => callback(clicks, userUuid));
      this.criticalHit.subscribe(CriticalHitEffect.EVENT_NAME, (clicks: string) => callback(clicks, userUuid));
      this.buttonClick.subscribe(ButtonClickEffect.EVENT_NAME, (clicks: string) => callback(clicks, userUuid));

      let timeout = setTimeout(async () => {
        //collected viruses are multiplied
        let points = this.collectedPoints.get(userUuid) ?? 0;
        let effectDetailEntry = await this.effectService.getLevelDetailEntry(ReplicationEffect.EFFECT_NAME, newUserEffectEntry.currentLevel);
        let addPoints = points * ((effectDetailEntry?.efficiency ?? 1) - 1);

        // adjust the current viruses of the user
        await this.gameSessionService.updatePoints(userUuid, sessionKey, addPoints);

        //propagate to the subscribers that viruses were generated
        this.emit(ReplicationEffect.EVENT_NAME, addPoints);

        this.autoclick.unsubscribe(AsyncGenEffect.EVENT_NAME, (clicks: string) => callback(clicks, userUuid));
        this.criticalHit.unsubscribe(CriticalHitEffect.EVENT_NAME, (clicks: string) => callback(clicks, userUuid));
        this.buttonClick.unsubscribe(ButtonClickEffect.EVENT_NAME, (clicks: string) => callback(clicks, userUuid));

        //stop effect
        this.effectService.removeEffectLogEntry(ReplicationEffect.EFFECT_NAME, userUuid, userUuid);
        this.collectedPoints.set(userUuid, 0);
        clearTimeout(timeout);

        //signalize to client that effect is purchasable again
        client.emit('reactivate-effect', ReplicationEffect.EFFECT_NAME);
      }, 5000);

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