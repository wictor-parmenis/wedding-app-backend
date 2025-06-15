export enum GiftStatus {
    AVAILABLE = 1,
    RESERVED = 2,
    PURCHASED = 3
}

export const GiftStatusLabels = {
    [GiftStatus.AVAILABLE]: 'Disponível',
    [GiftStatus.RESERVED]: 'Reservado',
    [GiftStatus.PURCHASED]: 'Comprado'
};
