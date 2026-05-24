import {
  Body,
  Controller,
 Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { MeetingsService } from '../services/meetings.service';

import { AvailabilityService } from '../services/availability.service';

import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { RescheduleMeetingDto } from '../dto/reschedule-meeting.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,

    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get('availability')
  async availability(
    @Query('date') date: string,
  ) {
    return this.availabilityService.getAvailability(
      date,
    );
  }

  @Post()
  async create(
    @Body() dto: CreateMeetingDto,
  ) {
    return this.meetingsService.create(
      dto,
    );
  }

  @Get()
  async findAll() {
    return this.meetingsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.meetingsService.findOne(
      id,
    );
  }

  @Delete(':id')
  async cancel(
    @Param('id') id: string,
  ) {
    return this.meetingsService.cancel(
      id,
    );
  }

  @Patch(':id/reschedule')
  async reschedule(
    @Param('id') id: string,

    @Body()
    dto: RescheduleMeetingDto,
  ) {
    return this.meetingsService.reschedule(
      id,
      dto,
    );
  }
}