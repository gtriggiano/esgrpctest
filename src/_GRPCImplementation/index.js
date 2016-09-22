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

function GRPCImplementationFactory ({backend, store}) {
  let interfaces = {backend, store}
  return {
    ping: Ping(interfaces),
    readAggregateStreamForwardFromCursor: ReadAggregateStreamForwardFromCursor(interfaces),
    readAggregateTypeStreamForwardFromCursor: ReadAggregateTypeStreamForwardFromCursor(interfaces),
    readEventTypeStreamForwardFromCursor: ReadEventTypeStreamForwardFromCursor(interfaces),
    readStoreStreamForwardFromCursor: ReadStoreStreamForwardFromCursor(interfaces),
    subscribeToAggregateStream: SubscribeToAggregateStream(interfaces),
    subscribeToAggregateStreamFromCursor: SubscribeToAggregateStreamFromCursor(interfaces),
    subscribeToAggregateTypeStream: SubscribeToAggregateTypeStream(interfaces),
    subscribeToAggregateTypeStreamFromCursor: SubscribeToAggregateTypeStreamFromCursor(interfaces),
    subscribeToEventTypeStream: SubscribeToEventTypeStream(interfaces),
    subscribeToEventTypeStreamFromCursor: SubscribeToEventTypeStreamFromCursor(interfaces),
    subscribeToStoreStream: SubscribeToStoreStream(interfaces),
    subscribeToStoreStreamFromCursor: SubscribeToStoreStreamFromCursor(interfaces),
    writeToAggregateStream: WriteToAggregateStream(interfaces),
    writeToMultipleAggregateStream: WriteToMultipleAggregateStream(interfaces)
  }
}

export default GRPCImplementationFactory
