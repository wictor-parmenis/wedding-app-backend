import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeddingDto } from './dto/create-wedding.dto';

@Injectable()
export class WeddingService {
  constructor(private prisma: PrismaService) {}

  async create(createWeddingDto: CreateWeddingDto, userId: number) {
    // Gera um código de convite único (6 caracteres alfanuméricos)
    const invitationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Cria o casamento e o casal em uma única transação
    return this.prisma.$transaction(async (tx) => {
      // Cria o wedding
      const wedding = await tx.wedding.create({
        data: {
          description: createWeddingDto.description,
          event_date: createWeddingDto.eventDate,
          location: createWeddingDto.location,
          invitation_code: invitationCode,
          couple: {
            create: {
              name: createWeddingDto.coupleName,
              user_id: userId,
            },
          },
        },
        include: {
          couple: true,
        },
      });

      return wedding;
    });
  }
}
