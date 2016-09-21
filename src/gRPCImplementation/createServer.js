import grpc from 'grpc'

// Import service methods
import Ping from './Ping'
import ReadAggregateStreamForwardFromCursor from './ReadAggregateStreamForwardFromCursor'
import ReadAggregateTypeStreamForward from './ReadAggregateTypeStreamForward'
import ReadEventTypeStreamForward from './ReadEventTypeStreamForward'
import ReadStoreStreamForward from './ReadStoreStreamForward'
import SubscribeToAggregateStream from './SubscribeToAggregateStream'
import SubscribeToAggregateStreamFromCursor from './SubscribeToAggregateStreamFromCursor'
import SubscribeToAggregateTypeStream from './SubscribeToAggregateTypeStream'
import SubscribeToAggregateTypeStreamFrom from './SubscribeToAggregateTypeStreamFrom'
import SubscribeToEventTypeStream from './SubscribeToEventTypeStream'
import SubscribeToEventTypeStreamFrom from './SubscribeToEventTypeStreamFrom'
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
    readAggregateTypeStreamForward: ReadAggregateTypeStreamForward(eventStore),
    readEventTypeStreamForward: ReadEventTypeStreamForward(eventStore),
    readStoreStreamForward: ReadStoreStreamForward(eventStore),
    subscribeToAggregateStream: SubscribeToAggregateStream(eventStore),
    subscribeToAggregateStreamFromCursor: SubscribeToAggregateStreamFromCursor(eventStore),
    subscribeToAggregateTypeStream: SubscribeToAggregateTypeStream(eventStore),
    subscribeToAggregateTypeStreamFrom: SubscribeToAggregateTypeStreamFrom(eventStore),
    subscribeToEventTypeStream: SubscribeToEventTypeStream(eventStore),
    subscribeToEventTypeStreamFrom: SubscribeToEventTypeStreamFrom(eventStore),
    subscribeToStoreStream: SubscribeToStoreStream(eventStore),
    subscribeToStoreStreamFromCursor: SubscribeToStoreStreamFromCursor(eventStore),
    writeToAggregateStream: WriteToAggregateStream(eventStore),
    writeToMultipleAggregateStream: WriteToMultipleAggregateStream(eventStore)
  })
}

export default createGRPCServer
