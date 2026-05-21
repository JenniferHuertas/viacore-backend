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
} from '@nestjs/common';
import { 
  UsersService, 
  PaginatedUsersResponse, 
  AuthTokenResponse 
} from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteProfileDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Role } from 'src/auth/roles.enum';
import { Roles } from '../decorator/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Users } from './entities/user.entity';

@ApiBearerAuth('Bearer')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: ['Get'] })
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<PaginatedUsersResponse> { 
    if (limit && page) {
      return this.usersService.findAll(+page, +limit);
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: ['Get'] })
  findOne(@Param('id') id: string): Promise<Users | null> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: ['Get'] })
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto, 
  ): Promise<Users | null> {
    return this.usersService.update(id, { ...updateUserDto });
  }

  @Patch('complete-profile/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: ['Get'] })
  @UseGuards(AuthGuard)
  completeProfile(
    @Param('id') id: string,
    @Body() completeProfileDto: CompleteProfileDto, 
  ): Promise<AuthTokenResponse> { 
    return this.usersService.completeProfile(id, { ...completeProfileDto });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.User)
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string): Promise<{ message: string }> { 
    return this.usersService.remove(id);
  }
}