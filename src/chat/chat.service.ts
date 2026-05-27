import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatMessage } from './entities/chat.entity';
import { GeminiService } from './gemini.service';
import { TrainingRequests } from '../training-requests/entities/training-request.entity';
import { Training } from '../training/entities/training.entity';
import { RequestStatus } from '../training-requests/enums/requests-status.enum';
import type { DeepPartial } from 'typeorm';
import type { ICreateChatMessage } from './interfaces/create-chat-message.interface';

const STATUS_DETAILS: Record<string, { explanation: string; nextStep: string }> = {
  [RequestStatus.PENDING]: {
    explanation: 'Pendiente de asignación.',
    nextStep: 'Esperar a que un asesor de Viacore tome tu solicitud para revisarla.',
  },
  [RequestStatus.IN_REVIEW]: {
    explanation: 'En revisión.',
    nextStep: 'Nuestro equipo está evaluando los requerimientos de tu empresa. Te notificaremos pronto.',
  },
  [RequestStatus.AWAITING_PAYMENT]: {
    explanation: 'Esperando pago.',
    nextStep: 'Debes proceder a realizar el pago en la sección de facturación para poder agendar las clases.',
  },
  [RequestStatus.SCHEDULED]: {
    explanation: 'Agendada / Programada.',
    nextStep: 'Las fechas ya están asignadas. El siguiente paso es esperar el día de inicio de la capacitación.',
  },
  [RequestStatus.CONFIRMED]: {
    explanation: 'Confirmada y en curso.',
    nextStep: 'Tu capacitación ya está activa. Puedes acceder a las clases desde tu perfil.',
  },
  [RequestStatus.CANCELLED]: {
    explanation: 'Cancelada.',
    nextStep: 'Esta solicitud fue cancelada. Si fue un error, puedes crear una nueva solicitud.',
  },
};

@Injectable()
export class ChatService {

  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly geminiService: GeminiService,

    @InjectRepository(TrainingRequests)
    private readonly trainingRequestRepository: Repository<TrainingRequests>,

