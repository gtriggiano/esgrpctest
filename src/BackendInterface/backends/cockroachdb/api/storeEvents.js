import { flatten, last } from 'lodash'
import EventEmitter from 'eventemitter3'

import createAggregate from '../operations/createAggregate'
import createAggregateSnapshot from '../operations/createAggregateSnapshot'
import getAggregate from '../operations/getAggregate'
import storeAggregateEvents from '../operations/storeAggregateEvents'
import updateAggregateVersion from '../operations/updateAggregateVersion'

import transactionWrapper from '../helpers/transactionWrapper'

import { prefixString } from '../../../../utils'

function storeEventsFactory (getConnection) {
  return ({writeRequests, transactionId}) => {
    let results = new EventEmitter()

    getConnection((err, {client, release}) => {
      if (err) return results.emit('error', err)
      transactionWrapper(
        client,
        (client, done) => {
          Promise.all(
            writeRequests.map(request =>
              writeToAggregateStream(client, request, transactionId)
            )
          )
          .then(responses => {
            let errors = responses.filter(response => !!response.error)
            if (errors.length) throw new Error(errors)
            return flatten(responses)
          })
          .then(storedEvents => done(null, storedEvents))
          .catch(done)
        },
        (err, storedEvents) => {
          release()
          if (err) return results.emit('error', err)
          results.emit('storedEvents', storedEvents)
        }
      )
    })

    return results
  }
}

function writeToAggregateStream (client, request, transactionId) {
  let { aggregateIdentity, events, expectedAggregateVersion, snapshot } = request

  let eMsg = prefixString(`[${aggregateIdentity.type}@${aggregateIdentity.uuid}] `)

  let consistentVersioningRequired = expectedAggregateVersion >= 0

  return getAggregate(client, aggregateIdentity)
    .then(aggregate => {
      if (!consistentVersioningRequired) return aggregate || createAggregate(client, aggregateIdentity)

      if (!aggregate) throw new Error(eMsg('Aggregate does not exists'))
      if (aggregate.version !== expectedAggregateVersion) throw new Error(eMsg('Aggregate version mismatch'))

      return aggregate
    })
    .then(aggregate =>
      storeAggregateEvents(
        client,
        aggregate,
        events,
        transactionId
      )
    )
    .then(storedEvents =>
      updateAggregateVersion(
        client,
        aggregateIdentity,
        last(storedEvents).sequenceNumber
      ).then(() => storedEvents)
    )
    .then(storedEvents =>
      snapshot
        ? createAggregateSnapshot(
            client,
            aggregateIdentity,
            last(storedEvents).sequenceNumber,
            snapshot
          ).then(() => storedEvents)
        : storedEvents
    )
    .catch(error => ({error}))
}

export default storeEventsFactory
