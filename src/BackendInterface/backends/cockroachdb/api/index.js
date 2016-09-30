import getEventsByAggregate from './getEventsByAggregate'
import getEventsByAggregateTypes from './getEventsByAggregateTypes'
import getEventsByTypes from './getEventsByTypes'

const apiHandlersFactories = {
  getEventsByAggregate,
  getEventsByAggregateTypes,
  getEventsByTypes
}

export default apiHandlersFactories
