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
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  requestLoans(@Req() req, @Body('bookId', ParseIntPipe) bookId: number) {
    return this.loansService.requestLoan(req.user.id, bookId);
  }

  //GET AllLoans
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  listAllLoans() {
    return this.loansService.listAllLoans();
  }

  //GET /loans/
  @Get('my-loans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  findmyloans(@Req() req) {
    return this.loansService.findmyloans(req.user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  aprpoveLoans(@Param('id', ParseIntPipe) loanId: number) {
    return this.loansService.approveLoans(loanId);
  }
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  rejectLoans(@Param('id', ParseIntPipe) loanId: number) {
    return this.loansService.rejectLoans(loanId);
  }
}
