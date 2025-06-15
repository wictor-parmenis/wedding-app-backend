-- Limpar dados existentes
TRUNCATE TABLE "GiftPayment" CASCADE;
TRUNCATE TABLE "Gift" CASCADE;
TRUNCATE TABLE "Couple" CASCADE;
TRUNCATE TABLE "Wedding" CASCADE;
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "WeddingStatus" CASCADE;
TRUNCATE TABLE "GiftStatus" CASCADE;
TRUNCATE TABLE "PaymentStatus" CASCADE;
TRUNCATE TABLE "PaymentMethod" CASCADE;

-- Status do Casamento
INSERT INTO "WeddingStatus" (id, name) VALUES (1, 'UPCOMING');
INSERT INTO "WeddingStatus" (id, name) VALUES (2, 'COMPLETED');
INSERT INTO "WeddingStatus" (id, name) VALUES (3, 'CANCELED');

-- Status do Presente
INSERT INTO "GiftStatus" (id, name) VALUES (1, 'AVAILABLE');
INSERT INTO "GiftStatus" (id, name) VALUES (2, 'RESERVED');
INSERT INTO "GiftStatus" (id, name) VALUES (3, 'PURCHASED');

-- Status do Pagamento
INSERT INTO "PaymentStatus" (id, name) VALUES (1, 'PENDING');
INSERT INTO "PaymentStatus" (id, name) VALUES (2, 'COMPLETED');
INSERT INTO "PaymentStatus" (id, name) VALUES (3, 'FAILED');
INSERT INTO "PaymentStatus" (id, name) VALUES (4, 'REFUNDED');

-- Métodos de Pagamento
INSERT INTO "PaymentMethod" (id, name) VALUES (1, 'CREDIT_CARD');
INSERT INTO "PaymentMethod" (id, name) VALUES (2, 'DEBIT_CARD');
INSERT INTO "PaymentMethod" (id, name) VALUES (3, 'PIX');
INSERT INTO "PaymentMethod" (id, name) VALUES (4, 'BANK_TRANSFER');

-- Usuários
INSERT INTO "User" (id, username, email, email_verified, phone_number, hash, salt, created_at, updated_at) VALUES 
(1, 'joao.silva', 'joao.silva@email.com', true, '+5511999999991', 'hash1', 'salt1', NOW(), NOW()),
(2, 'maria.santos', 'maria.santos@email.com', true, '+5511999999992', 'hash2', 'salt2', NOW(), NOW()),
(3, 'pedro.oliveira', 'pedro.oliveira@email.com', true, '+5511999999993', 'hash3', 'salt3', NOW(), NOW()),
(4, 'ana.pereira', 'ana.pereira@email.com', true, '+5511999999994', 'hash4', 'salt4', NOW(), NOW()),
(5, 'carlos.ferreira', 'carlos.ferreira@email.com', true, '+5511999999995', 'hash5', 'salt5', NOW(), NOW()),
(6, 'julia.costa', 'julia.costa@email.com', true, '+5511999999996', 'hash6', 'salt6', NOW(), NOW());

-- Casamentos
INSERT INTO "Wedding" (id, invitation_code, description, event_date, location, status_id, created_at, updated_at) VALUES 
(1, 'WEDDING2024001', 'Casamento João e Maria - Uma celebração ao ar livre', '2024-10-15 16:00:00', 'Chácara Sol Nascente - São Paulo, SP', 1, NOW(), NOW()),
(2, 'WEDDING2024002', 'Casamento Pedro e Ana - Cerimônia na praia', '2024-12-20 17:00:00', 'Resort Costa Azul - Florianópolis, SC', 1, NOW(), NOW()),
(3, 'WEDDING2024003', 'Casamento Carlos e Julia - Cerimônia tradicional', '2024-08-30 19:00:00', 'Catedral Metropolitana - Rio de Janeiro, RJ', 1, NOW(), NOW());

-- Casais
INSERT INTO "Couple" (id, user_id_1, user_id_2, name, wedding_id, created_at, updated_at) VALUES 
(1, 1, 2, 'João e Maria', 1, NOW(), NOW()),
(2, 3, 4, 'Pedro e Ana', 2, NOW(), NOW()),
(3, 5, 6, 'Carlos e Julia', 3, NOW(), NOW());

-- Presentes
INSERT INTO "Gift" (id, couple_id, url_image, description, price, status_id, created_at, updated_at) VALUES 
-- Presentes do Casal 1
(1, 1, 'https://example.com/gift1.jpg', 'Geladeira Frost Free 500L', 500000, 1, NOW(), NOW()),
(2, 1, 'https://example.com/gift2.jpg', 'Fogão 6 bocas', 250000, 1, NOW(), NOW()),
(3, 1, 'https://example.com/gift3.jpg', 'Jogo de Panelas Tramontina', 80000, 1, NOW(), NOW()),
-- Presentes do Casal 2
(4, 2, 'https://example.com/gift4.jpg', 'Smart TV 65"', 450000, 1, NOW(), NOW()),
(5, 2, 'https://example.com/gift5.jpg', 'Máquina de Lavar 12kg', 320000, 1, NOW(), NOW()),
(6, 2, 'https://example.com/gift6.jpg', 'Kit Cama/Mesa/Banho', 150000, 1, NOW(), NOW()),
-- Presentes do Casal 3
(7, 3, 'https://example.com/gift7.jpg', 'Microondas Embutir', 180000, 1, NOW(), NOW()),
(8, 3, 'https://example.com/gift8.jpg', 'Ar Condicionado Split', 280000, 1, NOW(), NOW()),
(9, 3, 'https://example.com/gift9.jpg', 'Jogo de Sofá', 550000, 1, NOW(), NOW());

-- Alguns pagamentos de exemplo
INSERT INTO "GiftPayment" (id, gift_id, user_id, amount, status_id, payment_method_id, transaction_id, payment_date, created_at, updated_at) VALUES 
(1, 1, 5, 250000, 2, 1, 'TRX123456', NOW(), NOW(), NOW()),
(2, 1, 6, 250000, 2, 3, 'TRX123457', NOW(), NOW(), NOW()),
(3, 4, 1, 450000, 2, 2, 'TRX123458', NOW(), NOW(), NOW()),
(4, 7, 2, 180000, 1, 4, 'TRX123459', NOW(), NOW(), NOW());

-- Reset das sequências
SELECT setval('"Gift_id_seq"', (SELECT MAX(id) FROM "Gift"));
SELECT setval('"GiftPayment_id_seq"', (SELECT MAX(id) FROM "GiftPayment"));
SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"));
SELECT setval('"Wedding_id_seq"', (SELECT MAX(id) FROM "Wedding"));
SELECT setval('"Couple_id_seq"', (SELECT MAX(id) FROM "Couple"));
SELECT setval('"WeddingStatus_id_seq"', (SELECT MAX(id) FROM "WeddingStatus"));
SELECT setval('"GiftStatus_id_seq"', (SELECT MAX(id) FROM "GiftStatus"));
SELECT setval('"PaymentStatus_id_seq"', (SELECT MAX(id) FROM "PaymentStatus"));
SELECT setval('"PaymentMethod_id_seq"', (SELECT MAX(id) FROM "PaymentMethod"));
