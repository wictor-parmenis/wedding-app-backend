import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../generated/prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }  async create(data: {
    username: string;
    email: string;
    external_id: string;
    role_id: number;
    phone_number?: string;
    email_verified?: boolean;
  }): Promise<User> {
    return await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        external_id: data.external_id,
        phone_number: data.phone_number,
        email_verified: data.email_verified || false,
        role_id: data.role_id
      },
    });
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    });
  }

  async markEmailAsVerified(userId: number): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { email_verified: true },
    });
  }

  async softDelete(userId: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deleted_at: new Date() },
    });
  }

  async findAll(params: { skip?: number; take?: number }): Promise<User[]> {
    const { skip, take } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      where: {
        deleted_at: null,
      },
    });
  }
}
