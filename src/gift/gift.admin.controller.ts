import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseInterceptors, UploadedFile, UseGuards, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GiftService } from './gift.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { ListGiftDto } from './dto/list-gift.dto';
import { DeleteGiftDto } from './dto/delete-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { PaymentMethod } from '../gift-payment/enums/payment-method.enum';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UploadedFile as IUploadedFile } from '../file/interfaces/uploaded-file.interface';

@Controller('admin/gifts')
@UseGuards(FirebaseAuthGuard, AdminGuard)
export class GiftAdminController {
    constructor(private readonly giftService: GiftService) {}

    @Post()
    async create(@Body() createGiftDto: CreateGiftDto) {
        return await this.giftService.create(createGiftDto);
    }

    @Get()
    async list(@Query() query: ListGiftDto) {
        return await this.giftService.list(query);
    }

    @Delete(':id')
    async delete(@Param() params: DeleteGiftDto) {
        return await this.giftService.delete(params.id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateGiftDto: UpdateGiftDto
    ) {
        return await this.giftService.update(Number(id), updateGiftDto);
    }
    
    @Patch(':id/reserve')
    @HttpCode(204)
    async reserve(
        @Param('id') id: string,
        @Body() user: {user_id: number}
    ) {
        await this.giftService.reserveGift(Number(id), user.user_id);
        return;
    }

    @Patch(':id/cancel-reservation')
    async cancelReservation(
        @Param('id') id: string,
        @Body() user: {user_id: number}
    ) {
        return await this.giftService.cancelGiftReservation(Number(id), user.user_id);
    }

    @Patch(':id/cancel-purchase')
    async cancelPurchase(
        @Param('id') id: string,
        @Body() user: {user_id: number}
    ) {
        return await this.giftService.cancelPurchasedGift(Number(id), user.user_id);
    }
    
    @Post(':id/payments/:paymentId/proof')
    @UseInterceptors(FileInterceptor('proofFile'))
    async uploadPaymentProof(
        @Param('id') id: string,
        @Param('paymentId') paymentId: string,
        @UploadedFile() proofFile: IUploadedFile,
        @Body('paymentMethod') paymentMethod: PaymentMethod,
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
        @Body() user: {user_id: number}
    ) {
        await this.giftService.confirmDirectPurchase(Number(id), user.user_id);
        return;
    }

    @Get(':id')
    async getGiftDetails(@Param('id') id: string) {
        return await this.giftService.getGiftDetails(Number(id));
    }
}
