import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class EventsGateway {

  protected sockets: Socket[];

  /**
   * Registration is necessary so that server can later send messages to all clients
   * @param client: socket of client
   */

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket): void {
    this.sockets.push(client);
  }

  /**
   * Server receives a chat message and sends it back to all clients
   * @param data: {message: "...", user: "..."}
   */

  @SubscribeMessage('chat-message')
  handleChatMessage(@MessageBody() data: string): void {
    for (let sk of this.sockets) {
      sk.emit('chat-message', data); // Sende die Nachricht
    }
  }
}