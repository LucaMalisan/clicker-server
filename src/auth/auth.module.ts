import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthGateway } from './auth.gateway';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '900s' }, //15 minutes until expiration
    }),
  ],
  providers: [AuthService, AuthGateway],
  exports: [AuthService],
})
export class AuthModule {}
