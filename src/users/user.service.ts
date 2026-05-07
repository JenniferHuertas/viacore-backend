import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Users } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteProfileDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async findAll(page: number = 1, limit: number = 5) {
    return await this.usersRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.usersRepository.update(id, updateUserDto);

    return await this.usersRepository.findOneBy({ id });
  }

  async completeProfile(
    id: string,
    completeProfileDto: CompleteProfileDto,
  ) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.usersRepository.update(id, {
      ...completeProfileDto,
      profileCompleted: true,
    });

    return await this.usersRepository.findOneBy({ id });
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.usersRepository.update(id, {
      isActive: false,
    });

    return {
      message: `User with id ${id} deactivated successfully`,
    };
  }
}
