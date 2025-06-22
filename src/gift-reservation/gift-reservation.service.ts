import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGiftReservationDto } from './dto/create-gift-reservation.dto';
import { GiftStatus } from '../gift/enums/gift.enum';

@Injectable()
export class GiftReservationService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: number, createDto: CreateGiftReservationDto) {
        const gift = await this.prisma.gift.findUnique({
            where: { 
                id: createDto.giftId,
                deleted_at: null
            },
            include: {
                GiftReservation: true
            }
        });

        if (!gift) {
            throw new NotFoundException(`Gift with ID ${createDto.giftId} not found`);
        }

        if (gift.status_id !== GiftStatus.AVAILABLE) {
            throw new BadRequestException(`Gift is not available for reservation. Current status: ${GiftStatus[gift.status_id]}`);
        }

        if (gift.GiftReservation) {
            throw new BadRequestException('Gift is already reserved');
        }

        // Cria a reserva com TTL de 7 dias
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const [reservation] = await this.prisma.$transaction([
            // Cria a reserva
            this.prisma.giftReservation.create({
                data: {
                    gift_id: createDto.giftId,
                    user_id: userId,
                    ttl: sevenDaysFromNow
                },
                include: {
                    gift: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }),
            // Atualiza o status do presente para RESERVED
            this.prisma.gift.update({
                where: { id: createDto.giftId },
                data: { status_id: GiftStatus.RESERVED }
            })
        ]);

        return reservation;
    }

    async delete(giftId: number) {
        const reservation = await this.prisma.giftReservation.findUnique({
            where: {
                gift_id: giftId
            },
            include: {
                gift: true
            }
        });

        if (!reservation) {
            throw new NotFoundException(`No active reservation found for gift ID ${giftId}`);
        }

        // Usa transação para garantir que tanto a reserva seja removida quanto o presente volte para disponível
        const [deletedReservation] = await this.prisma.$transaction([
            // Remove a reserva
            this.prisma.giftReservation.delete({
                where: {
                    gift_id: giftId
                },
                include: {
                    gift: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }),
            // Atualiza o status do presente para AVAILABLE
            this.prisma.gift.update({
                where: { id: giftId },
                data: { status_id: GiftStatus.AVAILABLE }
            })
        ]);

        return deletedReservation;
    }
}
