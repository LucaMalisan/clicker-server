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
              private usersService: UsersService) {
  }

  /**
   * Registration is necessary so that server can later send messages to all clients
   * @param client socket of client
   * @param tokens jwt and refresh token
   */

  @SubscribeMessage('register') async handleRegister(@ConnectedSocket() client: Socket, @MessageBody() tokens: string): Promise<string> {
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
      .catch(err => console.error(`Caught error: ${err}`));


    let response: Response = { success: true, jwt: jwt };
    return JSON.stringify(response);
  }
}