import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './app.gateway';
import { ChatModule } from './chat/chat.module';
import { GameSessionModule } from './game/game-session.module';
import { EffectsModule } from './game/effects/effect.module';

@Module({
  imports: [AuthModule, UsersModule, ChatModule, GameSessionModule, EffectsModule],
  providers: [AppGateway]
})
export class AppModule {}
