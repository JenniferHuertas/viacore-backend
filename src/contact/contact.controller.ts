import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { ContactService } from './contact.service';

import { ContactDto } from './dto/contact.dto';

import { AuthGuard } from '../auth/guards/auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../decorator/roles.decorator';

import { Role } from '../users/enums/roles.enum';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
  ) {}

  @Post()
  async create(
    @Body()
    contactDto: ContactDto,
  ) {
    return await this.contactService.create(
      contactDto,
    );
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAll() {
    return await this.contactService.findAll();
  }
}