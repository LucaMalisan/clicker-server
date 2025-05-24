import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../model/user.entity';

/**
 * This service provides DB queries for handling authentificatin of users
 */

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
  }

  /**
   *
   * @param username
   * @param password
   */

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    //sign-in requires an already existing user
    if (!user) {
      throw new Error('This user doesn\'t exist');
    }

    //comparison of given and original password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Password is not correct');
    }

    //payload used to generate the jwt
    const payload = { sub: user.uuid, username: user.userName };

    //the client will be able to renew the jwt with the refresh token
    return JSON.stringify({
      jwt: await this.jwtService.signAsync(payload, { expiresIn: '10m' }),
      refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    });
  }

  async register(username: string, password: string): Promise<any> {
    if (!username || !password) {
      throw new Error('Username or password can\'t be empty');
    }

    //add new user entry to the database
    return this.usersService.create({
      userName: username,
      password: await bcrypt.hash(password, 12),
    });
  }

  //generates a new jwt using the refresh token
  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    const newPayload = { username: payload.username, sub: payload.sub };
    return this.jwtService.sign(newPayload, { expiresIn: '10m' });
  }
}
