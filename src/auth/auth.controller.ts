import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description:
      'Cria uma nova conta de usuário no sistema. O usuário padrão será criado com role STUDENT.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Dados de registro do usuário',
    examples: {
      example1: {
        summary: 'Registro simples',
        value: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'senha123',
          role: 'STUDENT',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'STUDENT',
        createdAt: '2025-01-01T00:00:00.000Z',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou email já registrado',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    schema: {
      example: {
        statusCode: 500,
        message: 'Erro ao registrar usuário',
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer login',
    description:
      'Autentica o usuário com email e senha, retornando um JWT token válido por 24 horas.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais de login',
    examples: {
      example1: {
        summary: 'Login com email e senha',
        value: {
          email: 'john@example.com',
          password: 'senha123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'STUDENT',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou senha incorretos',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciais inválidas',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be longer than or equal to 5 characters'],
        error: 'Bad Request',
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Obter perfil do usuário autenticado',
    description:
      'Retorna os dados do usuário autenticado (requer JWT token válido).',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário obtido com sucesso',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'STUDENT',
        createdAt: '2025-01-01T00:00:00.000Z',
        iat: 1735689600,
        exp: 1735776000,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  profile(@Req() req: any) {
    return req.user;
  }
}
