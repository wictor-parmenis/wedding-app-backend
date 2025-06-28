-- Limpar dados existentes
TRUNCATE TABLE "GiftPayment" CASCADE;
TRUNCATE TABLE "GiftReservation" CASCADE;
TRUNCATE TABLE "Gift" CASCADE;
TRUNCATE TABLE "Couple" CASCADE;
TRUNCATE TABLE "Wedding" CASCADE;
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "WeddingStatus" CASCADE;
TRUNCATE TABLE "GiftStatus" CASCADE;
TRUNCATE TABLE "PaymentStatus" CASCADE;
TRUNCATE TABLE "PaymentMethod" CASCADE;

-- Status do Casamento
INSERT INTO "WeddingStatus" (id, name) VALUES 
(1, 'UPCOMING'),
(2, 'COMPLETED'),
(3, 'CANCELED');

-- Status do Presente
INSERT INTO "GiftStatus" (id, name) VALUES 
(1, 'AVAILABLE'),
(2, 'RESERVED'),
(3, 'PURCHASED');

-- Status do Pagamento
INSERT INTO "PaymentStatus" (id, name) VALUES 
(1, 'PENDING'),
(2, 'COMPLETED'),
(3, 'FAILED'),
(4, 'REFUNDED');

-- Métodos de Pagamento
INSERT INTO "PaymentMethod" (id, name) VALUES 
(1, 'CREDIT_CARD'),
(2, 'DEBIT_CARD'),
(3, 'PIX'),
(4, 'BANK_TRANSFER'),
(5, 'DIRECT_PURCHASE');

-- Usuários
INSERT INTO "User" (id, external_id, username, email, email_verified, phone_number, created_at, updated_at) VALUES 
(1, 'auth0|1', 'joao.silva', 'joao.silva@email.com', true, '+5511999999991', NOW(), NOW()),
(2, 'auth0|2', 'maria.santos', 'maria.santos@email.com', true, '+5511999999992', NOW(), NOW()),
(3, 'auth0|3', 'pedro.oliveira', 'pedro.oliveira@email.com', true, '+5511999999993', NOW(), NOW());

-- Casamentos
INSERT INTO "Wedding" (id, invitation_code, description, event_date, location, status_id, created_at, updated_at) VALUES 
(1, 'WEDDING2024001', 'Casamento João e Maria', '2024-10-15 16:00:00', 'São Paulo, SP', 1, NOW(), NOW()),
(2, 'WEDDING2024002', 'Casamento Pedro', '2024-12-20 17:00:00', 'Florianópolis, SC', 1, NOW(), NOW());

-- Casais (agora com apenas um user_id)
INSERT INTO "Couple" (id, user_id, name, wedding_id, created_at, updated_at) VALUES 
(1, 1, 'João e Maria', 1, NOW(), NOW()),
(2, 3, 'Pedro e Ana', 2, NOW(), NOW());

-- Presentes
INSERT INTO "Gift" (id, wedding_id, url_image, description, price, status_id, created_at, updated_at) VALUES 
(1, 1, 'https://example.com/gift1.jpg', 'Geladeira Frost Free 500L', 500000, 1, NOW(), NOW()),
(2, 1, 'https://example.com/gift2.jpg', 'Fogão 6 bocas', 250000, 1, NOW(), NOW()),
(3, 2, 'https://example.com/gift3.jpg', 'Smart TV 65"', 450000, 1, NOW(), NOW());

-- Pagamentos
INSERT INTO "GiftPayment" (id, gift_id, user_id, amount, status_id, payment_method_id, transaction_id, payment_date, created_at, updated_at) VALUES 
(1, 1, 2, 250000, 2, 1, 'TRX123456', NOW(), NOW(), NOW()),
(2, 3, 1, 450000, 2, 3, 'TRX123457', NOW(), NOW(), NOW());

-- Reservas de Presentes
INSERT INTO "GiftReservation" (id, user_id, gift_id, ttl, created_at, updated_at) VALUES 
(1, 2, 2, NOW() + INTERVAL '24 HOURS', NOW(), NOW());

-- Reset das sequências
SELECT setval('"Gift_id_seq"', (SELECT MAX(id) FROM "Gift"));
SELECT setval('"GiftPayment_id_seq"', (SELECT MAX(id) FROM "GiftPayment"));
SELECT setval('"GiftReservation_id_seq"', (SELECT MAX(id) FROM "GiftReservation"));
SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"));
SELECT setval('"Wedding_id_seq"', (SELECT MAX(id) FROM "Wedding"));
SELECT setval('"Couple_id_seq"', (SELECT MAX(id) FROM "Couple"));
SELECT setval('"WeddingStatus_id_seq"', (SELECT MAX(id) FROM "WeddingStatus"));
SELECT setval('"GiftStatus_id_seq"', (SELECT MAX(id) FROM "GiftStatus"));
SELECT setval('"PaymentStatus_id_seq"', (SELECT MAX(id) FROM "PaymentStatus"));
SELECT setval('"PaymentMethod_id_seq"', (SELECT MAX(id) FROM "PaymentMethod"));