import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Variables } from '../static/variables';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {

  /**
   * Server receives a chat message and sends it back to all clients
   * @param data - {message: '...', user: '...'}
   */

  @SubscribeMessage('chat-message')
  handleChatMessage(@MessageBody() data: string): void {
    //send message to all registered clients
    for (let sk of Variables.sockets) {
      sk.emit('chat-message', data);
    }
  }
}