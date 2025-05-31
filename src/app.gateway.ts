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

interface Tokens {
  jwt: string,
  refreshToken: string
}

interface Response {
  success: boolean,
  jwt: string
}

/**
 * This class provides global routes to handle the connection between client and server
 */

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {

  constructor(private jwtService: JwtService,
              private authService: AuthService,
              private usersService: UsersService,
              private gameSessionService: GameSessionService) {
  }

  /**
   * Registration of the client is necessary so that server can later send messages to all clients
   * @param client socket of client
   * @param tokens jwt and refresh token
   */

  @SubscribeMessage('register') async handleRegister(
    @ConnectedSocket() client: Socket, @MessageBody() tokens: string): Promise<string> {
    let json: Tokens = JSON.parse(tokens);
    let jwt = json.jwt;

    try {
      //check if user is authenticated
      this.jwtService.verify(jwt);
    } catch (err) {
      try {
        if (err instanceof TokenExpiredError) {
          //jwt is expired, try to refresh it with refreshToken
          jwt = await this.authService.refreshToken(json.refreshToken);
        } else {
          //refreshing didn't work
          throw new Error(err);
        }
      } catch (err) {
        console.error(`Caught error: ${err}`);
        let response: Response = { success: false, jwt: jwt };
        return JSON.stringify(response);
      }
    }

    //decoded jwt contains information about the user
    let decoded: any = this.jwtService.decode(jwt);

    await this.usersService.findOne(decoded.username)
      .then((user: User) => {
        // add new entry to map user socket to useruuid
        // this can be used to identify the user by its socket without needing to decode the jwt every time
        Variables.sockets.set(user.uuid, client);
      })
      .catch(err => console.error(`Caught error: ${err}`));


    let response: Response = { success: true, jwt: jwt };
    return JSON.stringify(response);
  }

  /**
   * This method is called when the client wants to indicate the user unloaded the page
   * @param client
   * @param hexCode
   */

  @SubscribeMessage('player-offline')
  async handlePlayerOffline(@ConnectedSocket() client: Socket, @MessageBody() hexCode: string): Promise<any> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let gameSession = await this.gameSessionService.findOneByKey(hexCode);

    if (!gameSession) {
      throw new Error('No active game session found');
    }

    if (!userUuid) {
      throw new Error('user uuid could not be found');
    }

    // set player to offline in database
    await this.gameSessionService.setPlayerOffline(userUuid, true, gameSession?.uuid ?? '');
    return hexCode;
  }

  /**
   * This method is called when the client wants to indicate the user (re-)entered the game
   * @param client
   * @param hexCode
   */

  @SubscribeMessage('player-online')
  async handlePlayerOnline(@ConnectedSocket() client: Socket, @MessageBody() hexCode: string): Promise<any> {
    let userUuid = Variables.getUserUuidBySocket(client) as string;
    let gameSession = await this.gameSessionService.findOneByKey(hexCode);

    if (!userUuid) {
      throw new Error('user uuid could not be found');
    }

    if (gameSession) {
      // set player to online in database
      await this.gameSessionService.setPlayerOffline(userUuid, false, gameSession.uuid);
      return hexCode;
    }
    return '';
  }
}