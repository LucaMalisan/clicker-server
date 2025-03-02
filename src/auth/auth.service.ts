import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../model/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
  }

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new Error('This user doesn\'t exist');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Password is not correct');
    }

    const payload = { sub: user.uuid, username: user.userName };

    return JSON.stringify({
      jwt: await this.jwtService.signAsync(payload, { expiresIn: '1m' }),
      refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    });
  }

  async register(username: string, password: string): Promise<any> {

    if (!username || !password) {
      throw new Error('Username or password can\'t be empty');
    }

    let user = await this.usersService.findOne(username);

    //user shouldn't exist yet
    if (user) {
      throw new Error('User with this e-mail already exists');
    }

    user = new User();
    user.userName = username;
    user.password = await bcrypt.hash(password, 12);
    return this.usersService.save(user);
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    const newPayload = { username: payload.username, sub: payload.sub };
    return this.jwtService.sign(newPayload, { expiresIn: '1m' });
  }
}
