import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async requestLoan(userId: number, bookId: number) {
    // eslint-disable-next-line no-useless-catch
    try {
      const book = await this.prisma.book.findUnique({
        where: { id: bookId },
      });

      if (!book) throw new NotFoundException('Book not found');

      const existingRequest = await this.prisma.loan.findFirst({
        where: {
          userId,
          bookId,
          status: {
            in: ['PENDING', 'APPROVED'],
          },
        },
      });
      if (existingRequest)
        throw new BadRequestException(
          'You already have an active request for this book',
        );
      return this.prisma.loan.create({
        data: {
          userId,
          bookId,
          status: 'PENDING',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async approveLoans(loanId: number) {
    try {
      const loan = await this.prisma.loan.findUnique({
        where: { id: loanId },
      });

      if (!loan) throw new NotFoundException('Loans Not Found');
      if (loan.status !== 'PENDING')
        throw new BadRequestException('Only pending requests can be approved');
      return this.prisma.loan.update({
        where: { id: loanId },
        data: {
          status: 'APPROVED',
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async rejectLoans(loanId: number) {
    try {
      const loan = await this.prisma.loan.findUnique({
        where: { id: loanId },
      });
      if (!loan) throw new NotFoundException('Loan request not found');
      if (loan.status !== 'PENDING')
        throw new BadRequestException('Only pending requests can be rejected');
      return this.prisma.loan.update({
        where: { id: loanId },
        data: {
          status: 'REJECTED',
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
