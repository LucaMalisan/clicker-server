import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Variables } from '../static/variables';
import { ChatService } from './chat.service';
import { ChatMessage } from '../model/chatMessage.entity';
import { Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { User } from '../model/user.entity';
import { UserGameSessionService } from '../user-game-session/user-game-session.service';
import { UserGameSession } from '../model/userGameSession.entity';

interface IChatMessageResponse {
  content: string,
  userName: string
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {

  constructor(private chatService: ChatService,
              private userService: UsersService,
              private gameSessionService: UserGameSessionService) {
  }

  /**
   * Chat Message is persisted to database, mapped to user and game session
   * Server receives a chat message and sends it back to all authenticated clients
   * @param client
   * @param data - {message: '...', user: '...'}
   */

  @SubscribeMessage('chat-message')
  handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string): void {
    let userUuid = Variables.sockets.get(client) + '';

    this.gameSessionService.findOneByUserUuid(userUuid)
      .then((userGameSession: UserGameSession) => {
        let chatMessage = new ChatMessage();
        chatMessage.content = data;
        chatMessage.gameSession = userGameSession.gameSession;
        chatMessage.writtenByUuid = userUuid;
        return this.chatService.save(chatMessage);
      })
      .then(() => this.userService.findOneByUuid(userUuid))
      .then((user: User) => {
        let iChatMessageResponse: IChatMessageResponse = {
          content: data,
          userName: user.userName,
        };
        return iChatMessageResponse;
      })
      .then(response => {
        for (let sk of Variables.sockets.keys()) {
          sk.emit('chat-message', JSON.stringify(response));
        }
      });
  }
}