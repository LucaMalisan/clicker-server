import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';
import { ButtonClickEffect } from './button-click-effect';
import { IPublishSubscribe } from '../IPublishSubscribe';

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
  public async execute(@ConnectedSocket() client: Socket) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      let userEffect = await this.effectService.findByEffectName(CriticalHitEffect.EFFECT_NAME, userUuid);
      let newUserEffectEntry = await this.effectUtil.updateDatabase(CriticalHitEffect.EFFECT_NAME, userUuid, userEffect);

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      this.buttonClick.subscribe(ButtonClickEffect.EVENT_NAME, async (clicks: string) => {
        let effectDetailEntry = await this.effectService.getLevelDetailEntry(CriticalHitEffect.EFFECT_NAME, newUserEffectEntry.currentLevel);
        let randomNumber = Math.random();

        if (randomNumber <= (effectDetailEntry?.probability ?? 0)) {
          let addPoints = parseInt(clicks) * ((effectDetailEntry?.efficiency ?? 1) - 1);
          await this.gameSessionService.updatePoints(userUuid, addPoints);
          this.emit(CriticalHitEffect.EVENT_NAME, addPoints);
        }
      });

      client.emit('reactivate-effect', CriticalHitEffect.EFFECT_NAME);
      return this.effectUtil.getEffects(userUuid);

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