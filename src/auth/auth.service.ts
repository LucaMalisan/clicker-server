import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
      throw new NotFoundException('This user doesn\'t exist');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Password is not correct');
    }

    const payload = { sub: user.uuid, username: user.userName };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(username: string, password: string): Promise<any> {

    if (!username || !password) {
      throw new BadRequestException('Username or password can\'t be empty');
    }

    let user = await this.usersService.findOne(username);

    //user shouldn't exist yet
    if (user) {
      throw new BadRequestException('User with this e-mail already exists');
    }

    user = new User();
    user.userName = username;
    user.password = await bcrypt.hash(password, 12);
    return this.usersService.save(user);
  }
}
