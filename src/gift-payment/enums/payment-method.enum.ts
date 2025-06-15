export enum PaymentMethod {
    PIX = 1,
    CREDIT_CARD = 2,
    BANK_TRANSFER = 3
}

export const PaymentMethodLabels = {
    [PaymentMethod.PIX]: 'PIX',
    [PaymentMethod.CREDIT_CARD]: 'Cartão de Crédito',
    [PaymentMethod.BANK_TRANSFER]: 'Transferência Bancária'
};
