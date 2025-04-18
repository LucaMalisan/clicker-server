import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';
import { ButtonClickEffect } from './button-click-effect';
import { AsyncGenEffect } from './async-gen-effect';
import { CriticalHitEffect } from './critical-hit-effect';
import { UsersService } from '../../../users/users.service';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ReverseEngineeredEffect extends AbstractEffect {

  protected static EFFECT_NAME = 'reverse-engineered';

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private usersService: UsersService,
              private effectUtil: EffectUtil,
              private criticalHit: CriticalHitEffect,
              private autoclick: AsyncGenEffect,
              private buttonClick: ButtonClickEffect) {
    super();
  }

  @SubscribeMessage('start-reverse-engineered')
  public async execute(@ConnectedSocket() client: Socket) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      let gameSession = await this.gameSessionService.findOneByUserUuid(userUuid);

      if (!gameSession) {
        throw new Error('Could not find game session');
      }

      let userEffect = await this.effectService.findByEffectName(ReverseEngineeredEffect.EFFECT_NAME, userUuid);
      let newUserEffectEntry = await this.effectUtil.updateDatabase(ReverseEngineeredEffect.EFFECT_NAME, userUuid, userEffect);

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      //TODO should user be choosable?
      let randomUser = await this.gameSessionService.findAnyButNotCurrentUser(userUuid, gameSession.gameSessionUuid);

      if (!randomUser) {
        throw new Error('Couldn\'t find any user...');
      }

      let callback = async (clicks: string, randomUserUuid: string) => {
        await this.gameSessionService.updatePoints(randomUserUuid ?? '', -2 * parseInt(clicks));
      };

      this.autoclick.subscribe(AsyncGenEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
      this.criticalHit.subscribe(CriticalHitEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
      this.buttonClick.subscribe(ButtonClickEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));

      let timeout = setTimeout(async () => {
        this.autoclick.unsubscribe(AsyncGenEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
        this.criticalHit.unsubscribe(CriticalHitEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
        this.buttonClick.unsubscribe(ButtonClickEffect.EVENT_NAME, (clicks: string) => callback(clicks, randomUser.userUuid ?? ''));
        client.emit('reactivate-effect', ReverseEngineeredEffect.EFFECT_NAME);
        clearTimeout(timeout);
      }, 5000);

      return this.effectUtil.getEffects(userUuid);

    } catch (err) {
      console.error(err);
    }
  }
}