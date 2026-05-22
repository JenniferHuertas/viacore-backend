import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; 
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { GeminiService } from './gemini.service';
import { ChatMessage } from './entities/chat.entity';
import { TrainingRequests } from '../training-requests/entities/training-request.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, TrainingRequests]), 
    JwtModule.register({}),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatMessageRepository,
    GeminiService,
  ],
  exports: [ChatService], 
})
export class ChatModule {}