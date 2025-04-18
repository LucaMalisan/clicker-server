import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Variables } from '../../static/variables';
import { EffectUtil } from './effect.util';



@WebSocketGateway({ cors: { origin: '*' } })
export class EffectGateway {

  constructor(private effectUtil: EffectUtil) {
  }

  @SubscribeMessage('get-available-effects')
  async getAvailableEffects(@ConnectedSocket() client: Socket): Promise<string> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    return this.effectUtil.getAvailableEffects(userUuid);
  }
}