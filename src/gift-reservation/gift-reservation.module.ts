import { Module } from '@nestjs/common';
import { GiftReservationService } from './gift-reservation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GiftPaymentModule } from 'src/gift-payment/gift-payment.module';

@Module({
    imports: [PrismaModule, GiftPaymentModule],
    providers: [GiftReservationService],
    exports: [GiftReservationService]
})
export class GiftReservationModule {}
