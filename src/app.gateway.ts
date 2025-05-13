import {
  ConnectedSocket, MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { Variables } from './static/variables';
import { UsersService } from './users/users.service';
import { User } from './model/user.entity';
import { GameSessionService } from './game/game-session.service';
import { GameSession } from './model/gameSession.entity';

interface Tokens {
  jwt: string,
  refreshToken: string
}

interface Response {
  success: boolean,
  jwt: string
}

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {

  constructor(private jwtService: JwtService,
              private authService: AuthService,
              private usersService: UsersService,
              private gameSessionService: GameSessionService) {
  }

  /**
   * Registration is necessary so that server can later send messages to all clients
   * @param client socket of client
   * @param tokens jwt and refresh token
   */

  @SubscribeMessage('register') async handleRegister(
    @ConnectedSocket() client: Socket, @MessageBody() tokens: string): Promise<string> {
    let json: Tokens = JSON.parse(tokens);
    let jwt = json.jwt;

    try {
      this.jwtService.verify(jwt);
    } catch (err) {
      try {
        if (err instanceof TokenExpiredError) {
          jwt = await this.authService.refreshToken(json.refreshToken);
        } else {
          throw new Error(err);
        }
      } catch (err) {
        console.error('register');
        console.error(`Caught error: ${err}`);
        let response: Response = { success: false, jwt: jwt };
        return JSON.stringify(response);
      }
    }

    let decoded: any = this.jwtService.decode(jwt);

    await this.usersService.findOne(decoded.username)
      .then((user: User) => {
        Variables.sockets.set(user.uuid, client);
      })
      .catch(err => console.error(`register: Caught error: ${err}`));


    let response: Response = { success: true, jwt: jwt };
    return JSON.stringify(response);
  }

  @SubscribeMessage('player-offline')
  async handlePlayerOffline(@ConnectedSocket() client: Socket, @MessageBody() hexCode: string): Promise<any> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let gameSessionUuid;

    if (hexCode) {
      let gameSession = await this.gameSessionService.findOneByKey(hexCode);
      gameSessionUuid = gameSession?.uuid;
    } else {
      let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid);
      gameSessionUuid = userGameSession?.gameSessionUuid;
    }

    let gameSession = await this.gameSessionService.findOneByUuid(gameSessionUuid);
    await this.gameSessionService.setPlayerOffline(userUuid, true, gameSession?.uuid ?? '');
    return hexCode;
  }

  @SubscribeMessage('player-online')
  async handlePlayerOnline(@ConnectedSocket() client: Socket, @MessageBody() hexCode: string): Promise<any> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let gameSessionUuid: string | undefined;
    let resultingHexCode: string | undefined = hexCode;

    if (hexCode) {
      let gameSession = await this.gameSessionService.findOneByKey(hexCode);
      gameSessionUuid = gameSession?.uuid;
    } else {
      let userGameSession = await this.gameSessionService.findOneByUserUuid(userUuid);
      gameSessionUuid = userGameSession?.gameSessionUuid;
      resultingHexCode = userGameSession?.gameSession.hexCode;
    }

    if (gameSessionUuid) {
      await this.gameSessionService.setPlayerOffline(userUuid, false, gameSessionUuid);
      return resultingHexCode;
    }
    return '';
  }
}