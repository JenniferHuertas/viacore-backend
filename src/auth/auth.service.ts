
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

import { EmailService } from 'src/notifications/channels/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    private readonly jwtService: JwtService,

    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const foundUser =
      await this.usersRepository.findOneBy({
        email: createUserDto.email,
      });

    if (foundUser) {
      throw new BadRequestException(
        'Este correo ya está registrado. Por favor, inicia sesión.',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        createUserDto.password,
        10,
      );

    const {
      confirmPassword,
       ...userData
      } = createUserDto;

    const newUser =
      this.usersRepository.create({
        ...userData,

        password: hashedPassword,

        role: Role.User,

        profileCompleted: true,
      });

    const savedUser =
      await this.usersRepository.save(
        newUser,
      );

    try {
      // await this.emailService.sendWelcomeEmail(
      //   savedUser.email,
      //   savedUser.name,
      // );

      console.error(
        'WELCOME EMAIL ENVIADO',
      );
    } catch (error) {
      console.error(
        'ERROR MAIL:',
        error,
      );
    }

    return savedUser;
  }

  async signIn(
    credentials: LoginUserDto,
  ) {
    const foundUser =
  await this.usersRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email = :email', {
      email: credentials.email,
    })
    .getOne();

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
    const normalizedEmail =
      googleUser.email
        .toLowerCase()
        .trim();

    const adminEmails = [
      'colmenares8093@gmail.com',
      'admin.viacore@gmail.com',
    ];

    const isAdmin =
      adminEmails.includes(
        normalizedEmail,
      );

    let user =
      await this.usersRepository.findOneBy({
        email: normalizedEmail,
      });

    if (!user) {
      user = this.usersRepository.create({
        email: normalizedEmail,

        name: googleUser.name,

        googleId:
          googleUser.googleId,

        role: isAdmin
          ? Role.Admin
          : Role.User,

        profileCompleted:
          isAdmin
            ? true
            : false,
      });

      user =
        await this.usersRepository.save(
          user,
        );

      try {
        await this.emailService.sendWelcomeEmail(
          user.email,
          user.name,
        );
      } catch (error) {
          console.error("Error mail Google: ", error)
      }
    } else {
      if (!user.googleId) {
        user.googleId =
          googleUser.googleId;
      }

      if (isAdmin) {
        user.role = Role.Admin;

        user.profileCompleted =
          true;
      }

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

    return {
      id: user.id,

      role: user.role,

      login: true,

      access_token: token,
    };
  }
}
