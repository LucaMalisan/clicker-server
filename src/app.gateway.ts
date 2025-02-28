import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Variables } from './static/variables';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {

  /**
   * Registration is necessary so that server can later send messages to all clients
   * @param client socket of client
   */

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket): void {
    Variables.sockets.push(client);
  }
}