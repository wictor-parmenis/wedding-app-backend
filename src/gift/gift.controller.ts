import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
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
    async reserve(
        @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        return await this.giftService.reserveGift(Number(id), user.id);
    }

    @Patch(':id/cancel-reservation')
    async cancelReservation(@Param('id') id: string) {
        return await this.giftService.cancelGiftReservation(Number(id));
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

}