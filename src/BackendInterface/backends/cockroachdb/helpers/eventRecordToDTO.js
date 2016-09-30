function eventRecordToDTO (record) {
  let {
    id,
    type,
    aggregateUuid,
    aggregateType,
    storedOn,
    sequenceNumber,
    data,
    metadata,
    transactionId
  } = record

  return {
    id: parseInt(id, 10),
    type,
    aggregateIdentity: {
      uuid: aggregateUuid,
      type: aggregateType
    },
    storedOn,
    sequenceNumber: parseInt(sequenceNumber, 10),
    data: data.toString(),
    metadata: metadata.toString(),
    transactionId
  }
}

export default eventRecordToDTO
