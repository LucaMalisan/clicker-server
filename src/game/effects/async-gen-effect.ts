import { Effect } from './effect';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class AsyncGenEffect extends Effect {

  @SubscribeMessage('start-async-gen')
  public execute(@ConnectedSocket() client: Socket): void {
    setInterval(() => {

    }, 1000);
  }
}