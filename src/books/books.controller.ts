import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BooksService } from './books.service';

@ApiTags('Books')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, '/tmp');
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo livro',
    description: 'Cria um novo livro no sistema. Apenas ADMIN e LIBRARIAN podem criar.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Clean Code' },
        author: { type: 'string', example: 'Robert C. Martin' },
        isbn: { type: 'string', example: '9780132350884' },
        quantity: { type: 'number', example: 10 },
        available: { type: 'number', example: 8 },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagem da capa do livro',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Livro criado com sucesso',
    schema: {
      example: {
        id: 1,
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        quantity: 10,
        available: 8,
        imageUrl: 'https://cdn.example.com/clean-code.jpg',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para criar livros',
  })
  createBook(@Body() dto: CreateBookDto, @UploadedFile() file) {
    return this.bookService.createBook(dto, file);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LIBRARIAN, Role.STUDENT)
  @ApiOperation({
    summary: 'Listar todos os livros',
    description: 'Retorna uma lista paginada de livros. Disponível para todos os usuários autenticados.',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    example: 10,
    description: 'Limite de registros por página (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de livros obtida com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: 'Clean Code',
            author: 'Robert C. Martin',
            isbn: '9780132350884',
            quantity: 10,
            available: 8,
            imageUrl: 'https://cdn.example.com/clean-code.jpg',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  findAllBooks(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.bookService.findAllBook(Number(page), Number(limit));
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LIBRARIAN, Role.STUDENT)
  @ApiOperation({
    summary: 'Obter livro por ID',
    description: 'Retorna os detalhes de um livro específico.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do livro',
  })
  @ApiResponse({
    status: 200,
    description: 'Livro encontrado',
    schema: {
      example: {
        id: 1,
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        quantity: 10,
        available: 8,
        imageUrl: 'https://cdn.example.com/clean-code.jpg',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Livro não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Livro com ID 999 não encontrado',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  findOneBook(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, '/tmp');
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
        },
      }),
    }),
  )
  @ApiOperation({
    summary: 'Atualizar livro',
    description: 'Atualiza informações de um livro existente. Apenas ADMIN e LIBRARIAN podem atualizar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do livro',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Clean Code' },
        author: { type: 'string', example: 'Robert C. Martin' },
        quantity: { type: 'number', example: 15 },
        available: { type: 'number', example: 12 },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Nova imagem da capa',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Livro atualizado com sucesso',
    schema: {
      example: {
        id: 1,
        title: 'Clean Code - Updated',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        quantity: 15,
        available: 12,
        imageUrl: 'https://cdn.example.com/clean-code-updated.jpg',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Livro não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para atualizar livros',
  })
  updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
    @UploadedFile() file,
  ) {
    return this.bookService.updateBook(id, dto, file);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Deletar livro',
    description: 'Deleta um livro do sistema. Apenas ADMIN pode deletar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do livro',
  })
  @ApiResponse({
    status: 200,
    description: 'Livro deletado com sucesso',
    schema: {
      example: {
        message: 'Livro deletado com sucesso',
        id: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Livro não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para deletar livros',
  })
  removerBook(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.removerBook(id);
  }
}
