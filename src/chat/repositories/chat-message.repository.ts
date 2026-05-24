import { Injectable } from '@nestjs/common';
import { DataSource, Repository, DeepPartial } from 'typeorm';
import { ChatMessage } from '../entities/chat.entity';

@Injectable()
export class ChatMessageRepository extends Repository<ChatMessage> {
  constructor(dataSource: DataSource) {
    super(ChatMessage, dataSource.createEntityManager());
  }

async findHistory(userId?: string, sessionId?: string): Promise<ChatMessage[]> {
  const query = this.createQueryBuilder('cm')
    .leftJoinAndSelect('cm.sender', 'sender')
    .orderBy('cm.createdAt', 'ASC');

  if (userId && sessionId) {
    query.where(
      '(sender.id = :userId OR cm.sessionId = :sessionId)',
      { userId, sessionId },
    );
  } else if (userId) {
    query.where('sender.id = :userId', { userId });
  } else if (sessionId) {
    query.where('cm.sessionId = :sessionId', { sessionId });
  }

  return await query.getMany();
}

  async saveMessage(
    messageData: DeepPartial<ChatMessage>,
  ): Promise<ChatMessage> {
    const newMessage = this.create(messageData);

    return await this.save(newMessage);
  }

  async getAdminStatsRaw() {
    const sessionCount =
      await this.createQueryBuilder('cm')
        .select(
          'COUNT(DISTINCT cm.sessionId)',
          'count',
        )
        .where('cm.sessionId IS NOT NULL')
        .getRawOne();

    const conversionData =
      await this.createQueryBuilder('cm')
        .innerJoin(
          'cm.trainingRequest',
          'tr',
        )
        .select(
          'SUM(tr.estimatedPrice)',
          'revenue',
        )
        .addSelect(
          'COUNT(DISTINCT tr.id)',
          'converted',
        )
        .where('cm.sessionId IS NOT NULL')
        .getRawOne();

    return {
      sessionCount,
      conversionData,
    };
  }
}