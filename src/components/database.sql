-- ============================================
-- Sujet 4 : Gestion des Employés avec Triggers
-- Importez ce fichier dans phpMyAdmin
-- ============================================

CREATE DATABASE IF NOT EXISTS gestion_employes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_employes;

-- ============================================
-- TABLE PRINCIPALE
-- ============================================
CREATE TABLE IF NOT EXISTS employe (
    matricule VARCHAR(20) PRIMARY KEY,
    nom       VARCHAR(100) NOT NULL,
    salaire   DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLE D'AUDIT
-- ============================================
CREATE TABLE IF NOT EXISTS audit_employe (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    type_action   ENUM('ajout','modification','suppression') NOT NULL,
    date_maj      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    matricule     VARCHAR(20),
    nom           VARCHAR(100),
    salaire_ancien DECIMAL(12,2) DEFAULT NULL,
    salaire_nouv  DECIMAL(12,2) DEFAULT NULL,
    user          VARCHAR(100)
) ENGINE=InnoDB;

-- ============================================
-- TRIGGERS
-- ============================================
DELIMITER $$

-- 1. AFTER INSERT
DROP TRIGGER IF EXISTS trg_insert_employe$$
CREATE TRIGGER trg_insert_employe
AFTER INSERT ON employe
FOR EACH ROW
BEGIN
    INSERT INTO audit_employe
        (type_action, date_maj, matricule, nom, salaire_ancien, salaire_nouv, user)
    VALUES
        ('ajout', NOW(), NEW.matricule, NEW.nom, NULL, NEW.salaire, CURRENT_USER());
END$$

-- 2. AFTER UPDATE
DROP TRIGGER IF EXISTS trg_update_employe$$
CREATE TRIGGER trg_update_employe
AFTER UPDATE ON employe
FOR EACH ROW
BEGIN
    INSERT INTO audit_employe
        (type_action, date_maj, matricule, nom, salaire_ancien, salaire_nouv, user)
    VALUES
        ('modification', NOW(), NEW.matricule, NEW.nom, OLD.salaire, NEW.salaire, CURRENT_USER());
END$$

-- 3. AFTER DELETE
DROP TRIGGER IF EXISTS trg_delete_employe$$
CREATE TRIGGER trg_delete_employe
AFTER DELETE ON employe
FOR EACH ROW
BEGIN
    INSERT INTO audit_employe
        (type_action, date_maj, matricule, nom, salaire_ancien, salaire_nouv, user)
    VALUES
        ('suppression', NOW(), OLD.matricule, OLD.nom, OLD.salaire, NULL, CURRENT_USER());
END$$

DELIMITER ;

-- ============================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================
INSERT INTO employe VALUES
  ('EMP001', 'Rakoto Jean',     2500000.00),
  ('EMP002', 'Rabe Marie',      3200000.00),
  ('EMP003', 'Andry Paul',      2800000.00),
  ('EMP004', 'Soa Nathalie',    3500000.00),
  ('EMP005', 'Hery Fernand',    2200000.00);

-- Simulation de quelques opérations pour peupler l'audit
UPDATE employe SET salaire = 2700000 WHERE matricule = 'EMP001';
UPDATE employe SET salaire = 3400000 WHERE matricule = 'EMP002';
DELETE FROM employe WHERE matricule = 'EMP005';
INSERT INTO employe VALUES ('EMP006', 'Fara Elise', 2900000.00);