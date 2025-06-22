import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { GiftReservationService } from './gift-reservation.service';

@Injectable()
export class GiftReservationTasksService {
    private readonly logger = new Logger(GiftReservationTasksService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly giftReservationService: GiftReservationService
    ) { }
    
    @Cron('0 6 * * *') // Runs at 6:00 AM every day
    async handleExpiredReservations() {
        this.logger.debug('Starting expired reservations check');

        try {
            // Find all expired reservations
            const expiredReservations = await this.prisma.giftReservation.findMany({
                where: {
                    ttl: {
                        lt: new Date() // TTL less than current date
                    }
                },
                select: {
                    gift_id: true
                }
            });

            this.logger.debug(`Found ${expiredReservations.length} expired reservations`);

            // Process each expired reservation
            for (const reservation of expiredReservations) {
                try {
                    await this.giftReservationService.delete(reservation.gift_id);
                    this.logger.debug(`Successfully deleted reservation for gift ${reservation.gift_id}`);
                } catch (error) {
                    this.logger.error(
                        `Error deleting reservation for gift ${reservation.gift_id}:`,
                        error.message
                    );
                }
            }

            this.logger.debug('Expired reservations check completed');
        } catch (error) {
            this.logger.error('Error processing expired reservations:', error.message);
        }
    }

    async manuallyRunExpiredReservationsCheck() {
        this.logger.debug('Manually triggering expired reservations check');
        await this.handleExpiredReservations();
        return { message: 'Expired reservations check completed' };
    }
}
