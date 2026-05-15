import { Injectable } from '@nestjs/common';
import { DataSource, Repository,  DeepPartial } from 'typeorm';
import { ChatMessage } from '../entities/chat.entity';

@Injectable()
export class ChatMessageRepository extends Repository<ChatMessage> {
  constructor(dataSource: DataSource) {
    super(ChatMessage, dataSource.createEntityManager());
  }

  async findHistoryByRequestId(trainingRequestId: string): Promise<ChatMessage[]> {
    return await this.find({
      where: { trainingRequest: { id: trainingRequestId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async saveMessage(messageData: DeepPartial<ChatMessage>): Promise<ChatMessage> {
    const newMessage = this.create(messageData);
    return await this.save(newMessage);
  }
}