import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meetings } from './entities/meeting.entity';
import { CalendlyService } from 'src/calendly/calendly.service';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService],
  imports: [TypeOrmModule.forFeature([Meetings]), CalendlyService]
})
export class MeetingsModule {}
