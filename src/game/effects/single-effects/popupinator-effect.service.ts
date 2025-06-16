import { AbstractEffect } from '../abstract-effect';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Variables } from '../../../static/variables';
import { GameSessionService } from '../../game-session.service';
import { EffectService } from '../effect.service';
import { EffectUtil } from '../effect.util';
import setRandomInterval from 'set-random-interval';

/**
 * Effect handler for popupinator effect
 */


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

      //determine which user should be influenced
      let randomUser = await this.gameSessionService.findAnyButNotCurrentUser(userUuid, gameSession.gameSessionUuid);

      if (!randomUser) {
        throw new Error('Couldn\'t find any user...');
      }

      //create or update the userEffectPurchased entry
      let newUserEffectEntry = await this.effectUtil.updateDatabase(PopupinatorEffect.EFFECT_NAME, sessionKey, userUuid, randomUser.userUuid ?? '');

      if (!newUserEffectEntry) {
        throw new Error('Couldn\'t create or update userEffect entry');
      }

      let socket = Variables.sockets.get(randomUser.userUuid as string);

      //in random intervals, client receives the order to show a popup
      const interval = setRandomInterval(() => {
        socket?.emit('show-popup');
      }, 1000, 5000);

      //effect is active for 30 seconds
      let timeout = setTimeout(async () => {
        interval.clear();
        await this.effectService.removeEffectLogEntry(PopupinatorEffect.EFFECT_NAME, userUuid, randomUser?.userUuid ?? '')
      }, 30000);

      Variables.userEffectIntervals.set(newUserEffectEntry.uuid, timeout);

      //update client's shop
      return this.effectUtil.getAvailableEffects(userUuid);

    } catch (err) {
      console.error(err);
    }
  }
}