import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { GiftRepository } from "./gift.repository";
import { GiftStatus } from "./enums/gift.enum";
import { GiftPaymentService } from "../gift-payment/gift-payment.service";
import { PaymentMethod } from "../gift-payment/enums/payment-method.enum";
import { FileService } from "../file/file.service";
import { UploadedFile } from "../file/interfaces/uploaded-file.interface";

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
        private readonly fileService: FileService
    ) {}    async create(data: CreateGiftDTO) {
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

            // Atualiza o status do presente para RESERVED
            const updatedGift = await this.updateStatus(giftId, GiftStatus.RESERVED);

            // Cria um pagamento pendente
            const payment = await this.giftPaymentService.create({
                giftId: gift.id,
                userId: userId,
                amount: gift.price,
                paymentMethodId: PaymentMethod.PIX // Usando PIX como método padrão
            });

            return {
                gift: updatedGift,
                payment
            };
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
        proofFile: any, // Express.Multer.File type
        paymentMethod: PaymentMethod
    ) {
        try {
            const gift = await this.giftRepository.findById(giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            if (gift.status_id !== GiftStatus.RESERVED) {
                throw new BadRequestException(`Gift must be in RESERVED status to upload payment proof. Current status: ${GiftStatus[gift.status_id]}`);
            }

            // 1. Faz upload do comprovante
            const uploadResult = await this.fileService.uploadPDF(proofFile);

            // 2. Atualiza o GiftPayment com o comprovante, status e método de pagamento
            await this.giftPaymentService.updatePayment(paymentId, {
                paymentProofUrl: uploadResult.url,
                statusId: 2, // COMPLETED
                paymentMethodId: paymentMethod
            });

            // 3. Atualiza o status do presente para PURCHASED
            const updatedGift = await this.updateStatus(giftId, GiftStatus.PURCHASED);

            return {
                gift: updatedGift,
                proofUrl: uploadResult.url
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to upload payment proof');
        }
    }

    async cancelGiftReservation(giftId: number) {
        try {
            const gift = await this.giftRepository.findById(giftId);
            
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            if (gift.status_id !== GiftStatus.RESERVED) {
                throw new BadRequestException(`Gift must be in RESERVED status to cancel reservation. Current status: ${GiftStatus[gift.status_id]}`);
            }

            // Soft delete the associated GiftPayment first
            const payment = gift.GiftPayment[0]; // Get the most recent payment
            if (payment) {
                await this.giftPaymentService.softDelete(payment.id);
            }

            // Then update gift status to AVAILABLE
            return await this.updateStatus(giftId, GiftStatus.AVAILABLE);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to cancel gift reservation');
        }
    }
}