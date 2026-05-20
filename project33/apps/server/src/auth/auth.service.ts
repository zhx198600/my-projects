import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponse, JwtPayload, RoleCode } from '@project33/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const role = await this.prisma.role.findUnique({
      where: { code: registerDto.roleCode || RoleCode.STUDENT },
    });

    if (!role) {
      throw new BadRequestException('角色不存在');
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        userRoles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    const roles = user.userRoles.map(ur => ur.role.code as RoleCode);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    return {
      user: userWithoutPassword,
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: 86400,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (!user.enabled) {
      throw new UnauthorizedException('账户已被禁用');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const roles = user.userRoles.map((ur: any) => ur.role.code as RoleCode);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    return {
      user,
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: 86400,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
        },
        positions: {
          include: {
            organization: true,
            position: true,
          },
        },
        supervisor: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const { password: _, ...result } = user;
    return result;
  }
}
