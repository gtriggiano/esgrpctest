import should from 'should/as-function'
import { random, max } from 'lodash'

import InMemorySimulation from '../../../tests/InMemorySimulation'

import GRPCImplementation from '..'

describe('.subscribeToStoreStreamFromEvent(call)', () => {
  it('invokes backend.getEvents() with right parameters', () => {
    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {
      fromEventId: random(-10, 10),
      limit: random(-10, 10)
    }

    implementation.subscribeToStoreStreamFromEvent(simulation.call)

    let calls = simulation.backend.getEvents.getCalls()
    should(calls.length).equal(1)
    should(calls[0].args[0].fromEventId).equal(max([0, simulation.call.request.fromEventId]))
    should(calls[0].args[0].limit).equal(undefined)
  })
  it('invokes call.write() for every fetched and live event, in the right sequence', (done) => {
    let fromEventId = data.events.size - 3
    let storedEvents = data.events.filter(evt => evt.get('id') > fromEventId)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {fromEventId}

    implementation.subscribeToStoreStreamFromEvent(simulation.call)
    simulation.store.publishEvents([
      {id: 100010},
      {id: 100011},
      {id: 100012}
    ])

    setTimeout(() => {
      let writeCalls = simulation.call.write.getCalls()
      should(writeCalls.length).equal(storedEvents.size + 3)
      should(writeCalls.map(({args}) => args[0] && args[0].id)).containDeepOrdered([100010, 100011, 100012])
      simulation.call.emit('end')
      done()
    }, storedEvents.size + 150)
  })
  it('stops invoking call.write() if client ends subscription', (done) => {
    let fromEventId = random(1, data.events.size)

    let simulation = InMemorySimulation(data)
    let implementation = GRPCImplementation(simulation)

    simulation.call.request = {fromEventId}

    implementation.subscribeToStoreStreamFromEvent(simulation.call)
    simulation.store.publishEvents([
      {id: 100010},
      {id: 100011},
      {id: 100012}
    ])

    setTimeout(() => {
      simulation.call.emit('end')
      simulation.store.publishEvents([
        {id: 100013},
        {id: 100014}
      ])
    }, 200)
    setTimeout(() => {
      let calls = simulation.call.write.getCalls()
      should(calls.map(({args}) => args[0] && args[0].id)).not.containDeepOrdered([100013, 100014])
      done()
    }, 350)
  })
})
