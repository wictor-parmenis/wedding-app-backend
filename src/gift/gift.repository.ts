import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GiftStatus } from './enums/gift.enum';

interface CreateGiftData {
    weddingId: number;
    urlImage: string;
    description: string;
    price: number; 
}

interface ListGiftFilters {
    weddingId?: number;
    statusId?: GiftStatus;
}

@Injectable()
export class GiftRepository {
    constructor(private readonly prisma: PrismaService) {}    async create(data: CreateGiftData) {
        const { weddingId, urlImage, description, price } = data;

        return await this.prisma.gift.create({
            data: {
                wedding_id: weddingId,
                url_image: urlImage,
                description,
                price,
                status_id: GiftStatus.AVAILABLE, 
            },
            include: {
                wedding: true,
                status: true,
                GiftPayment: {
                    where: {
                        deleted_at: null
                    },
                }
            }
        });
    }
      
    async list(filters?: ListGiftFilters) {
        return await this.prisma.gift.findMany({
            where: {
                deleted_at: null,
                ...(filters?.weddingId && { wedding_id: filters.weddingId }),
                ...(filters?.statusId && { status_id: filters.statusId })
            },
            include: {
                wedding: true,
                status: true,
                GiftPayment: {
                    where: {
                        deleted_at: null
                    },
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }
    async updateGiftStatus(giftId: number, statusId: GiftStatus) {
        return await this.prisma.gift.update({
            where: { id: giftId },
            data: { status_id: statusId },
            include: {
                wedding: true,
                status: true,
                GiftPayment: {
                    where: {
                        deleted_at: null
                    },
                    include: {
                        status: true,
                        paymentMethod: true,
                    }
                }
            }
        });
    }

    async delete(giftId: number) {
        return await this.prisma.gift.delete({
            where: { id: giftId }
        });
    }
    
    async findById(giftId: number) {
        return await this.prisma.gift.findUnique({
            where: { id: giftId },
            include: {
                wedding: true,
                status: true,
                GiftPayment: {
                    where: {
                        deleted_at: null
                    },
                }
            }
        });
    }
    
    async update(giftId: number, data: { description?: string; price?: number; url_image?: string }) {
        return await this.prisma.gift.update({
            where: { id: giftId },
            data,
            include: {
                wedding: true,
                status: true,
                GiftPayment: {
                    where: {
                        deleted_at: null
                    },
                }
            }
        });
    }
}