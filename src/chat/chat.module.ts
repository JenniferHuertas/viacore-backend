import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat.entity';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { GeminiService } from './gemini.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage])],
  controllers: [ChatController],
  providers: [ChatService, ChatMessageRepository, GeminiService], 
  exports: [ChatService],
})
export class ChatModule {}