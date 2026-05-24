import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatMessage } from './entities/chat.entity';
import { GeminiService } from './gemini.service';
import { TrainingRequests } from '../training-requests/entities/training-request.entity';
import { Users } from '../users/entities/user.entity';
import type { DeepPartial } from 'typeorm';
import type { ICreateChatMessage } from './interfaces/create-chat-message.interface';
@Injectable()
export class ChatService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly geminiService: GeminiService,
    @InjectRepository(TrainingRequests)
    private readonly trainingRequestRepository: Repository<TrainingRequests>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}


  async createMessage(
    data: ICreateChatMessage,
    userId?: string,
  ): Promise<ChatMessage> {
    let currentStatus =
      userId
        ? 'AUTHENTICATED'
        : 'ANONYMOUS';


    let contextForAi =
      'El usuario es un visitante anónimo.';
    let activeTrainingRequestId =
      data.trainingRequestId && data.trainingRequestId.trim() !== ''
        ? data.trainingRequestId
        : undefined;


    if (
      userId &&
      !activeTrainingRequestId
    ) {
      const latestRequest =
        await this.trainingRequestRepository.findOne({
          where: {
            user: {
              id: userId,
            },
          },
          order: {
            createdAt: 'DESC',
          },
        });


      if (latestRequest) {
        activeTrainingRequestId =
          latestRequest.id;
      }
    }
    const trainingRelation =
      activeTrainingRequestId
        ? { id: activeTrainingRequestId }
        : undefined;
    if (userId) {
      contextForAi =
        `El usuario tiene sesión iniciada. ID: ${userId}`;


      if (activeTrainingRequestId) {
        const trainingRequest =
          await this.trainingRequestRepository.findOne({
            where: {
              id: activeTrainingRequestId,
            },
            relations: [
              'files',
              'meetings',
              'payments',
              'training',
            ],
          });


        if (trainingRequest) {
          currentStatus =
            trainingRequest.status;


          contextForAi +=
            `\nEstado solicitud: ${trainingRequest.status}`;
        }
      }
    }


    const userMessagePayload: DeepPartial<ChatMessage> = {
      message: data.message,
      role: 'user',
      isAiGenerated: false,
      sender: userId
        ? { id: userId }
        : undefined,
      trainingRequest: trainingRelation
        ? {
            id: activeTrainingRequestId,
          }
        : undefined,
      receiver: data.receiverId
        ? {
            id: data.receiverId,
          }
        : undefined,
      sessionId: data.sessionId,
    };
    await this.chatMessageRepository.saveMessage(
      userMessagePayload,
    );
    const previousMessages =
      await this.chatMessageRepository.findHistory(
        userId,
        data.sessionId,
      );
    const formattedHistory =
      previousMessages.map(
        (message) => ({
          role:
            message.role ===
            'assistant'
              ? 'assistant'
              : 'user',


          content:
            message.message,
        }),
      );
    let aiResponseText =
      'Lo siento, ocurrió un error temporal.';
    try {
      aiResponseText =
        await this.geminiService.generateResponse(
          data.message,
          currentStatus,
          contextForAi,
          formattedHistory,
        );
    } catch (error) {
      console.error(
        'ERROR IA:',
        error,
      );
    }


    const aiMessagePayload: DeepPartial<ChatMessage> = {
      message: aiResponseText,
      role: 'assistant',
      isAiGenerated: true,
      receiver: userId
        ? { id: userId }
        : undefined,
      trainingRequest: trainingRelation
        ? {
            id: activeTrainingRequestId,
          }
        : undefined,


      sessionId: data.sessionId,
    };


    return await this.chatMessageRepository.saveMessage(
      aiMessagePayload,
    );
  }


  async getMyHistory(
    userId?: string,
    sessionId?: string,
  ): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.findHistory(
      userId,
      sessionId,
    );
  }


  async getAdminStats(): Promise<{
    totalSessions: number;
    totalRevenue: number;
    convertedCount: number;
    conversionRate: number;
  }> {
    const rawData =
      await this.chatMessageRepository.getAdminStatsRaw();


    const totalSessions =
      parseInt(
        rawData.sessionCount?.count || '0',
        10,
      );


    const totalRevenue =
      parseFloat(
        rawData.conversionData?.revenue || '0',
      );


    const convertedCount =
      parseInt(
        rawData.conversionData?.converted || '0',
        10,
      );


    const conversionRate =
      totalSessions > 0
        ? parseFloat(
            (
              (convertedCount /
                totalSessions) *
              100
            ).toFixed(2),
          )
        : 0;


    return {
      totalSessions,
      totalRevenue,
      convertedCount,
      conversionRate,
    };
  }
}
