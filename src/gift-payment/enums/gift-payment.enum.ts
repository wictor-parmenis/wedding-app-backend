
export enum GiftPaymentStatus {
    PENDING = 1,
    COMPLETED = 2,
    FAILED = 3,
    REFUNDED = 4
}

export const GiftPaymentStatusLabels = {
    [GiftPaymentStatus.PENDING]: 'Pendente',
    [GiftPaymentStatus.COMPLETED]: 'Completo',
    [GiftPaymentStatus.FAILED]: 'Falhou',
    [GiftPaymentStatus.REFUNDED]: 'Reembolsado'
};