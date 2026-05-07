/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { Role } from 'src/users/enums/roles.enum';

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
      role: Role.User,
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
      role: foundUser.role,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return {
      id: foundUser.id,
      role: foundUser.role,
      login: true,
      access_token: token,
    };
  }

  async findOrCreateGoogleUser(googleUser: {
    email: string;
    name: string;
    googleId: string;
  }) {
    let user = await this.usersRepository.findOneBy({
      email: googleUser.email,
    });

    if (!user) {
      user = this.usersRepository.create({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        // password queda null, phone/country/address/city quedan vacíos
        phone: 0,
        country: '',
        companyName: '',
        city: '',
        address: '',
      });
      await this.usersRepository.save(user);
    } else if (!user.googleId) {
      // Si el email ya existe pero sin googleId, lo vincula
      user.googleId = googleUser.googleId;
      await this.usersRepository.save(user);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role, // <-- en lugar de isAdmin
    };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return { id: user.id, role: user.role, login: true, access_token: token };
  }
}
