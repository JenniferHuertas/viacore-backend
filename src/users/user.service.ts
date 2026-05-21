import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from './enums/roles.enum';

export interface PaginatedUsersResponse {
  data: Users[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface AuthTokenResponse {
  id: string;
  role: Role | undefined;
  login: boolean;
  access_token: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService,
  ) { }

  async findAll(
    page: number = 1,
    limit: number = 5
  ): Promise<PaginatedUsersResponse> {
    const [usuarios, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' }
    }); 
    return {
      data: usuarios,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async findOne(id: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, dataToUpdate: Partial<Users>): Promise<Users | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.usersRepository.update(id, dataToUpdate);
    return await this.usersRepository.findOneBy({ id });
  }

  async completeProfile(id: string, profileData: Partial<Users>): Promise<AuthTokenResponse> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.usersRepository.update(id, {
      ...profileData,
      profileCompleted: true,
    });
    const updatedUser = await this.usersRepository.findOneBy({ id });
    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found after update`);
    }
    const payload = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      profileCompleted: updatedUser.profileCompleted,
    };
    const token = this.jwtService.sign(payload);
    return {
      id: updatedUser.id,
      role: updatedUser.role,
      login: true,
      access_token: token,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
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