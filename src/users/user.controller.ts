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
  ForbiddenException,
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

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

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
    @Query('page')
    page: string,

    @Query('limit')
    limit: string,
  ) {

    if (
      limit &&
      page
    ) {

      return this.usersService.findAll(
        +page,
        +limit,
      );
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

  @UseGuards(AuthGuard)

  async findOne(
    @Param('id')
    id: string,

    @Req()
    req: Request,
  ) {

    const user =
      (req as any).user;

    const isAdmin =
      user.role === Role.Admin;

    const isOwner =
      user.id === id;

    if (
      !isAdmin &&
      !isOwner
    ) {

      throw new ForbiddenException(
        'No tienes permisos para acceder a este usuario.',
      );
    }

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
    @Req()
    req: Request,

    @Body()
    completeProfileDto: CompleteProfileDto,

    @Res({ passthrough: true })
    res: Response,
  ) {

    const userId =
      (req as any).user.id;

    const result =
      await this.usersService.completeProfile(
        userId,
        completeProfileDto,
      );

    res.cookie(
      'userSession',
      result.access_token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === 'production',

        sameSite:
          process.env.NODE_ENV === 'production'
            ? 'none'
            : 'lax',

        maxAge:
          1000 * 60 * 60,

        path: '/',
      },
    );

    return result;
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