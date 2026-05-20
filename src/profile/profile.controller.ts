import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from 'src/auth/guards/auth.guard';

import { ProfileService } from './profile.service';

import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {

  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get('me')
  getProfile(
    @Req() req,
  ) {

    return this.profileService.getProfile(
      req.user.id,
    );
  }

  @Patch('me')
  updateProfile(
    @Req() req,

    @Body()
    updateProfileDto: UpdateProfileDto,
  ) {

    return this.profileService.updateProfile(
      req.user.id,
      updateProfileDto,
    );
  }
}