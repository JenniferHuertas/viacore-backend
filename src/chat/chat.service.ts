import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatMessage } from './entities/chat.entity';
import type { DeepPartial } from 'typeorm';
import type { ICreateChatMessage } from './interfaces/create-chat-message.interface';
import { GeminiService } from './gemini.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly geminiService: GeminiService,
  ) {}

  async createMessage(
    data: ICreateChatMessage, userId?: string
  ): Promise<ChatMessage> {
    let contextForAi = "El usuario es un visitante anónimo. No tiene sesión iniciada.";
    if (userId) {
      const hasQuotes = false; 
      contextForAi = hasQuotes 
        ? "El usuario está logueado y tiene cotizaciones activas en el sistema." 
        : "El usuario está logueado pero NO tiene cotizaciones aún.";
    }
    const messagePayload: DeepPartial<ChatMessage> = {
      message: data.message,
      role: 'user',
      isAiGenerated: false,
      sender: userId ? { id: userId } : undefined,
      trainingRequest: data.trainingRequestId ? 
      { id: data.trainingRequestId } : undefined,
      receiver: data.receiverId ? { id: data.receiverId } : undefined,
    };
    await this.chatMessageRepository.saveMessage(messagePayload);
    const aiResponseText = await this.geminiService.generateResponse(data.message, contextForAi);
    const aiMessagePayload: DeepPartial<ChatMessage> = {
      message: aiResponseText,
      role: 'assistant',
      isAiGenerated: true, 
      sender: userId ? { id: userId } : undefined,
      trainingRequest: data.trainingRequestId ? 
      { id: data.trainingRequestId } : undefined,
      receiver: data.receiverId ? { id: data.receiverId } : undefined,
    };
    return await this.chatMessageRepository.saveMessage(aiMessagePayload);
  }

  async getChatHistory(trainingRequestId: string): Promise<ChatMessage[]> {
    const history = await this.chatMessageRepository.findHistoryByRequestId(trainingRequestId);
    if (!history) {
      throw new NotFoundException(`No se encontró historial para la solicitud ${trainingRequestId}`);
    }
    return history;
  }
}