import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { GeminiService } from './gemini.service';
import { ChatMessage } from './entities/chat.entity';
import { TrainingRequests } from '../training-requests/entities/training-request.entity';
import { Training } from 'src/training/entities/training.entity';
import { AuthModule } from '../auth/auth.module'; // ← verificar este path

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, TrainingRequests, Training]),
    // JwtModule.register({}) ← eliminar esto, ya viene de AuthModule
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatMessageRepository,
    GeminiService,
    // AuthGuard NO debe estar aquí
  ],
  exports: [ChatService],
})
export class ChatModule {}
