import should from 'should/as-function'
import EventEmitter from 'eventemitter3'

import { ServiceNode } from '../src'
import { getSimulationData } from './InMemorySimulation'
global.data = getSimulationData()

describe('GRPC Event Store Package Unit Tests', function () {
  it('should be fun to work with', () => {})
  it(`let ServiceNode = require('grpc-event-store').ServiceNode; typeof ServiceNode === 'function'`, () => {
    should(ServiceNode).be.a.Function()
  })
  it(`let eventStoreNode = ServiceNode(); eventStoreNode instanceof EventEmitter === true`, () => {
    let eventStore = ServiceNode()
    should(eventStore).be.an.instanceof(EventEmitter)
  })
})

require('../src/_unitTestUtils')
require('../src/_unitTestBackendInterface')
require('../src/_unitTestStoreInterface')
require('../src/_unitTestGRPCInterface')
require('../src/_unitTestGRPCImplementation')
require('../src/_unitTestServiceNode')
