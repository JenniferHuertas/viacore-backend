import {
  Controller,
  Post,
  Body,
  Get,
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

import { AuthGuard } from '../auth/guards/auth.guard';

import type { ICreateChatMessage } from './interfaces/create-chat-message.interface';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../decorator/roles.decorator';

import { Role } from '../users/enums/roles.enum';

@ApiTags('Chat')

@UseInterceptors(
  ClassSerializerInterceptor,
)

@SerializeOptions({
  groups: ['get', 'Get'],
})

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
    summary:
      'Obtener métricas admin',
  })
  async getAdminStats() {
    return await this.chatService.getAdminStats();
  }

  @Post()
  @ApiBearerAuth('Bearer')
  @ApiOperation({
    summary:
      'Enviar mensaje',
  })
  async createMessage(
    @Body()
    createChatDto: CreateChatDto,

    @Req()
    req: any,
  ): Promise<ChatMessage> {
    const servicePayload: ICreateChatMessage = {
      message:
        createChatDto.message,

      trainingRequestId:
        createChatDto.trainingRequestId,

      receiverId:
        createChatDto.receiverId,

      sessionId:
        createChatDto.sessionId ||
        req['guestSession'],
    };
    let userId: string | undefined = undefined;
    const token = req.cookies?.userSession;
    if (token) {
      try {
        const decoded =
          this.jwtService.decode(
            token,
          ) as {
            id: string;
          };

        userId =
          decoded?.id;
      } catch (error) {
        console.warn(
          'Token inválido',
        );
      }
    }

    return await this.chatService.createMessage(
      servicePayload,
      userId,
    );
  }

  @Get('history')
  @ApiBearerAuth('Bearer')
  @ApiOperation({
    summary:
      'Obtener historial',
  })
  async getMyHistory(
    @Req()
    req: any,
  ): Promise<ChatMessage[]> {
    const token =
      req.cookies?.userSession;

    let userId:
      | string
      | undefined =
      undefined;

    if (token) {
      try {
        const decoded =
          this.jwtService.decode(
            token,
          ) as {
            id: string;
          };

        userId =
          decoded?.id;
      } catch (error) {
        console.warn(
          'Token inválido',
        );
      }
    }

    return await this.chatService.getMyHistory(
      userId,
      req['guestSession'],
    );
  }
}