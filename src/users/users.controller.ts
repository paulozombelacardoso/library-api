import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UpdateDto } from './dto/update-role.dto';

@ApiTags('Users')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Obter usuário por ID',
    description: 'Retorna os detalhes de um usuário específico. Apenas ADMIN pode acessar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'STUDENT',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário com ID 999 não encontrado',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas ADMIN)',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(Number(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar papel do usuário',
    description: 'Atualiza o papel/função de um usuário no sistema. Apenas ADMIN pode atualizar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Papel do usuário atualizado com sucesso',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['role must be ADMIN, LIBRARIAN or STUDENT'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas ADMIN)',
  })
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDto) {
    return this.userService.updateRole(id, dto.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deletar usuário',
    description: 'Remove um usuário do sistema. Apenas ADMIN pode deletar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário deletado com sucesso',
    schema: {
      example: {
        message: 'Usuário deletado com sucesso',
        id: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas ADMIN)',
  })
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remover(id);
  }
}
