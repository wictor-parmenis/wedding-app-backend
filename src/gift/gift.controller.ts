import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseInterceptors, UploadedFile, UseGuards, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GiftService } from './gift.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { ListGiftDto } from './dto/list-gift.dto';
import { DeleteGiftDto } from './dto/delete-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { PaymentMethod } from '../gift-payment/enums/payment-method.enum';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { UploadedFile as IUploadedFile } from '../file/interfaces/uploaded-file.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('gifts')
@UseGuards(FirebaseAuthGuard)
export class GiftController {
    constructor(private readonly giftService: GiftService) {}

    @Get()
    async list(@Query() query: ListGiftDto) {
        return await this.giftService.list(query);
    }
    
    @Patch(':id/reserve')
    @HttpCode(204)
    async reserve(
        @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        await this.giftService.reserveGift(Number(id), user.id);
        return;
    }

    @Patch(':id/cancel-reservation')
    async cancelReservation(
        @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        return await this.giftService.cancelGiftReservation(Number(id), user.id);
    }

    @Patch(':id/cancel-purchase')
    async cancelPurchase(
        @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        return await this.giftService.cancelPurchasedGift(Number(id), user.id);
    }
    
    @Post(':id/payments/:paymentId/proof')
    @UseInterceptors(FileInterceptor('proofFile'))
    async uploadPaymentProof(
        @Param('id') id: string,
        @Param('paymentId') paymentId: string,
        @UploadedFile() proofFile: IUploadedFile,
        @Body('paymentMethod') paymentMethod: PaymentMethod
    ) {
        return await this.giftService.uploadProofPaymentGift(
            Number(id),
            Number(paymentId),
            proofFile,
            paymentMethod
        );
    }

    @HttpCode(204)
    @Post(':id/confirm-direct-purchase')
    async confirmDirectPurchase(
        @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        await this.giftService.confirmDirectPurchase(Number(id), user.id);
        return;
    }

    @Get(':id')
    async getGiftDetails(@Param('id') id: string) {
        return await this.giftService.getGiftDetails(Number(id));
    }

}