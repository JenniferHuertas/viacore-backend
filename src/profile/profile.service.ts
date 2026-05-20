import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Users } from 'src/users/entities/user.entity';

import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getProfile(
    userId: string,
  ) {

    const user =
      await this.usersRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ) {

    const user =
      await this.usersRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    await this.usersRepository.update(
      userId,
      updateProfileDto,
    );

    return await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
  }
}