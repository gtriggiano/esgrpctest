import getEvents from './getEvents'
import getEventsByAggregate from './getEventsByAggregate'
import getEventsByAggregateTypes from './getEventsByAggregateTypes'
import getEventsByTypes from './getEventsByTypes'
import getLastSnapshotOfAggregate from './getLastSnapshotOfAggregate'
import storeEvents from './storeEvents'

const apiHandlersFactories = {
  getEvents,
  getEventsByAggregate,
  getEventsByAggregateTypes,
  getEventsByTypes,
  getLastSnapshotOfAggregate,
  storeEvents
}

export default apiHandlersFactories
