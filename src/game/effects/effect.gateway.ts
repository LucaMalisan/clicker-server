import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Effect } from 'src/model/effect.entity';
import { EffectService } from './effect.service';

interface IEffect {
  name: string,
  description: string,
  cost: string,
  route: string
}

@WebSocketGateway({ cors: { origin: '*' } })
export class EffectGateway {

  constructor(private effectService: EffectService) {
  }

  @SubscribeMessage('get-effects')
  handleSessionCreation(): Promise<string> {
    return this.effectService.findAll()
      .then((effects: Effect[]) => {
        return effects.map(e => {
          let iEffect: IEffect = {
            name: e.name,
            description: e.description,
            cost: '50', //TODO calculate this via userEffect
            route: e.activationRoute,
          };
          return iEffect;
        });
      })
      .then(effects => JSON.stringify(effects));
  }
}