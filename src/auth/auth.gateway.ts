import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AuthService } from './auth.service';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AuthGateway {

  constructor(private authService: AuthService) {
  }

  /**
   * Registration of new user
   * @param client
   * @param user
   */

  @SubscribeMessage('register-user') async handleRegister(@ConnectedSocket() client: Socket, @MessageBody() user: string) {
    let registerDto = JSON.parse(user);

    try {
      await this.authService.register(registerDto.userName, registerDto.password);
      client.emit('registration-successful', '');
    } catch (err) {
      console.log(err);
      return err.message;
    }
  }

  /**
   * Login of user
   * @param client
   * @param user
   */

  @SubscribeMessage('login-user')
  async handleLogin(@ConnectedSocket() client: Socket, @MessageBody() user: string) {
    let registerDto = JSON.parse(user);

    try {
      let jwt = await this.authService.signIn(registerDto.userName, registerDto.password);

      client.emit('login-successful', jwt);
    } catch (err) {
      console.log(`Caught error: ${err}`);
      return err.message;
    }
  }
}