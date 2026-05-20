import {
  Controller,
  Get,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ClassSerializerInterceptor,
  SerializeOptions,
  UseInterceptors,
  Res,
  Req,
} from '@nestjs/common';

import type {
  Request,
  Response,
} from 'express';

import { JwtService } from '@nestjs/jwt';

import { UsersService } from './user.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteProfileDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Role } from 'src/auth/roles.enum';
import { Roles } from '../decorator/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('Bearer')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @UseInterceptors(
    ClassSerializerInterceptor,
  )
  @SerializeOptions({
    groups: ['Get'],
  })
  @Roles(Role.Admin)
  @UseGuards(
    AuthGuard,
    RolesGuard,
  )
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) { 
    if (limit && page) {
      return this.usersService.findAll(+page, +limit);
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseInterceptors(
    ClassSerializerInterceptor,
  )
  @SerializeOptions({
    groups: ['Get'],
  })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.usersService.findOne(
      id,
    );
  }

  @Put(':id')
  @UseInterceptors(
    ClassSerializerInterceptor,
  )
  @SerializeOptions({
    groups: ['Get'],
  })
  @UseGuards(AuthGuard)
  update(
    @Param('id')
    id: string,

    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(
      id,
      updateUserDto,
    );
  }

  @Patch('complete-profile')
  @UseInterceptors(
    ClassSerializerInterceptor,
  )
  @SerializeOptions({
    groups: ['Get'],
  })
  @UseGuards(AuthGuard)
  async completeProfile(
    @Req() req: Request,

    @Body()
    completeProfileDto: CompleteProfileDto,

    @Res({ passthrough: true })
    res: Response,
  ) {
    const userId =
      (req as any).user.id;

    const updatedUser =
      await this.usersService.completeProfile(
        userId,
        completeProfileDto,
      );

    if (!updatedUser) {
      throw new Error(
        'User not found after profile update',
      );
    }

    const payload = {
      id: updatedUser.id,

      email: updatedUser.email,

      role: updatedUser.role,

      profileCompleted: true,
    };

    const token =
      this.jwtService.sign(
        payload,
        {
          expiresIn: '1h',
        },
      );

    res.cookie(
      'userSession',
      token,
      {
        httpOnly: true,

        secure: false,

        sameSite: 'lax',

        maxAge:
          1000 * 60 * 60,
      },
    );

    return updatedUser;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(
    Role.Admin,
    Role.User,
  )
  @UseGuards(
    AuthGuard,
    RolesGuard,
  )
  remove(
    @Param('id')
    id: string,
  ) {
    return this.usersService.remove(
      id,
    );
  }
}