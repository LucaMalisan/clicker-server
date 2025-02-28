import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './app.gateway';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [AuthModule, UsersModule, ChatModule],
  providers: [AppGateway]
})
export class AppModule {}
