import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PasswordResetToken } from "../entities/password-reset-token.entity";
import { Users } from "../../users/entities/user.entity";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,

    @InjectRepository(PasswordResetToken)
    private resetRepository: Repository<PasswordResetToken>,
  ) {}

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) return;

    const token = crypto.randomUUID();

    await this.resetRepository.save({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    });

    console.log(`Reset link: http://localhost:3000/reset?token=${token}`);
  }
}