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
import { ReplicationEffect } from './replication-effect.service';

/**
 * Effect handler for auto clicker
 */

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ReverseEngineeredEffect extends AbstractEffect {

  protected static EFFECT_NAME = 'reverse-engineered';

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil,
              private criticalHit: CriticalHitEffect,
              private autoclick: AsyncGenEffect,
              private buttonClick: ButtonClickEffect,
              private replicationEffect: ReplicationEffect) {
    super();
  }

  @SubscribeMessage('start-reverse-engineered')
  public async execute(@ConnectedSocket() client: Socket, @MessageBody() sessionKey: string) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      let gameSession = await this.gameSessionService.findOneByUserUuidAndKey(userUuid, sessionKey);

      if (!gameSession) {
        throw new Error('Could not find game session');
      }

      let randomUser = await this.gameSessionService.findAnyButNotCurrentUser(userUuid, gameSession.gameSessionUuid);

      if (!randomUser) {
        throw new Error('Couldn\'t find any user...');
      }

      //create or update the userEffectPurchased entry
      let newUserEffectEntry = await this.effectUtil.updateDatabase(ReverseEngineeredEffect.EFFECT_NAME, sessionKey, userUuid, randomUser.userUuid as string);

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      //the effects doubles all collected viruses and subtracts them (all collected points count negative)
      let callback = async (clicks: string, randomUserUuid: string) => {
        await this.gameSessionService.updatePoints(randomUserUuid ?? '',  sessionKey, -2 * parseInt(clicks));
      };

      //the effect considers all viruses collected by other effects
      this.autoclick.subscribe(AsyncGenEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
      this.criticalHit.subscribe(CriticalHitEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
      this.buttonClick.subscribe(ButtonClickEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
      this.replicationEffect.subscribe(ReplicationEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));

      // the effect stops after 5 seconds
      let timeout = setTimeout(async () => {
        this.autoclick.unsubscribe(AsyncGenEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
        this.criticalHit.unsubscribe(CriticalHitEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
        this.buttonClick.unsubscribe(ButtonClickEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
        this.replicationEffect.unsubscribe(ReplicationEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));

        this.effectService.removeEffectLogEntry(ReverseEngineeredEffect.EFFECT_NAME, userUuid, randomUser.userUuid as string);
        client.emit('reactivate-effect', ReverseEngineeredEffect.EFFECT_NAME);
        clearTimeout(timeout);
      }, 5000);

      //update client's shop
      return this.effectUtil.getAvailableEffects(userUuid);
    } catch (err) {
      console.error(err);
    }
  }
}