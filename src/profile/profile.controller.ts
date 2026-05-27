import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';

import { ProfileService } from './profile.service';

import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {

  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido correctamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  getProfile(
    @Req() req,
  ) {

    return this.profileService.getProfile(
      req.user.id,
    );
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado correctamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
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