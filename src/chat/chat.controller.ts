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
    @Req() req: any 
    /*@Req() req: { user: { id: string } }*/
  ): Promise<ChatMessage> {

    const servicePayload: ICreateChatMessage = {
      message: createChatDto.message,
      trainingRequestId: createChatDto.trainingRequestId,
      receiverId: createChatDto.receiverId,
    };
    const userId = req.user?.id || '56c59e62-3cf6-4410-80ae-9a5cd4ede14c';
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