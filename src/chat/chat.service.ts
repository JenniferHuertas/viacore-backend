import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatMessage } from './entities/chat.entity';
import { GeminiService } from './gemini.service';
import { TrainingRequests } from '../training-requests/entities/training-request.entity';
import type { DeepPartial } from 'typeorm';
import type { ICreateChatMessage } from './interfaces/create-chat-message.interface';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly geminiService: GeminiService,
    @InjectRepository(TrainingRequests)
    private readonly trainingRequestRepository: Repository<TrainingRequests>,
  ) {}

  async createMessage(
    data: ICreateChatMessage,
    userId?: string
  ): Promise<ChatMessage> {
    let currentStatus = `ANONYMOUS`;
    let contextForAi =
      `El usuario es un visitante anónimo. ` +
      `No tiene sesión iniciada en la plataforma corporativa.`;

    if (userId) {
      contextForAi =
        `El usuario tiene la sesión iniciada con el ID: ${userId}.`;
      if (data.trainingRequestId) {
        contextForAi +=
          ` Actualmente visualiza su solicitud ID: ${data.trainingRequestId}.`;
        const trainingRequest =
          await this.trainingRequestRepository.findOne({
            where: { id: data.trainingRequestId },
            relations: [
              `files`,
              `meetings`,
              `payments`,
              `training`,
            ],
          });

        if (trainingRequest) {
          currentStatus = trainingRequest.status;

          const filesCount =
            trainingRequest.files?.length || 0;
          const meetingsCount =
            trainingRequest.meetings?.length || 0;
          const paymentsCount =
            trainingRequest.payments?.length || 0;
          contextForAi +=
            `\n[DATOS REALES DE LA BASE DE DATOS]:\n` +
            `- Estado de la solicitud: ${trainingRequest.status}\n` +
            `- Alumnos previstos: ${trainingRequest.participantsCount}\n` +
            `- Objetivos: "${trainingRequest.objectives}"\n` +
            `- Contexto: "${trainingRequest.context}"\n` +
            `- Precio Cotizado: ${
              trainingRequest.estimatedPrice
                ? `$${trainingRequest.estimatedPrice} ARS`
                : `El precio final está pendiente de asignación`
            }\n` +
            `- Archivos cargados: ${filesCount}\n` +
            `- Reuniones agendadas: ${meetingsCount}\n` +
            `- Movimientos de pago: ${paymentsCount}`;
        } else {
          contextForAi +=
            ` Alerta: El ID de solicitud provisto no existe en la BD.`;
        }
      } else {
        contextForAi +=
          ` El usuario navega libremente por el catálogo general.`;
      }
    }

    const messagePayload: DeepPartial<ChatMessage> = {
      message: data.message,
      role: `user`,
      isAiGenerated: false,
      sender: userId ? { id: userId } : undefined,
      trainingRequest: data.trainingRequestId
        ? { id: data.trainingRequestId }
        : undefined,
      receiver: data.receiverId ? { id: data.receiverId } : undefined,
      sessionId: data.sessionId,
    };
    await this.chatMessageRepository.saveMessage(messagePayload);

    const aiResponseText =
      await this.geminiService.generateResponse(
        data.message,
        currentStatus,
        contextForAi
      );

    const aiMessagePayload: DeepPartial<ChatMessage> = {
      message: aiResponseText,
      role: `assistant`,
      isAiGenerated: true,
      sender: undefined,
      trainingRequest: data.trainingRequestId
        ? { id: data.trainingRequestId }
        : undefined,
      receiver: userId ? { id: userId } : undefined,
      sessionId: data.sessionId,
    };
    return await this.chatMessageRepository.saveMessage(aiMessagePayload);
  }

async getChatHistory(identifier: string): Promise<ChatMessage[]> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(identifier);
    const conditions = isUuid
      ? [
          { trainingRequest: { id: identifier } },
          { sessionId: identifier },
        ]
      : [
          { sessionId: identifier },
        ];

    const history = await this.chatMessageRepository.find({
      where: conditions,
      relations: [`sender`],
      order: { createdAt: `ASC` },
    });
    if (!history || history.length === 0) {
      throw new NotFoundException(
        `No se encontró historial para el identificador: ${identifier}`
      );
    }
    return history;
  }

  async linkAnonymousHistory(
    sessionId: string,
    trainingRequestId: string,
    userId: string
  ): Promise<void> {
    await this.chatMessageRepository.update(
      { sessionId: sessionId },
      {
        trainingRequest: { id: trainingRequestId },
        sender: { id: userId },
      }
    );
  }

  async getAdminStats() : Promise<{
    totalSessions: number;
    totalRevenue: number;
    convertedCount: number;
    conversionRate: number;
  }>{
    const rawData =
      await this.chatMessageRepository.getAdminStatsRaw();
    const totalSessions =
      parseInt(rawData.sessionCount?.count || `0`, 10);
    const totalRevenue =
      parseFloat(rawData.conversionData?.revenue || `0`);
    const convertedCount =
      parseInt(rawData.conversionData?.converted || `0`, 10);
    const conversionRate = totalSessions > 0
      ? parseFloat(
          ((convertedCount / totalSessions) * 100)
            .toFixed(2)
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