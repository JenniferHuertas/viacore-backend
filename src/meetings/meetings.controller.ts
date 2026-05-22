import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { MeetingsService } from './meetings.service';

import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/auth/roles.enum';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('Bearer')
@ApiTags('Meetings')
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(createMeetingDto);
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  findAll() {
    return this.meetingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  // NestJS recibe parámetros de ruta como string.
  // La conversión manual evita errores de tipado.
  @Get('/disponibilidad/:fecha')
  findDisponibilidad(@Param('fecha') fecha: string) {
    return this.meetingsService.findDisponibilidad(fecha);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ) {
    return this.meetingsService.update(id, updateMeetingDto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.meetingsService.cancel(id);
  }
}