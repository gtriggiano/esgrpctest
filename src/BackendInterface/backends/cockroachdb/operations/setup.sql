CREATE TABLE IF NOT EXISTS aggregates (
  uuid STRING(256) UNIQUE NOT NULL,
  type STRING(256) NOT NULL,
  version INT NOT NULL CHECK (version >= -1),

  PRIMARY KEY (uuid, type),
  INDEX by_type_idx (type)
);

CREATE TABLE IF NOT EXISTS events (
  id INT UNIQUE DEFAULT UNIQUE_ROWID(),
  type STRING(256) NOT NULL,
  aggregateUuid STRING(256) NOT NULL,
  aggregateType STRING(256) NOT NULL,
  storedOn TIMESTAMP NOT NULL DEFAULT NOW(),
  sequenceNumber INT NOT NULL CHECK (sequenceNumber >= 0),
  data BYTES NOT NULL,
  metadata BYTES NOT NULL,
  transactionId STRING(256) NOT NULL,

  PRIMARY KEY (aggregateUuid, aggregateType, sequenceNumber),
  FOREIGN KEY (aggregateUuid, aggregateType) REFERENCES aggregates (uuid, type),
  INDEX by_type_idx (type),
  INDEX by_aggregate_type_idx (aggregateType),
  INDEX by_storageDate_idx (storedOn),
  INDEX by_transaction_id_idx (transactionId)
);

CREATE TABLE IF NOT EXISTS snapshots (
  aggregateUuid STRING(256) NOT NULL,
  aggregateType STRING(256) NOT NULL,
  version INT CHECK (version >= 0),
  data BYTES NOT NULL,

  PRIMARY KEY (aggregateUuid, aggregateType, version),
  FOREIGN KEY (aggregateUuid, aggregateType) REFERENCES aggregates (uuid, type)
);
