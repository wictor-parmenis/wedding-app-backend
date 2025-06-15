import { Module, forwardRef } from '@nestjs/common';
import { GiftPaymentService } from './gift-payment.service';
import { GiftPaymentRepository } from './gift-payment.repository';
import { GiftModule } from '../gift/gift.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, forwardRef(() => GiftModule)],
    providers: [GiftPaymentService, GiftPaymentRepository],
    exports: [GiftPaymentService]
})
export class GiftPaymentModule {}
