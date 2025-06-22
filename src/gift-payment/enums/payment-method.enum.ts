export enum PaymentMethod {
    CREDIT_CARD = 1,
    DEBIT_CARD = 2,
    PIX = 3,
    BANK_TRANSFER = 4,
    DIRECT_PURCHASE = 5
}

export const PaymentMethodLabels = {
    [PaymentMethod.PIX]: 'PIX',
    [PaymentMethod.CREDIT_CARD]: 'Cartão de Crédito',
    [PaymentMethod.DEBIT_CARD]: 'Cartão de Débito',
    [PaymentMethod.BANK_TRANSFER]: 'Transferência Bancária',
    [PaymentMethod.DIRECT_PURCHASE]: 'Compra Direta'
};
