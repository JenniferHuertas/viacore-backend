import { Controller, Post, Body, Get, Param, Req, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatMessage } from './entities/chat.entity';
import { ICreateChatMessage } from './interfaces/create-chat-message.interface';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar un nuevo mensaje' })
  @ApiResponse({ status: 201, type: ChatMessage })
  async create(
    @Body() createChatDto: CreateChatDto,
    @Req() req: Request & { user?: { id: string } }
  ): Promise<ChatMessage> {

    const servicePayload: ICreateChatMessage = {
      message: createChatDto.message,
      trainingRequestId: createChatDto.trainingRequestId,
      receiverId: createChatDto.receiverId,
    };
    const userId = req.user?.id;
    return await this.chatService.createMessage(servicePayload, userId);
  }

  @Get('history/:requestId')
  @ApiOperation({ summary: 'Obtener historial por solicitud' })
  async getHistory(
    @Param('requestId', ParseUUIDPipe) requestId: string
  ): Promise<ChatMessage[]> {
    return await this.chatService.getChatHistory(requestId);
  }
}