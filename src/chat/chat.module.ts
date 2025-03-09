import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { ChatMessage } from '../model/chatMessage.entity';
import { UsersModule } from '../users/users.module';
import { UserGameSessionModule } from '../user-game-session/user-game-session.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([ChatMessage]),
    UsersModule,
    UserGameSessionModule
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {
}