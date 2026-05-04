import {
  BadRequestException,
  Injectable,
  // UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Users } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const foundUser = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });

    if (foundUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);

    return savedUser;
  }

  async signIn(credentials: LoginUserDto) {
    const foundUser = await this.usersRepository.findOneBy({
      email: credentials.email,
    });

    if (!foundUser) {
      throw new BadRequestException('Bad credentials');
    }
    const matchingPassword = await bcrypt.compare(
      credentials.password,
      foundUser.password,
    );

    if (!matchingPassword) throw new BadRequestException('Bad credentials');

    const payload = {
      id: foundUser.id,
      email: foundUser.email,
      isAdmin: foundUser.isAdmin,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return { login: true, access_token: token };
  }
}
