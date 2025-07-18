import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { GiftPaymentRepository } from './gift-payment.repository';
import { GiftPaymentStatus } from './enums/gift-payment.enum';
import { GiftService } from '../gift/gift.service';
import { GiftStatus } from '../gift/enums/gift.enum';
import { GiftRepository } from '../gift/gift.repository';
import { PaymentMethod } from './enums/payment-method.enum';

@Injectable()
export class GiftPaymentService {
    constructor(
        private readonly giftPaymentRepository: GiftPaymentRepository,
        private readonly giftRepository: GiftRepository,
    ) {}

    async create(data: {
        giftId: number;
        userId: number;
        amount: number;
        paymentMethodId: number;
        transactionId?: string;
    }) {
        try {
            const gift = await this.giftRepository.findById(data.giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${data.giftId} not found`);
            }

            if (gift.status_id !== GiftStatus.RESERVED && data.paymentMethodId !==  PaymentMethod['DIRECT_PURCHASE']) {
                throw new BadRequestException(`Gift must be reserved before creating a payment. Current status: ${GiftStatus[gift.status_id]}`);
            }

            if (data.amount !== gift.price) {
                throw new BadRequestException(`Payment amount must match gift price. Expected: ${gift.price}, Received: ${data.amount}`);
            }

            const payment = await this.giftPaymentRepository.create({
                giftId: data.giftId,
                userId: data.userId,
                amount: data.amount,
                statusId: GiftPaymentStatus.PENDING,
                paymentMethodId: data.paymentMethodId,
                transactionId: data.transactionId
            });

            return payment;
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to create gift payment');
        }
    }

    async updatePayment(
        paymentId: number,
        data: {
            paymentProofUrl: string;
            statusId: number;
            paymentMethodId: PaymentMethod;
        }
    ) {
        try {
            const payment = await this.giftPaymentRepository.updatePaymentWithProof(
                paymentId,
                data.statusId,
                data.paymentMethodId,
                data.paymentProofUrl
            );

            if (!payment) {
                throw new NotFoundException(`Payment with ID ${paymentId} not found`);
            }

            return payment;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to update payment');
        }
    }

    async softDelete(paymentId: number) {
        try {
            const payment = await this.giftPaymentRepository.softDelete(paymentId);

            if (!payment) {
                throw new NotFoundException(`Payment with ID ${paymentId} not found`);
            }

            return payment;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to soft delete payment');
        }
    }
}
