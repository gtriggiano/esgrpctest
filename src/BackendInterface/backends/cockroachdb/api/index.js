import getEvents from './getEvents'
import getEventsByAggregate from './getEventsByAggregate'
import getEventsByAggregateTypes from './getEventsByAggregateTypes'
import getEventsByTypes from './getEventsByTypes'

const apiHandlersFactories = {
  getEvents,
  getEventsByAggregate,
  getEventsByAggregateTypes,
  getEventsByTypes
}

export default apiHandlersFactories
