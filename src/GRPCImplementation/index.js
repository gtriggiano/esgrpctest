// Import service methods
import Ping from './Ping'
import ReadAggregateStreamForwardFromVersion from './ReadAggregateStreamForwardFromVersion'
import ReadAggregateTypesStreamForwardFromEvent from './ReadAggregateTypesStreamForwardFromEvent'
import ReadEventTypesStreamForwardFromEvent from './ReadEventTypesStreamForwardFromEvent'
import ReadStoreStreamForwardFromEvent from './ReadStoreStreamForwardFromEvent'
import SubscribeToAggregateStream from './SubscribeToAggregateStream'
import SubscribeToAggregateStreamFromVersion from './SubscribeToAggregateStreamFromVersion'
import SubscribeToAggregateTypesStream from './SubscribeToAggregateTypesStream'
import SubscribeToAggregateTypesStreamFromEvent from './SubscribeToAggregateTypesStreamFromEvent'
import SubscribeToEventTypesStream from './SubscribeToEventTypesStream'
import SubscribeToEventTypesStreamFromEvent from './SubscribeToEventTypesStreamFromEvent'
import SubscribeToStoreStream from './SubscribeToStoreStream'
import SubscribeToStoreStreamFromEvent from './SubscribeToStoreStreamFromEvent'
import WriteToAggregateStream from './WriteToAggregateStream'
import WriteToMultipleAggregateStream from './WriteToMultipleAggregateStream'

function GRPCImplementationFactory ({backend, store}) {
  let interfaces = {backend, store}
  return {
    ping: Ping(interfaces),
    readAggregateStreamForwardFromVersion: ReadAggregateStreamForwardFromVersion(interfaces),
    readAggregateTypesStreamForwardFromEvent: ReadAggregateTypesStreamForwardFromEvent(interfaces),
    readEventTypesStreamForwardFromEvent: ReadEventTypesStreamForwardFromEvent(interfaces),
    readStoreStreamForwardFromEvent: ReadStoreStreamForwardFromEvent(interfaces),
    subscribeToAggregateStream: SubscribeToAggregateStream(interfaces),
    subscribeToAggregateStreamFromVersion: SubscribeToAggregateStreamFromVersion(interfaces),
    subscribeToAggregateTypesStream: SubscribeToAggregateTypesStream(interfaces),
    subscribeToAggregateTypesStreamFromEvent: SubscribeToAggregateTypesStreamFromEvent(interfaces),
    subscribeToEventTypesStream: SubscribeToEventTypesStream(interfaces),
    subscribeToEventTypesStreamFromEvent: SubscribeToEventTypesStreamFromEvent(interfaces),
    subscribeToStoreStream: SubscribeToStoreStream(interfaces),
    subscribeToStoreStreamFromEvent: SubscribeToStoreStreamFromEvent(interfaces),
    writeToAggregateStream: WriteToAggregateStream(interfaces),
    writeToMultipleAggregateStream: WriteToMultipleAggregateStream(interfaces)
  }
}

export default GRPCImplementationFactory
