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
import { UserGameSession } from '../model/userGameSession.entity';
import { GameSessionService } from '../game/game-session.service';

interface IChatMessageResponse {
  username: string;
  message: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {

  constructor(private chatService: ChatService,
              private userService: UsersService,
              private gameSessionService: GameSessionService) {
  }

  /**
   * Chat Message is persisted to database, mapped to user and game session
   * Server receives a chat message and sends it back to all authenticated clients
   * @param client
   * @param data - {message: '...', user: '...'}
   */

  @SubscribeMessage('chat-message')
  handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string): void {
    data = data.replaceAll('"', '');

    console.log(`Got chat message: ${data}`);

    let userUuid = Variables.getUserUuidBySocket(client) as string;

    console.log(`Retrieved user UUID: ${userUuid}`);

    try {
      if (!userUuid) {
        throw new Error('user uuid could not be found');
      }

      this.gameSessionService.findOneByUserUuid(userUuid)
        .then((userGameSession: UserGameSession) => {
          console.log(`Retrieved userGameSession: ${userGameSession.uuid}`);

          let chatMessage = new ChatMessage();
          chatMessage.content = data;
          chatMessage.gameSessionUuid = userGameSession.gameSession.uuid;
          chatMessage.writtenByUuid = userUuid;
          return this.chatService.save(chatMessage);
        })
        .then((chatMessage: ChatMessage[]) => {
          let user = chatMessage[0].writtenBy;
          console.log(`Retrieved userName: ${user?.userName}`);

          if (!user?.userName) {
            throw new Error('could not read username');
          }

          let iChatMessageResponse: IChatMessageResponse = {
            message: data,
            username: user?.userName,
          };
          return iChatMessageResponse;
        })
        .then(response => {
          let resp = JSON.stringify(response);
          console.log(`Send iChatMessageResponse: ${resp}`);

          for (let sk of Variables.sockets.values()) {
            sk.emit('chat-message', resp);
          }
        });
    } catch (err) {
      console.error(`caught error: ${err}`);
    }
  }
}