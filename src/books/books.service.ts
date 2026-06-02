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
    // eslint-disable-next-line no-useless-catch
    try {
      const exists = await this.prisma.book.findUnique({
        where: {
          isbn: dto.isbn,
        },
      });
      if (exists) throw new ConflictException('ISBN already exists');

      let imageUrl: string | null = null;

      if (file) {
        const fs = require('fs').promises;
        const fileBuffer = await fs.readFile(file.path);
        const fileObj = {
          buffer: fileBuffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        };

        // eslint-disable-next-line no-useless-catch
        try {
          const uploadResult: any =
            await this.cloudinaryService.uploadImage(fileObj);
          imageUrl = uploadResult.secure_url;

          await fs.unlink(file.path).catch(() => {});
        } catch (uploadError) {
          throw uploadError;
        }
      } else {
        console.log('No file provided');
      }

      const bookData = {
        ...dto,
        imageUrl,
      };
      const createdBook = await this.prisma.book.create({
        data: bookData,
      });

      return createdBook;
    } catch (error) {
      throw error;
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

  async updateBook(id: number, dto: UpdateBookDto, file?: any) {
    try {
      console.log('=== Updating Book ===');
      console.log('Book ID:', id);
      console.log('DTO:', dto);
      console.log('File:', file);

      const book = await this.findOne(id);
      if (!book) throw new NotFoundException('Book not found');

      let imageUrl: string | undefined = undefined;

      if (file) {
        console.log('File detected, uploading to Cloudinary...');
        console.log('File path:', file.path);

        const fs = require('fs').promises;
        const fileBuffer = await fs.readFile(file.path);

        const fileObj = {
          buffer: fileBuffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        };

        // eslint-disable-next-line no-useless-catch
        try {
          const uploadResult: any =
            await this.cloudinaryService.uploadImage(fileObj);
          imageUrl = uploadResult.secure_url;

          // Clean up temp file
          await fs.unlink(file.path).catch(() => {});
        } catch (uploadError) {
          throw uploadError;
        }
      }

      const updateData = {
        ...dto,
        ...(imageUrl !== undefined && { imageUrl }),
      };

      console.log('Updating book with data:', updateData);
      const updatedBook = await this.prisma.book.update({
        where: { id },
        data: updateData,
      });

      console.log('✓ Book updated successfully');
      return updatedBook;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
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
