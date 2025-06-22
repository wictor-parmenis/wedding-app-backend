import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GiftReservationService } from './gift-reservation.service';
import { GiftReservationTasksService } from './gift-reservation-tasks.service';
import { CreateGiftReservationDto } from './dto/create-gift-reservation.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('gift-reservations')
@UseGuards(FirebaseAuthGuard)
export class GiftReservationController {
    constructor(
        private readonly giftReservationService: GiftReservationService,
        private readonly giftReservationTasksService: GiftReservationTasksService
    ) {}

    @Post()
    async create(
        @Body() createDto: CreateGiftReservationDto,
        @CurrentUser() user: any
    ) {
        return await this.giftReservationService.create(user.id, createDto);
    }

    @Post('check-expired')
    async checkExpiredReservations() {
        return await this.giftReservationTasksService.manuallyRunExpiredReservationsCheck();
    }
}
