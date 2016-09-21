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

function getGRPCServer () {
  const gRPCEventStoreProtocol = grpc.load(PROTOCOL_FILE_PATH).gRPCEventStore
  const _grpcServer = new grpc.Server()
  _grpcServer.addProtoService(gRPCEventStoreProtocol.Api.service, {
    ping: Ping(),
    readAggregateStreamForwardFromCursor: ReadAggregateStreamForwardFromCursor(),
    readAggregateTypeStreamForward: ReadAggregateTypeStreamForward(),
    readEventTypeStreamForward: ReadEventTypeStreamForward(),
    readStoreStreamForward: ReadStoreStreamForward(),
    subscribeToAggregateStream: SubscribeToAggregateStream(),
    subscribeToAggregateStreamFromCursor: SubscribeToAggregateStreamFromCursor(),
    subscribeToAggregateTypeStream: SubscribeToAggregateTypeStream(),
    subscribeToAggregateTypeStreamFrom: SubscribeToAggregateTypeStreamFrom(),
    subscribeToEventTypeStream: SubscribeToEventTypeStream(),
    subscribeToEventTypeStreamFrom: SubscribeToEventTypeStreamFrom(),
    subscribeToStoreStream: SubscribeToStoreStream(),
    subscribeToStoreStreamFromCursor: SubscribeToStoreStreamFromCursor(),
    writeToAggregateStream: WriteToAggregateStream(),
    writeToMultipleAggregateStream: WriteToMultipleAggregateStream()
  })
}

export default getGRPCServer
