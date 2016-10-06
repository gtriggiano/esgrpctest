import Ping from './Ping'
import GetUid from './GetUid'

// Aggregates Queries
import GetLastAggregateSnaphot from './aggregatesQueries/GetLastAggregateSnaphot'
import ReadAggregateStreamForwardFromVersion from './aggregatesQueries/ReadAggregateStreamForwardFromVersion'
import SubscribeToAggregateStream from './aggregatesQueries/SubscribeToAggregateStream'
import SubscribeToAggregateStreamFromVersion from './aggregatesQueries/SubscribeToAggregateStreamFromVersion'

// Aggregates Types Queries
import ReadAggregateTypesStreamForwardFromEvent from './aggregatesTypesQueries/ReadAggregateTypesStreamForwardFromEvent'
import SubscribeToAggregateTypesStream from './aggregatesTypesQueries/SubscribeToAggregateTypesStream'
import SubscribeToAggregateTypesStreamFromEvent from './aggregatesTypesQueries/SubscribeToAggregateTypesStreamFromEvent'

// Events Types Queries
import ReadEventTypesStreamForwardFromEvent from './eventsTypesQueries/ReadEventTypesStreamForwardFromEvent'
import SubscribeToEventTypesStream from './eventsTypesQueries/SubscribeToEventTypesStream'
import SubscribeToEventTypesStreamFromEvent from './eventsTypesQueries/SubscribeToEventTypesStreamFromEvent'

// Store Queries
import ReadStoreStreamForwardFromEvent from './storeQueries/ReadStoreStreamForwardFromEvent'
import SubscribeToStoreStream from './storeQueries/SubscribeToStoreStream'
import SubscribeToStoreStreamFromEvent from './storeQueries/SubscribeToStoreStreamFromEvent'

// Write Procedures
import WriteToAggregateStream from './writeProcedures/WriteToAggregateStream'
import WriteToMultipleAggregateStream from './writeProcedures/WriteToMultipleAggregateStream'

function GRPCImplementationFactory ({backend, store}) {
  let interfaces = {backend, store}
  return {
    ping: Ping(interfaces),
    getUid: GetUid(interfaces),

    // Aggregates Queries
    getLastAggregateSnaphot: GetLastAggregateSnaphot(interfaces),
    readAggregateStreamForwardFromVersion: ReadAggregateStreamForwardFromVersion(interfaces),
    subscribeToAggregateStream: SubscribeToAggregateStream(interfaces),
    subscribeToAggregateStreamFromVersion: SubscribeToAggregateStreamFromVersion(interfaces),

    // Aggregates Types Queries
    readAggregateTypesStreamForwardFromEvent: ReadAggregateTypesStreamForwardFromEvent(interfaces),
    subscribeToAggregateTypesStream: SubscribeToAggregateTypesStream(interfaces),
    subscribeToAggregateTypesStreamFromEvent: SubscribeToAggregateTypesStreamFromEvent(interfaces),

    // Events Types Queries
    readEventTypesStreamForwardFromEvent: ReadEventTypesStreamForwardFromEvent(interfaces),
    subscribeToEventTypesStream: SubscribeToEventTypesStream(interfaces),
    subscribeToEventTypesStreamFromEvent: SubscribeToEventTypesStreamFromEvent(interfaces),

    // Store Queries
    readStoreStreamForwardFromEvent: ReadStoreStreamForwardFromEvent(interfaces),
    subscribeToStoreStream: SubscribeToStoreStream(interfaces),
    subscribeToStoreStreamFromEvent: SubscribeToStoreStreamFromEvent(interfaces),

    // Write Procedures
    writeToAggregateStream: WriteToAggregateStream(interfaces),
    writeToMultipleAggregateStream: WriteToMultipleAggregateStream(interfaces)
  }
}

export default GRPCImplementationFactory
