import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/services';
import { hashSync, genSaltSync } from 'bcryptjs';
import { LoginUserDto, RegisterUserDto } from './dtos';
import { appConfig, jwtConfig } from 'src/configs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interfaces';
import { SafeUserDto } from 'src/common/dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  signJwtToken(payload: JwtPayload) {
    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtConfig.secret,
        expiresIn: jwtConfig.expiration.access + 'm',
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: jwtConfig.secret,
        expiresIn: jwtConfig.expiration.refresh + 'm',
      }),
    };
  }

  async authenticateUser(dto: LoginUserDto) {
    const { username, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!user) throw new NotFoundException();
    const { salt } = user;
    const hashedPassword = hashSync(password, salt);
    if (hashedPassword !== user.password.replaceAll(' ', ''))
      throw new NotFoundException();
    const payload: JwtPayload = {
      username: username,
      user_id: user.id,
      role: user.role,
    };
    return this.signJwtToken(payload);
  }

  async registerUser(dto: RegisterUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username },
    });
    if (user) throw new BadRequestException('username existed');

    const salt = genSaltSync(parseInt(appConfig.bcryptSaltRounds));
    const hashedPassword = hashSync(dto.password, salt);
    const _user = await this.prisma.user.create({
      data: { ...dto, salt, password: hashedPassword },
    });
    const payload: JwtPayload = {
      username: _user.username,
      user_id: _user.id,
      role: _user.role,
    };
    return this.signJwtToken(payload);
  }

  async getUserProfile(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!user) throw new NotFoundException('user profile not found');
    return new SafeUserDto(user);
  }

  async refreshUserToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: jwtConfig.secret,
      });
      delete payload.iat;
      delete payload.exp;
      return this.signJwtToken(payload);
    } catch {
      throw new UnauthorizedException('Token expired');
    }
  }
}
