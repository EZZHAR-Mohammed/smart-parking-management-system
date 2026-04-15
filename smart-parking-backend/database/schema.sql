-- ============================================================
-- SMART PARKING MANAGEMENT SYSTEM — Schéma PostgreSQL
-- Compatible pgAdmin 4
-- ============================================================

-- Créer la base de données (à exécuter en dehors de la base)
-- CREATE DATABASE smart_parking;

-- ============================================================
-- TABLES
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    phone       VARCHAR(20),
    "isActive"  BOOLEAN      NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Parking Spots
CREATE TABLE IF NOT EXISTS parking_spots (
    id              SERIAL PRIMARY KEY,
    number          VARCHAR(20)   NOT NULL UNIQUE,
    status          VARCHAR(20)   NOT NULL DEFAULT 'free'
                        CHECK (status IN ('free','occupied','reserved','maintenance')),
    type            VARCHAR(20)   NOT NULL DEFAULT 'normal'
                        CHECK (type IN ('normal','vip','handicap','electric')),
    floor           VARCHAR(10)   NOT NULL DEFAULT 'RDC',
    section         VARCHAR(10),
    "pricePerHour"  DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    "createdAt"     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id             SERIAL PRIMARY KEY,
    "userId"       INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "spotId"       INTEGER       NOT NULL REFERENCES parking_spots(id) ON DELETE CASCADE,
    "startTime"    TIMESTAMPTZ   NOT NULL,
    "endTime"      TIMESTAMPTZ,
    status         VARCHAR(20)   NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','completed','cancelled')),
    "totalAmount"  DECIMAL(10,2),
    "vehiclePlate" VARCHAR(20),
    notes          TEXT,
    "createdAt"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id           SERIAL PRIMARY KEY,
    "userId"     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type         VARCHAR(20)   NOT NULL CHECK (type IN ('monthly','annual')),
    "startDate"  DATE          NOT NULL,
    "endDate"    DATE          NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','expired','cancelled')),
    price        DECIMAL(10,2) NOT NULL,
    "autoRenew"  BOOLEAN       NOT NULL DEFAULT FALSE,
    "createdAt"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id               SERIAL PRIMARY KEY,
    "userId"         INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "reservationId"  INTEGER       REFERENCES reservations(id) ON DELETE SET NULL,
    "subscriptionId" INTEGER       REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount           DECIMAL(10,2) NOT NULL,
    method           VARCHAR(20)   NOT NULL DEFAULT 'card'
                         CHECK (method IN ('card','cash','transfer','online')),
    status           VARCHAR(20)   NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','completed','failed','refunded')),
    "transactionRef" VARCHAR(100),
    date             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "createdAt"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "updatedAt"      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_spots_status  ON parking_spots(status);
CREATE INDEX IF NOT EXISTS idx_spots_type    ON parking_spots(type);
CREATE INDEX IF NOT EXISTS idx_res_user      ON reservations("userId");
CREATE INDEX IF NOT EXISTS idx_res_spot      ON reservations("spotId");
CREATE INDEX IF NOT EXISTS idx_res_status    ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_sub_user      ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_pay_user      ON payments("userId");

-- ============================================================
-- SEED DATA — Données initiales pour tester
-- ============================================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin Parking', 'admin@parking.com',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAE.TYX0GNO', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Test user (password: user123)
INSERT INTO users (name, email, password, role) VALUES
('Mohamed Alami', 'user@parking.com',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uADR/PjDO', 'user')
ON CONFLICT (email) DO NOTHING;

-- Parking spots
INSERT INTO parking_spots (number, type, floor, section, "pricePerHour") VALUES
('A-01', 'normal',   'RDC', 'A', 5.00),
('A-02', 'normal',   'RDC', 'A', 5.00),
('A-03', 'normal',   'RDC', 'A', 5.00),
('A-04', 'normal',   'RDC', 'A', 5.00),
('A-05', 'normal',   'RDC', 'A', 5.00),
('B-01', 'vip',      'RDC', 'B', 10.00),
('B-02', 'vip',      'RDC', 'B', 10.00),
('C-01', 'handicap', 'RDC', 'C', 3.00),
('C-02', 'handicap', 'RDC', 'C', 3.00),
('D-01', 'electric', 'R+1', 'D', 8.00),
('D-02', 'electric', 'R+1', 'D', 8.00),
('E-01', 'normal',   'R+1', 'E', 5.00),
('E-02', 'normal',   'R+1', 'E', 5.00),
('E-03', 'normal',   'R+1', 'E', 5.00),
('E-04', 'normal',   'R+1', 'E', 5.00)
ON CONFLICT (number) DO NOTHING;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'users'         AS table_name, COUNT(*) FROM users
UNION ALL
SELECT 'parking_spots', COUNT(*) FROM parking_spots
UNION ALL
SELECT 'reservations',  COUNT(*) FROM reservations
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'payments',      COUNT(*) FROM payments;
