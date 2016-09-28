// Import service methods
import Ping from './Ping'
import ReadAggregateStreamForwardFromVersion from './ReadAggregateStreamForwardFromVersion'
import ReadAggregateTypeStreamForwardFromEvent from './ReadAggregateTypeStreamForwardFromEvent'
import ReadEventTypeStreamForwardFromEvent from './ReadEventTypeStreamForwardFromEvent'
import ReadStoreStreamForwardFromEvent from './ReadStoreStreamForwardFromEvent'
import SubscribeToAggregateStream from './SubscribeToAggregateStream'
import SubscribeToAggregateStreamFromVersion from './SubscribeToAggregateStreamFromVersion'
import SubscribeToAggregateTypeStream from './SubscribeToAggregateTypeStream'
import SubscribeToAggregateTypeStreamFromEvent from './SubscribeToAggregateTypeStreamFromEvent'
import SubscribeToEventTypeStream from './SubscribeToEventTypeStream'
import SubscribeToEventTypeStreamFromEvent from './SubscribeToEventTypeStreamFromEvent'
import SubscribeToStoreStream from './SubscribeToStoreStream'
import SubscribeToStoreStreamFromEvent from './SubscribeToStoreStreamFromEvent'
import WriteToAggregateStream from './WriteToAggregateStream'
import WriteToMultipleAggregateStream from './WriteToMultipleAggregateStream'

function GRPCImplementationFactory ({backend, store}) {
  let interfaces = {backend, store}
  return {
    ping: Ping(interfaces),
    readAggregateStreamForwardFromVersion: ReadAggregateStreamForwardFromVersion(interfaces),
    readAggregateTypeStreamForwardFromEvent: ReadAggregateTypeStreamForwardFromEvent(interfaces),
    readEventTypeStreamForwardFromEvent: ReadEventTypeStreamForwardFromEvent(interfaces),
    readStoreStreamForwardFromEvent: ReadStoreStreamForwardFromEvent(interfaces),
    subscribeToAggregateStream: SubscribeToAggregateStream(interfaces),
    subscribeToAggregateStreamFromVersion: SubscribeToAggregateStreamFromVersion(interfaces),
    subscribeToAggregateTypeStream: SubscribeToAggregateTypeStream(interfaces),
    subscribeToAggregateTypeStreamFromEvent: SubscribeToAggregateTypeStreamFromEvent(interfaces),
    subscribeToEventTypeStream: SubscribeToEventTypeStream(interfaces),
    subscribeToEventTypeStreamFromEvent: SubscribeToEventTypeStreamFromEvent(interfaces),
    subscribeToStoreStream: SubscribeToStoreStream(interfaces),
    subscribeToStoreStreamFromEvent: SubscribeToStoreStreamFromEvent(interfaces),
    writeToAggregateStream: WriteToAggregateStream(interfaces),
    writeToMultipleAggregateStream: WriteToMultipleAggregateStream(interfaces)
  }
}

export default GRPCImplementationFactory
