import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) throw new NotFoundException('user not found');
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async updateRole(id: number, role: Role) {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) throw new NotFoundException('user not found');
      return this.prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async remover(id: number) {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) throw new NotFoundException('user not found');
      await this.prisma.user.delete({
        where: { id },
      });
      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      console.log(error);
    }
  }
}
