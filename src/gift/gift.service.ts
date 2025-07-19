import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { GiftRepository } from "./gift.repository";
import { GiftStatus } from "./enums/gift.enum";
import { GiftPaymentService } from "../gift-payment/gift-payment.service";
import { PaymentMethod } from "../gift-payment/enums/payment-method.enum";
import { FileService } from "../file/file.service";
import { UploadedFile } from "../file/interfaces/uploaded-file.interface";
import { GiftReservationService } from "src/gift-reservation/gift-reservation.service";

interface CreateGiftDTO {
    weddingId: number;
    urlImage: string;
    description: string;
    price: number;
}

interface ListGiftFiltersDTO {
    weddingId?: number;
    statusId?: GiftStatus;
}

@Injectable()
export class GiftService {
    constructor(
        private readonly giftRepository: GiftRepository,
        @Inject(forwardRef(() => GiftPaymentService))
        private readonly giftPaymentService: GiftPaymentService,
        private readonly fileService: FileService,
        private readonly giftReservationService: GiftReservationService
    ) { }
    
    async create(data: CreateGiftDTO) {
        return await this.giftRepository.create({
            weddingId: data.weddingId,
            urlImage: data.urlImage,
            description: data.description,
            price: data.price
        });
    }

    async list(filters?: ListGiftFiltersDTO) {
        return await this.giftRepository.list(filters);
    }
    
    
    async delete(giftId: number) {
        try {
            return await this.giftRepository.delete(giftId);
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }
            throw error;
        }
    }

    async update(giftId: number, data: { description?: string; price?: number; urlImage?: string }) {
        try {
            return await this.giftRepository.update(giftId, {
                description: data.description,
                price: data.price,
                url_image: data.urlImage
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }
            throw error;
        }
    }

    private async updateStatus(giftId: number, newStatus: GiftStatus) {
        try {
            const gift = await this.giftRepository.findById(giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            if (gift.status_id === newStatus) {
                throw new BadRequestException(`Gift is already in ${GiftStatus[newStatus]} status`);
            }

            return await this.giftRepository.updateGiftStatus(giftId, newStatus);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to update gift status');
        }
    }

    async reserveGift(giftId: number, userId: number) {
        try {
            const gift = await this.giftRepository.findById(giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            if (gift.status_id !== GiftStatus.AVAILABLE) {
                throw new BadRequestException(`Gift is not available for reservation. Current status: ${GiftStatus[gift.status_id]}`);
            }

            await this.giftReservationService.reserve(gift, userId, PaymentMethod.PIX);

            return;
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to reserve gift');
        }
    }
    
    async uploadProofPaymentGift(
        giftId: number,
        paymentId: number,
        proofFile: any, 
        paymentMethod: PaymentMethod
    ) {
        try {
            const gift = await this.giftRepository.findById(giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            
            if (gift.status_id !== GiftStatus.RESERVED) {
                // front: esse presente não estava reservado, gostaria de continuar mesmo assim?
                throw new BadRequestException(`Gift must be in RESERVED status to upload payment proof. Current status: ${GiftStatus[gift.status_id]}`);
            }           
            const uploadResult = await this.fileService.uploadFile(proofFile, {
                weddingId: gift.wedding_id,
                userId: gift.GiftPayment[0]?.user_id, 
                paymentId: paymentId,
                fileType: 'payment-proof'
            });

            if (!uploadResult || !uploadResult.url) {
                throw new BadRequestException('Failed to upload payment proof');
            }

            await this.giftPaymentService.updatePayment(paymentId, {
                paymentProofUrl: uploadResult.url,
                statusId: 2, 
                paymentMethodId: Number(paymentMethod)
            });

            const updatedGift = await this.updateStatus(giftId, GiftStatus.PURCHASED);

            return {
                gift: updatedGift,
                proofUrl: uploadResult.url
            };
        } catch (error) {
            console.log('Error uploading payment proof:', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to upload payment proof');
        }
    }

    async cancelGiftReservation(giftId: number, userId: number) {
        try {
            const gift = await this.giftRepository.findById(giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            if (gift.status_id !== GiftStatus.RESERVED) {
                throw new BadRequestException(`Gift must be in RESERVED status to cancel reservation. Current status: ${GiftStatus[gift.status_id]}`);
            }

            console.log('User ID:', userId);

            const isOwnerReservation = await this.giftReservationService.isReservationOwner(userId, giftId);

            if (!isOwnerReservation) {
                throw new BadRequestException('You are not the owner of this reservation');
            }

            const payment = gift.GiftPayment[0]; 
            if (payment) {
                await this.giftPaymentService.softDelete(payment.id);
            }

            return await this.giftReservationService.cancel(
                giftId,
            );
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to cancel gift reservation');
        }
    }

    async cancelPurchasedGift(giftId: number, userId: number) {
        try {
            const gift = await this.giftRepository.findById(giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            if (gift.status_id !== GiftStatus.PURCHASED) {
                throw new BadRequestException(`Gift must be in PURCHASED status to cancel purchase. Current status: ${GiftStatus[gift.status_id]}`);
            }

            const isOwnerPurchase = gift.GiftPayment.some(payment => payment.user_id === userId);
            if (!isOwnerPurchase) {
                throw new BadRequestException('You are not the owner of this purchase');
            }

            const payment = gift.GiftPayment[0]; 
            if (payment) {
                await this.giftPaymentService.softDelete(payment.id);
            } else {
                throw new BadRequestException('No payment found for this gift');
            }

            return await this.updateStatus(giftId, GiftStatus.AVAILABLE);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to cancel gift purchase');
        }
    }

    async confirmDirectPurchase(giftId: number, userId: number) {
        try {
            const gift = await this.giftRepository.findById(giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            if (gift.status_id !== GiftStatus.AVAILABLE) {
                throw new BadRequestException(`Cannot confirm direct purchase. Gift is not available. Current status: ${GiftStatus[gift.status_id]}`);
            }

            const createdPayment = await this.giftPaymentService.create({
                giftId: gift.id,
                userId: userId,
                amount: gift.price,
                paymentMethodId: PaymentMethod.DIRECT_PURCHASE
            });

            await this.giftPaymentService.updatePayment(createdPayment.id, {
                paymentProofUrl: '', 
                statusId: 2,
                paymentMethodId: PaymentMethod.DIRECT_PURCHASE
            });

            const updatedGift = await this.updateStatus(giftId, GiftStatus.PURCHASED);

            return {
                gift: updatedGift,
                payment: createdPayment
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to confirm direct purchase');
        }
    }

    async getGiftDetails(giftId: number) {
        const gift = await this.giftRepository.findById(giftId);
        if (!gift) {
            throw new NotFoundException(`Gift with ID ${giftId} not found`);
        }
        return gift;
    }
}