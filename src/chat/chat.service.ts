import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatMessage } from './entities/chat.entity';
import type { DeepPartial } from 'typeorm';
import type { ICreateChatMessage } from './interfaces/create-chat-message.interface';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
  ) {}

async createMessage(data: ICreateChatMessage, userId: string): Promise<ChatMessage> {
    const messagePayload: DeepPartial<ChatMessage> = {
      message: data.message,
      role: 'user',
      isAiGenerated: false,
      sender: { id: userId }, 
      trainingRequest: data.trainingRequestId 
        ? { id: data.trainingRequestId }
        : undefined,
      receiver: data.receiverId 
        ? { id: data.receiverId }
        : undefined,
    };
    return await this.chatMessageRepository.saveMessage(messagePayload);
  }

  async getChatHistory(trainingRequestId: string): Promise<ChatMessage[]> {
    const history = await this.chatMessageRepository.findHistoryByRequestId(trainingRequestId);
    if (!history) {
      throw new NotFoundException(`No se encontró historial para la solicitud ${trainingRequestId}`);
    }
    return history;
  }
}