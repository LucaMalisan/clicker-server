import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../model/chatMessage.entity';
import { User } from '../model/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private readonly repo: Repository<ChatMessage>,
  ) {
  }

  async save(payload: any): Promise<ChatMessage> {
    let result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(ChatMessage)
      .values(payload)
      .returning('*')
      .execute();

    return result.raw[0] as ChatMessage;
  }

  async findByGameSession(gameSessionUuid: string): Promise<ChatMessage[]> {
    return this.repo.find({
      where: {
        gameSessionUuid: gameSessionUuid,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
