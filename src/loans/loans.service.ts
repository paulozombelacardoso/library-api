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

  async findmyloans(userId: number) {
    try {
      const loans = await this.prisma.loan.findFirst({
        where: { userId: userId },
        include: {
          book: true,
        },
      });
      if (!loans) throw new NotFoundException('my loans not found');
      return {
        id: loans.id,
        status: loans.status,
        loanDate: loans.loanDate,
        title: loans.book.title,
        author: loans.book.author,
        isbn: loans.book.isbn,
        imageUrl: loans.book.imageUrl,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async listAllLoans() {
    try {
      const loans = await this.prisma.loan.findMany({
        include: {
          book: true,
          user: true,
        },
      });
      if (!loans) throw new NotFoundException('There is not loans');
      return loans.map((loan) => ({
        id: loan.id,
        status: loan.status,
        loanDate: loan.loanDate,
        returnDate: loan.returnDate,
        user: {
          id: loan.user.id,
          name: loan.user.name,
          email: loan.user.email,
        },
        book: {
          id: loan.book.id,
          title: loan.book.title,
          author: loan.book.author,
        },
      }));
    } catch (error) {
      console.log(error);
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
