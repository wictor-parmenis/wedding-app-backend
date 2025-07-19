import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGiftReservationDto } from './dto/create-gift-reservation.dto';
import { GiftStatus } from '../gift/enums/gift.enum';
import { GiftPaymentService } from 'src/gift-payment/gift-payment.service';
import { Gift } from '@prisma/client';
import { PaymentMethod } from "../gift-payment/enums/payment-method.enum";

@Injectable()
export class GiftReservationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly giftPaymentService: GiftPaymentService,
    ) {}

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

        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const [reservation] = await this.prisma.$transaction([
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
            this.prisma.gift.update({
                where: { id: createDto.giftId },
                data: { status_id: GiftStatus.RESERVED }
            })
        ]);

        return reservation;
    }

    async cancel(giftId: number) {
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

        const [deletedReservation] = await this.prisma.$transaction([
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
            this.prisma.gift.update({
                where: { id: giftId },
                data: { status_id: GiftStatus.AVAILABLE }
            }),
        ]);

        return deletedReservation;
    }

    async reserve(gift: Gift, userId: number, paymentMethod: PaymentMethod) {

        await this.create(userId, {
            giftId: gift.id,
        })

         const payment = await this.giftPaymentService.create({
                giftId: gift.id,
                userId: userId,
                amount: gift.price,
                paymentMethodId: paymentMethod
         });
        
        
        return payment;
    }

    async isReservationOwner(userId: number, giftId: number): Promise<boolean> {
        const reservation = await this.prisma.giftReservation.findUnique({
            where: {
                gift_id: giftId
            }
        });

        if (!reservation) {
            return false;
        }

        return reservation.user_id === userId;
    }
}
