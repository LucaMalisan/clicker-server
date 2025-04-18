import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Variables } from '../../static/variables';
import { EffectUtil } from './effect.util';
import { EffectService } from './effect.service';
import { UserActiveEffects } from '../../model/userActiveEffects.entity';

interface IActiveEffect {
  effectName: string,
  userName: string,
}

@WebSocketGateway({ cors: { origin: '*' } })
export class EffectGateway {

  constructor(private effectUtil: EffectUtil,
              private effectService: EffectService) {
  }

  @SubscribeMessage('get-available-effects')
  async getAvailableEffects(@ConnectedSocket() client: Socket): Promise<string> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    return this.effectUtil.getAvailableEffects(userUuid);
  }

  @SubscribeMessage('get-user-influencing-effects')
  async getUserInfluencingEffects(@ConnectedSocket() client: Socket): Promise<string> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let result = await this.effectService.getUserInfluencingEffects(userUuid);
    let json: IActiveEffect[] = result.map((e: UserActiveEffects) => {
      return {
        effectName: e.effectName,
        userName: e.activatedBy?.userName as string,
      };
    });
    return JSON.stringify(json);
  }

  @SubscribeMessage('get-user-activated-effects')
  async getUserActivatedEffects(@ConnectedSocket() client: Socket): Promise<string> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let result = await this.effectService.getEffectsActivatedBy(userUuid);
    let json: IActiveEffect[] = result.map((e: UserActiveEffects) => {
      return {
        effectName: e.effectName,
        userName: e.influencedUser?.userName as string,
      };
    });
    return JSON.stringify(json);

  }
}