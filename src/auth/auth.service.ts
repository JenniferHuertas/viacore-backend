/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { Repository } from 'typeorm';

import { Users } from 'src/users/entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';

import {
  CreateUserDto,
  LoginUserDto,
} from 'src/users/dto/create-user.dto';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { Role } from 'src/users/enums/roles.enum';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { UserRegisteredEvent } from 'src/notifications/events/user-registered.event';

import { UserLoggedInEvent } from 'src/notifications/events/user-logged-in.event';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    private readonly jwtService: JwtService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ) {
    const foundUser =
      await this.usersRepository.findOneBy({
        email: createUserDto.email,
      });

    if (foundUser) {
      throw new BadRequestException(
        'El usuario ya existe',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        createUserDto.password,
        10,
      );

    const newUser =
      this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        role: Role.User,
      });

    const savedUser =
      await this.usersRepository.save(
        newUser,
      );

    this.eventEmitter.emit(
      'user.registered',

      new UserRegisteredEvent(
        savedUser.id,
        savedUser.email,
        savedUser.name,
      ),
    );

    return savedUser;
  }

  async signIn(
    credentials: LoginUserDto,
  ) {
    const foundUser =
      await this.usersRepository.findOneBy({
        email: credentials.email,
      });

    if (!foundUser) {
      throw new BadRequestException(
        'Credenciales inválidas',
      );
    }

    const matchingPassword =
      await bcrypt.compare(
        credentials.password,
        foundUser.password,
      );

    if (!matchingPassword) {
      throw new BadRequestException(
        'Credenciales inválidas',
      );
    }

    const payload = {
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
      profileCompleted:
        foundUser.profileCompleted,
    };

    const token =
      this.jwtService.sign(payload, {
        expiresIn: '1h',
      });

    this.eventEmitter.emit(
      'user.logged-in',

      new UserLoggedInEvent(
        foundUser.id,
        foundUser.email,
        foundUser.name,
      ),
    );

    return {
      id: foundUser.id,
      role: foundUser.role,
      login: true,
      access_token: token,
    };
  }

  async findOrCreateGoogleUser(
    googleUser: {
      email: string;
      name: string;
      googleId: string;
    },
  ) {
    let user =
      await this.usersRepository.findOneBy({
        email:
          googleUser.email
            .toLowerCase()
            .trim(),
      });

    let isNewUser = false;

    if (!user) {
      user =
        this.usersRepository.create({
          email:
            googleUser.email
              .toLowerCase()
              .trim(),

          name: googleUser.name,
          googleId:
            googleUser.googleId,

          role: Role.User,
        });

      user =
        await this.usersRepository.save(
          user,
        );

      isNewUser = true;
    } else if (!user.googleId) {
      user.googleId =
        googleUser.googleId;

      await this.usersRepository.save(
        user,
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      profileCompleted:
        user.profileCompleted,
    };

    const token =
      this.jwtService.sign(payload, {
        expiresIn: '1h',
      });

    if (isNewUser) {
      this.eventEmitter.emit(
        'user.registered',

        new UserRegisteredEvent(
          user.id,
          user.email,
          user.name,
        ),
      );
    }

    this.eventEmitter.emit(
      'user.logged-in',

      new UserLoggedInEvent(
        user.id,
        user.email,
        user.name,
      ),
    );

    return {
      id: user.id,
      role: user.role,
      login: true,
      access_token: token,
    };
  }
}