import should from 'should/as-function'
import Rx from 'rxjs'

import FixtureBusNode from '../tests/FixtureBusNode'

import {
  eventStreamFromBus
} from './utils'

describe('Utilities', () => {
  describe('eventStreamFromBus(busNode[, delayTime])', () => {
    function _fireEventsListsOnBusNode (busNode, eventsLists) {
      Object.keys(eventsLists).forEach(time => {
        setTimeout(function () {
          busNode.emit('StoredEvents', JSON.stringify(eventsLists[time].map(id => ({id}))))
        }, parseInt(time, 10))
      })
    }

    it('should return a stream of events as an instance of Rx.Observable', () => {
      let stream = eventStreamFromBus(FixtureBusNode())
      should(stream).be.an.instanceof(Rx.Observable)
    })
    it('the returned stream emits the events coming from `busNode` delayed by `delayTime` to ensure the right ordering', function (done) {
      let sourceEventsLists = {
        0: [1], // Buffer 1
        80: [2, 3], // Buffer 2
        150: [6, 7],
        170: [4, 5],
        190: [8, 9], // Buffer 3
        260: [10] // Buffer 4
      }

      let testBusNode = FixtureBusNode()
      let testStream = eventStreamFromBus(testBusNode)

      let received = []
      let subscription = testStream
        .map(({id}) => id)
        .subscribe(n => {
          received.push(n)
          if (received.length === 10) {
            subscription.unsubscribe()
            should(received).containDeepOrdered([
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ])
            done()
          }
        })

      _fireEventsListsOnBusNode(testBusNode, sourceEventsLists)
    })
    it('the delay time should be configurable through the second parameter', function (done) {
      let testDelayTime = 10
      let sourceEventsLists = {
        0: [1], // Buffer 1
        60: [2, 3], //  Buffer 2
        120: [8, 9],
        130: [6, 7], // Buffer 3
        200: [4, 5], // Buffer 4
        260: [10] // Buffer 5
      }

      let testBusNode = FixtureBusNode()
      let testStream = eventStreamFromBus(testBusNode, testDelayTime)

      let received = []
      let subscription = testStream
        .map(({id}) => id)
        .subscribe(n => {
          received.push(n)
          if (received.length === 10) {
            subscription.unsubscribe()
            should(received).containDeepOrdered([
              1, 2, 3, 6, 7, 8, 9, 4, 5, 10
            ])
            done()
          }
        })

      _fireEventsListsOnBusNode(testBusNode, sourceEventsLists)
    })
  })
})