    @InjectRepository(Training)
    private readonly trainingRepository: Repository<Training>,
  ) { }

  async createMessage(
    data: ICreateChatMessage,
    userId?: string,
  ): Promise<ChatMessage> {

    const globalTrainings = await this.trainingRepository.find({
      where: { isActive: true }
    });

    const catalogText = globalTrainings
      .map(c =>
        `- **Curso**: ${c.title}\n` +
        `  **Categoría**: ${c.category}\n` +
        `  **Eslogan**: ${c.tagline}\n` +
        `  **Resumen**: ${c.shortDescription}\n` +
        `  **Descripción completa**: ${c.description}\n` +
        `  **¿Qué incluye?**: ${c.includes && c.includes.length > 0 ? c.includes.join(', ') : 'Información a consultar en la reunión'}`
      )
      .join('\n\n');

    let currentStatus = `VISITOR_ANONYMOUS`; 
    let contextForAi = `[CATÁLOGO DE CAPACITACIONES DISPONIBLES EN LA PLATAFORMA]:\n${catalogText}\n\n`;

    if (!userId) {
      currentStatus = `ANÓNIMO (Sin iniciar sesión)`;
      contextForAi += `El usuario es un visitante anónimo. No tiene sesión iniciada en la plataforma corporativa.`;
    } else {
      currentStatus = `AUTENTICADO_SIN_SOLICITUD`;
      const userTrainingRequest =
        await this.trainingRequestRepository.findOne({
          where: {
            user: {
              id: userId,
            },
          },
          relations: ['training'],
          order: {
            createdAt: 'DESC',
          },
        });
      if (userTrainingRequest) {
        data.trainingRequestId = userTrainingRequest.id;
      }
      contextForAi += `El usuario tiene la sesión iniciada correctamente con el ID: ${userId}, pero aún no cuenta con una solicitud de capacitación activa.`;

      if (data.trainingRequestId) {
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.trainingRequestId);
        if (isValidUuid) {
          contextForAi += ` Actualmente visualiza su solicitud ID: ${data.trainingRequestId}.`;
          const trainingRequest =
            await this.trainingRequestRepository.findOne({
              where: { id: data.trainingRequestId },
              relations: [`files`, `meetings`, `payments`, `training`],
            });
          if (trainingRequest) {
            currentStatus = trainingRequest.status;
            const statusInfo = STATUS_DETAILS[trainingRequest.status] || {
              explanation: trainingRequest.status,
              nextStep: 'Contactar con soporte para más información.'
            };
            const filesCount = trainingRequest.files?.length || 0;
            const meetingsCount = trainingRequest.meetings?.length || 0;
            const paymentsCount = trainingRequest.payments?.length || 0;

            contextForAi +=
              `\n[DATOS REALES DE LA BASE DE DATOS]:\n` +
              `- Estado de la solicitud (Código): ${trainingRequest.status}\n` +
              `- Estado de la solicitud (Explicación humana): ${statusInfo.explanation}\n` +
              `- PRÓXIMO PASO QUE DEBE SEGUIR EL USUARIO: ${statusInfo.nextStep}\n` +
              `- Alumnos previstos: ${trainingRequest.participantsCount}\n` +
              `- Objetivos: "${trainingRequest.objectives}"\n` +
              `- Contexto: "${trainingRequest.context}"\n` +
              `- Precio Cotizado: ${trainingRequest.estimatedPrice
                ? `$${trainingRequest.estimatedPrice} ARS`
                : `El precio final está pendiente de asignación`
              }\n` +
              `- Archivos cargados: ${filesCount}\n` +
              `- Reuniones agendadas: ${meetingsCount}\n` +
              `- Movimientos de pago: ${paymentsCount}`;
          } else {
            contextForAi += ` Alerta: El ID de solicitud provisto no existe en la BD.`;
          }
        } else {
          contextForAi += ` El usuario está logueado pero no se encuentra visualizando ninguna solicitud válida en este momento.`;
        }
      } else {
        contextForAi += ` El usuario navega libremente por la plataforma con su sesión iniciada, pero no ha creado ninguna solicitud todavía.`;
      }
    }

    const normalizedMessage = data.message.toLowerCase();
    const askingForStatus =
      normalizedMessage.includes(`estado`) ||
      normalizedMessage.includes(`solicitud`) ||
      normalizedMessage.includes(`como va`) ||
      normalizedMessage.includes(`cómo va`) ||
      normalizedMessage.includes(`avance`) ||
      normalizedMessage.includes(`siguiente paso`) ||
      normalizedMessage.includes(`pendiente`);

    if (askingForStatus) {
      if (!userId) {
        contextForAi += `\n[INSTRUCCIÓN PRIORITARIA]: El usuario pregunta por un estado pero no está logueado. Dile amablemente que debe iniciar sesión para ver estados de solicitudes.`;
      } else if (currentStatus === `AUTENTICADO_SIN_SOLICITUD`) {
        contextForAi += `\n[INSTRUCCIÓN PRIORITARIA]: El usuario está logueado pero PREGUNTA POR SU ESTADO Y NO TIENE SOLICITUDES CREADAS. Explícale claramente que su sesión está iniciada de forma exitosa, pero que aún no registra ninguna solicitud de capacitación, e invítalo amablemente a crear una desde el panel principal.`;
      } else {
        contextForAi += `\n[INSTRUCCIÓN PRIORITARIA]: El usuario está preguntando por el estado de su solicitud activa. Debes responderle usando la 'Explicación humana' y decirle claramente cuál es su 'PRÓXIMO PASO' basándote en los datos de la base de datos.`;
      }
    }

    const messagePayload: DeepPartial<ChatMessage> = {
      message: data.message,
      role: `user`,
      isAiGenerated: false,
      sender: userId ? { id: userId } : undefined,
      trainingRequest: data.trainingRequestId ? { id: data.trainingRequestId } : undefined,
      receiver: data.receiverId ? { id: data.receiverId } : undefined,
      sessionId: data.sessionId,
    };

    await this.chatMessageRepository.saveMessage(messagePayload);
    const aiResponseText = await this.geminiService.generateResponse(
      data.message,
      currentStatus,
      contextForAi,
    );
    const aiMessagePayload: DeepPartial<ChatMessage> = {
      message: aiResponseText,
      role: `assistant`,
      isAiGenerated: true,
      sender: undefined,
      trainingRequest: data.trainingRequestId ? { id: data.trainingRequestId } : undefined,
      receiver: userId ? { id: userId } : undefined,
      sessionId: data.sessionId,
    };
    return await this.chatMessageRepository.saveMessage(aiMessagePayload);
  }

  async getChatHistory(identifier: string): Promise<ChatMessage[]> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const conditions = isUuid
      ? [{ trainingRequest: { id: identifier } }, { sessionId: identifier }]
      : [{ sessionId: identifier }];

    const history = await this.chatMessageRepository.find({
      where: conditions,
      relations: [`sender`],
      order: { createdAt: `ASC` },
    });
    if (!history || history.length === 0) {
      return [];
    }
    return history;
  }

  async linkAnonymousHistory(sessionId: string, trainingRequestId: string, userId: string): Promise<void> {
    await this.chatMessageRepository.update(
      { sessionId: sessionId },
      { trainingRequest: { id: trainingRequestId }, sender: { id: userId } },
    );
  }

  async getAdminStats(): Promise<{ totalSessions: number; totalRevenue: number; convertedCount: number; conversionRate: number }> {
    const rawData = await this.chatMessageRepository.getAdminStatsRaw();
    const totalSessions = parseInt(rawData.sessionCount?.count || `0`, 10);
    const totalRevenue = parseFloat(rawData.conversionData?.revenue || `0`);
    const convertedCount = parseInt(rawData.conversionData?.converted || `0`, 10);
    const conversionRate = totalSessions > 0 ? parseFloat(((convertedCount / totalSessions) * 100).toFixed(2)) : 0;

    return { totalSessions, totalRevenue, convertedCount, conversionRate };
  }
}