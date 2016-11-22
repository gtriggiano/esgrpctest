"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function eventRecordToDTO(record) {
  var id = record.id,
      type = record.type,
      aggregateId = record.aggregateId,
      aggregateType = record.aggregateType,
      storedOn = record.storedOn,
      sequenceNumber = record.sequenceNumber,
      data = record.data,
      metadata = record.metadata,
      transactionId = record.transactionId;


  return {
    id: parseInt(id, 10),
    type: type,
    aggregateIdentity: {
      id: aggregateId,
      type: aggregateType
    },
    storedOn: storedOn,
    sequenceNumber: parseInt(sequenceNumber, 10),
    data: data.toString(),
    metadata: metadata.toString(),
    transactionId: transactionId
  };
}

exports.default = eventRecordToDTO;