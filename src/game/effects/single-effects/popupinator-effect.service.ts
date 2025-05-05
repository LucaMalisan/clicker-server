import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';
import setRandomInterval from 'set-random-interval';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class PopupinatorEffect extends AbstractEffect {

  protected static EFFECT_NAME = 'popupinator';

  constructor(private gameSessionService: GameSessionService,
              private effectService: EffectService,
              private effectUtil: EffectUtil) {
    super();
  }

  @SubscribeMessage('start-popupinator')
  public async execute(@ConnectedSocket() client: Socket) {
    try {
      let userUuid = Variables.getUserUuidBySocket(client) as string;

      if (!userUuid) {
        throw new Error('Could not read user uuid');
      }

      let userEffect = await this.effectService.findByEffectName(PopupinatorEffect.EFFECT_NAME, userUuid);
      let newUserEffectEntry = await this.effectUtil.updateDatabase(PopupinatorEffect.EFFECT_NAME, userUuid, userUuid, userEffect);

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      let gameSession = await this.gameSessionService.findOneByUserUuid(userUuid);

      if (!gameSession) {
        throw new Error('Could not find game session');
      }

      let randomUser = await this.gameSessionService.findAnyButNotCurrentUser(userUuid, gameSession.gameSessionUuid);

      if (!randomUser) {
        throw new Error('Couldn\'t find any user...');
      }

      let socket = Variables.sockets.get(randomUser.userUuid as string);

      const interval = setRandomInterval(() => {
        console.log('show popup');
        socket?.emit('show-popup');
      }, 1000, 5000);

      setTimeout(async () => {
        interval.clear();
      }, 30000);

      return this.effectUtil.getAvailableEffects(userUuid);

    } catch (err) {
      console.error(err);
    }
  }
}