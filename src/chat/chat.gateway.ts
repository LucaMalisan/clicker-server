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


interface IChatMessage {
  value: string;
  sessionKey: string;
}

/**
 * This class provides websocket routes for the chat feature
 */

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {

  constructor(private chatService: ChatService,
              private userService: UsersService,
              private gameSessionService: GameSessionService) {
  }

  /**
   * Persists a new chat message to the database and sends it back to all clients of the game session
   * @param client
   * @param data - {message: '...', user: '...'}
   */

  @SubscribeMessage('chat-message')
  handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string): void {
    let userUuid = Variables.getUserUuidBySocket(client) as string;

    try {
      if (!userUuid) {
        throw new Error('user uuid could not be found');
      }

      let json: IChatMessage = JSON.parse(data);

      this.gameSessionService.findOneByUserUuidAndKey(userUuid, json.sessionKey)
        .then((userGameSession: UserGameSession) =>
          //add database entry
          this.chatService.save({
            content: json.value,
            gameSessionUuid: userGameSession.gameSession.uuid,
            writtenByUuid: userUuid,
          }))
        .then(async (chatMessage: ChatMessage) => {
          let user = await this.userService.findByUuid(chatMessage.writtenByUuid) as User;

          if (!user?.userName) {
            throw new Error('could not read username');
          }

          //chat message are sent to clients with its content and the username of the author
          let iChatMessageResponse: IChatMessageResponse = {
            message: json.value,
            username: user?.userName,
          };
          return [iChatMessageResponse];
        })
        .then(response => {
          let resp = JSON.stringify(response);

          for (let sk of Variables.sockets.values()) {
            sk.emit('chat-message', resp);
          }
        });
    } catch (err) {
      console.error(`caught error: ${err}`);
    }
  }

  /**
   * Return all chat messages of a game session
   * @param client
   * @param data - {message: '...', user: '...'}
   */

  @SubscribeMessage('get-chat-messages')
  async handleGetChatMessages(@ConnectedSocket() client: Socket, @MessageBody() sessionKey: string): Promise<string> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let gameSession = await this.gameSessionService.findOneByUserUuidAndKey(userUuid, sessionKey);

    if (!gameSession)
      throw new Error('could not find game session');

    // get all chat messages of a game session
    let chatMessages = await this.chatService.findByGameSession(gameSession.gameSessionUuid);
    let chatMessageDTOs: IChatMessageResponse[] = [];

    //generate an array of chat message DTOs
    for (let message of chatMessages) {
      let user = await this.userService.findByUuid(message.writtenByUuid) as User;
      let iChatMessageResponse: IChatMessageResponse = {
        message: message.content,
        username: user?.userName,
      };
      chatMessageDTOs.push(iChatMessageResponse);
    }

    return JSON.stringify(chatMessageDTOs);
  }
}