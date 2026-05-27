import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { LinkHistoryDto } from './dto/history-chat.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { ICreateChatMessage } from './interfaces/create-chat-message.interface';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { Role } from '../users/enums/roles.enum';

@ApiTags('Chat')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ groups: [`get`, `Get`] })
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('admin/stats')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard) 
  @ApiBearerAuth('Bearer')
  @ApiOperation({
    summary: `Obtener métricas de conversión financieras y de uso (Solo Admin)`,
  })
  async getAdminStats() {
    return await this.chatService.getAdminStats();
  }

  @Post()
  @ApiBearerAuth('Bearer')
  @ApiOperation({
    summary: `Enviar un nuevo mensaje (Soporta anónimos y logueados)`,
  })
  async createMessage(
    @Body()
    createChatDto: CreateChatDto,
    @Req()
    req: any,
  ): Promise<ChatMessage> {
    const servicePayload: ICreateChatMessage = {
      message: createChatDto.message,
      trainingRequestId: createChatDto.trainingRequestId,
      receiverId: createChatDto.receiverId,
      sessionId: createChatDto.sessionId,
    };
    let userId: string | undefined = undefined;
    const token = req.cookies?.userSession;
    if (token) {
      try {
        const decoded =
          this.jwtService.decode(token) as { id: string };
        userId = decoded?.id;
      } catch (error) {
        console.warn(`Token no válido en modo silencioso`);
      }
    }
    return await this.chatService.createMessage(
      servicePayload,
      userId,
    );
  }

  @Get('history/:identifier')
  @ApiBearerAuth('Bearer')
  @ApiOperation({
    summary: `Obtiene el historial mediante ID de solicitud o sessionId`,
  })
  async getChatHistory(
    @Param('identifier')
    identifier: string,
  ): Promise<ChatMessage[]> {
    return await this.chatService.getChatHistory(identifier);
  }

  @Patch('link-history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({
    summary: `Une el historial anónimo acumulado a una cuenta real`,
  })
  async linkAnonymousHistory(
    @Body()
    linkHistoryDto: LinkHistoryDto,
    @Req()
    req: any,
  ) {
    const userId = req.user.id;
    await this.chatService.linkAnonymousHistory(
      linkHistoryDto.sessionId,
      linkHistoryDto.trainingRequestId,
      userId,
    );
    return { message: `Historial unificado de forma exitosa.` };
  }
}