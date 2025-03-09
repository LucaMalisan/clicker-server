import {
  ConnectedSocket, MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { Variables } from './static/variables';

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
              private authService: AuthService) {
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

      if (err instanceof TokenExpiredError) {
        console.log('generate new token');
        jwt = await this.authService.refreshToken(json.refreshToken);
      } else {
        console.error(err);
        let response: Response = { success: false, jwt: jwt };
        return JSON.stringify(response);
      }
    }

    let response: Response = { success: true, jwt: jwt };
    return JSON.stringify(response);
  }
}