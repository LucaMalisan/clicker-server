import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../model/chatMessage.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private readonly repo: Repository<ChatMessage>,
  ) {
  }

  async save(message: ChatMessage): Promise<ChatMessage[]> {
    return this.repo.save([message]);
  }
}
