import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GiftPaymentStatus } from "./enums/gift-payment.enum";


interface CreateGiftPaymentData {
    giftId: number;
    userId: number;
    amount: number; 
    statusId: GiftPaymentStatus; 
    paymentMethodId: number; 
    transactionId?: string; 
    paymentDate?: Date; 
    createdAt?: Date; 
    updatedAt?: Date; 
}

@Injectable()
export class GiftPaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateGiftPaymentData) {
        const { giftId, userId, amount, statusId, paymentMethodId, transactionId } = data;

        return await this.prisma.giftPayment.create({
            data: {
                gift_id: giftId,
                user_id: userId,
                amount,
                status_id: statusId,
                payment_method_id: paymentMethodId,
                transaction_id: transactionId,
            },
            include: {
                gift: true,
                user: true,
                status: true,
                paymentMethod: true
            }
        });
    }

    async updateStatus(paymentId: number, statusId: GiftPaymentStatus) {
        return await this.prisma.giftPayment.update({
            where: { id: paymentId },
            data: { 
                status_id: statusId,
                payment_date: statusId === GiftPaymentStatus.COMPLETED ? new Date() : null
            },
            include: {
                gift: true,
                user: true,
                status: true,
                paymentMethod: true
            }
        });
    }

    async updatePaymentWithProof(
        paymentId: number,
        statusId: number,
        paymentMethodId: number,
        paymentProofUrl: string
    ) {
        return await this.prisma.giftPayment.update({
            where: { id: paymentId },
            data: { 
                status_id: statusId,
                payment_method_id: paymentMethodId,
                payment_proof_url: paymentProofUrl,
                payment_date: new Date()
            },
            include: {
                gift: true,
                user: true,
                status: true,
                paymentMethod: true
            }
        });
    }

    async softDelete(paymentId: number) {
        return await this.prisma.giftPayment.update({
            where: { id: paymentId },
            data: { 
                deleted_at: new Date()
            },
            include: {
                gift: true,
                user: true,
                status: true,
                paymentMethod: true
            }
        });
    }
}