-- FAP · Futbol Aruba Predición — esquema de base de datos
-- Ejecutar una vez en la base de datos MySQL del hosting (phpMyAdmin de Hostinger, por ejemplo).

CREATE TABLE IF NOT EXISTS predictions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  voter_id VARCHAR(64) NOT NULL,
  top_scorer VARCHAR(80) NULL,
  top_assist VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_voter (voter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS prediction_teams (
  prediction_id INT UNSIGNED NOT NULL,
  team_id VARCHAR(32) NOT NULL,
  position TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (prediction_id, team_id),
  KEY idx_team (team_id),
  CONSTRAINT fk_prediction
    FOREIGN KEY (prediction_id) REFERENCES predictions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
