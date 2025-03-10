import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './app.gateway';
import { ChatModule } from './chat/chat.module';
import { UserGameSessionService } from './user-game-session/user-game-session.service';
import { UserGameSessionModule } from './user-game-session/user-game-session.module';
import { GameSessionModule } from './game-session/game-session.module';

@Module({
  imports: [AuthModule, UsersModule, ChatModule, UserGameSessionModule, GameSessionModule],
  providers: [AppGateway]
})
export class AppModule {}
