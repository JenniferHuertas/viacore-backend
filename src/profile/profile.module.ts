import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from 'src/users/entities/user.entity';

import { ProfileController } from './profile.controller';

import { ProfileService } from './profile.service';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
    ]),
  ],

  controllers: [
    ProfileController,
  ],

  providers: [
    ProfileService,
  ],
})
export class ProfileModule {}