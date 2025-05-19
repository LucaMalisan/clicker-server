import { Injectable } from '@nestjs/common';
import { Variables } from '../../static/variables';
import { GameSessionService } from '../game-session.service';
import { EffectService } from './effect.service';
import { UserActiveEffects } from '../../model/userActiveEffects.entity';

interface IActiveEffect {
  effectName: string,
  userName: string,
}

@Injectable()
export class EffectLogActor {

  constructor(private effectService: EffectService) {
    setInterval(() => this.sendUpdatedEffectLog(), 500);
  }

  async sendUpdatedEffectLog() {
    for (let sk of Variables.sockets.values()) {
      let userUuid = Variables.getUserUuidBySocket(sk) as string;

      let result = await this.effectService.getUserInfluencingEffects(userUuid);
      let json: IActiveEffect[] = result.map((e: UserActiveEffects) => {
        return {
          effectName: e.effectName,
          userName: e.activatedBy?.userName as string,
        };
      });

      sk.emit('get-user-influencing-effects', JSON.stringify(json));

      let result2 = await this.effectService.getEffectsActivatedBy(userUuid);
      let json2: IActiveEffect[] = result2.map((e: UserActiveEffects) => {
        return {
          effectName: e.effectName,
          userName: e.influencedUser?.userName as string,
        };
      });

      sk.emit('get-user-activated-effects', JSON.stringify(json2));
    }
  }
}