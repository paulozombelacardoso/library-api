import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { LoansService } from './loans.service';

@ApiTags('Loans')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('request')
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Solicitar empréstimo de livro',
    description:
      'Um aluno pode solicitar o empréstimo de um livro. A solicitação será enviada para aprovação do bibliotecário.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bookId: { type: 'number', example: 1 },
      },
      required: ['bookId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Empréstimo solicitado com sucesso',
    schema: {
      example: {
        id: 1,
        userId: 5,
        bookId: 1,
        loanDate: '2025-01-01T00:00:00.000Z',
        returnDate: '2025-01-15T00:00:00.000Z',
        status: 'PENDING',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Livro não disponível ou dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Livro não encontrado',
  })
  requestLoans(@Req() req, @Body('bookId', ParseIntPipe) bookId: number) {
    return this.loansService.requestLoan(req.user.id, bookId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LIBRARIAN, Role.STUDENT)
  @ApiOperation({
    summary: 'Listar todos os empréstimos',
    description:
      'Retorna uma lista de todos os empréstimos no sistema. Apenas ADMIN e LIBRARIAN podem listar todos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empréstimos obtida com sucesso',
    schema: {
      example: [
        {
          id: 1,
          userId: 5,
          bookId: 1,
          loanDate: '2025-01-01T00:00:00.000Z',
          returnDate: '2025-01-15T00:00:00.000Z',
          status: 'APPROVED',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  listAllLoans() {
    return this.loansService.listAllLoans();
  }

  @Get('my-loans')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: 'Listar meus empréstimos',
    description:
      'Retorna uma lista dos empréstimos do usuário autenticado. Apenas STUDENTs podem acessar seus próprios empréstimos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Meus empréstimos obtidos com sucesso',
    schema: {
      example: [
        {
          id: 1,
          userId: 5,
          bookId: 1,
          loanDate: '2025-01-01T00:00:00.000Z',
          returnDate: '2025-01-15T00:00:00.000Z',
          status: 'APPROVED',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  findmyloans(@Req() req) {
    return this.loansService.findmyloans(req.user.id);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @ApiOperation({
    summary: 'Aprovar empréstimo',
    description:
      'Aprova uma solicitação de empréstimo pendente. Apenas ADMIN e LIBRARIAN podem aprovar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do empréstimo',
  })
  @ApiResponse({
    status: 200,
    description: 'Empréstimo aprovado com sucesso',
    schema: {
      example: {
        id: 1,
        userId: 5,
        bookId: 1,
        loanDate: '2025-01-01T00:00:00.000Z',
        returnDate: '2025-01-15T00:00:00.000Z',
        status: 'APPROVED',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Empréstimo não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas ADMIN ou LIBRARIAN)',
  })
  aprpoveLoans(@Param('id', ParseIntPipe) loanId: number) {
    return this.loansService.approveLoans(loanId);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @ApiOperation({
    summary: 'Rejeitar empréstimo',
    description:
      'Rejeita uma solicitação de empréstimo pendente. Apenas ADMIN e LIBRARIAN podem rejeitar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do empréstimo',
  })
  @ApiResponse({
    status: 200,
    description: 'Empréstimo rejeitado com sucesso',
    schema: {
      example: {
        id: 1,
        userId: 5,
        bookId: 1,
        loanDate: '2025-01-01T00:00:00.000Z',
        returnDate: '2025-01-15T00:00:00.000Z',
        status: 'REJECTED',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Empréstimo não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas ADMIN ou LIBRARIAN)',
  })
  rejectLoans(@Param('id', ParseIntPipe) loanId: number) {
    return this.loansService.rejectLoans(loanId);
  }

  @Patch(':id/return')
  @Roles(Role.ADMIN, Role.LIBRARIAN, Role.STUDENT)
  @ApiOperation({
    summary: 'Registrar devolução de livro',
    description:
      'Registra a devolução de um livro emprestado. O livro é marcado como devolvido e a quantidade disponível é aumentada.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID único do empréstimo',
  })
  @ApiResponse({
    status: 200,
    description: 'Devolução registrada com sucesso',
    schema: {
      example: {
        id: 1,
        userId: 5,
        bookId: 1,
        loanDate: '2025-01-01T00:00:00.000Z',
        returnDate: '2025-01-15T00:00:00.000Z',
        returnedAt: '2025-01-10T12:30:00.000Z',
        status: 'RETURNED',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Empréstimo não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Empréstimo já foi devolvido',
  })
  returnLoans(@Param('id', ParseIntPipe) loanId: number) {
    return this.loansService.returnLoans(loanId);
  }
}
