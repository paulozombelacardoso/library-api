import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createBook(dto: CreateBookDto, file?: any) {
    try {
      console.log(dto);
      //console.log(file);
      const exists = await this.prisma.book.findUnique({
        where: {
          isbn: dto.isbn,
        },
      });
      if (exists) throw new ConflictException('ISBn already exists');
      let imageUrl: string | null = null;
      if (file) {
        const uploadResult: any =
          await this.cloudinaryService.uploadImage(file);
        imageUrl = uploadResult['secure_url'];
      }
      return this.prisma.book.create({
        data: {
          ...dto,
          imageUrl,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async findAllBook(page: number, limit: number) {
    try {
      return this.prisma.book.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: number) {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id },
      });

      if (!book) throw new NotFoundException('Book not found');
      return book;
    } catch (error) {
      console.log(error);
    }
  }

  async updateBook(id: number, dto: UpdateBookDto) {
    try {
      await this.findOne(id);
      return this.prisma.book.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async removerBook(id: number) {
    try {
      await this.findOne(id);
      return this.prisma.book.delete({
        where: { id },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
