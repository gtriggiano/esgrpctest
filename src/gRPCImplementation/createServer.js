import grpc from 'grpc'

// Import service methods
import Ping from './Ping'
import ReadAggregateStreamForwardFromCursor from './ReadAggregateStreamForwardFromCursor'
import ReadAggregateTypeStreamForwardFromCursor from './ReadAggregateTypeStreamForwardFromCursor'
import ReadEventTypeStreamForwardFromCursor from './ReadEventTypeStreamForwardFromCursor'
import ReadStoreStreamForwardFromCursor from './ReadStoreStreamForwardFromCursor'
import SubscribeToAggregateStream from './SubscribeToAggregateStream'
import SubscribeToAggregateStreamFromCursor from './SubscribeToAggregateStreamFromCursor'
import SubscribeToAggregateTypeStream from './SubscribeToAggregateTypeStream'
import SubscribeToAggregateTypeStreamFromCursor from './SubscribeToAggregateTypeStreamFromCursor'
import SubscribeToEventTypeStream from './SubscribeToEventTypeStream'
import SubscribeToEventTypeStreamFromCursor from './SubscribeToEventTypeStreamFromCursor'
import SubscribeToStoreStream from './SubscribeToStoreStream'
import SubscribeToStoreStreamFromCursor from './SubscribeToStoreStreamFromCursor'
import WriteToAggregateStream from './WriteToAggregateStream'
import WriteToMultipleAggregateStream from './WriteToMultipleAggregateStream'

const PROTOCOL_FILE_PATH = `${__dirname}/../../gRPCEventStore.proto`

function createGRPCServer (eventStore) {
  const gRPCEventStoreProtocol = grpc.load(PROTOCOL_FILE_PATH).gRPCEventStore
  const _grpcServer = new grpc.Server()
  _grpcServer.addProtoService(gRPCEventStoreProtocol.Api.service, {
    ping: Ping(eventStore),
    readAggregateStreamForwardFromCursor: ReadAggregateStreamForwardFromCursor(eventStore),
    readAggregateTypeStreamForwardFromCursor: ReadAggregateTypeStreamForwardFromCursor(eventStore),
    readEventTypeStreamForwardFromCursor: ReadEventTypeStreamForwardFromCursor(eventStore),
    readStoreStreamForwardFromCursor: ReadStoreStreamForwardFromCursor(eventStore),
    subscribeToAggregateStream: SubscribeToAggregateStream(eventStore),
    subscribeToAggregateStreamFromCursor: SubscribeToAggregateStreamFromCursor(eventStore),
    subscribeToAggregateTypeStream: SubscribeToAggregateTypeStream(eventStore),
    subscribeToAggregateTypeStreamFromCursor: SubscribeToAggregateTypeStreamFromCursor(eventStore),
    subscribeToEventTypeStream: SubscribeToEventTypeStream(eventStore),
    subscribeToEventTypeStreamFromCursor: SubscribeToEventTypeStreamFromCursor(eventStore),
    subscribeToStoreStream: SubscribeToStoreStream(eventStore),
    subscribeToStoreStreamFromCursor: SubscribeToStoreStreamFromCursor(eventStore),
    writeToAggregateStream: WriteToAggregateStream(eventStore),
    writeToMultipleAggregateStream: WriteToMultipleAggregateStream(eventStore)
  })
}

export default createGRPCServer
