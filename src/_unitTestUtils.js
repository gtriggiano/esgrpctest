import should from 'should/as-function'
import sinon from 'sinon'
import Rx from 'rxjs'

import FixtureBusNode from '../tests/FixtureBusNode'

import {
  getEventsStreamFromBusNode
} from './utils'

describe('Utilities', () => {
  describe('getEventsStreamFromBusNode(busNode[, debounceTime])', () => {
    function _fireEventsListsOnBusNode (busNode, eventsLists) {
      Object.keys(eventsLists).forEach(time => {
        setTimeout(function () {
          busNode.emit('StoredEventsSeries', JSON.stringify(eventsLists[time].map(id => ({id}))))
        }, parseInt(time, 10))
      })
    }

    it('should return a stream of events as an instance of Rx.Observable', () => {
      let stream = getEventsStreamFromBusNode(FixtureBusNode())
      should(stream).be.an.instanceof(Rx.Observable)
    })
    it('should call bus.subscribe(StoredEventsSeries)', () => {
      let testBusNode = FixtureBusNode()
      let spy = sinon.spy(testBusNode, 'subscribe')
      getEventsStreamFromBusNode(testBusNode)
      should(testBusNode.subscribe.calledWith('StoredEventsSeries')).equal(true)
      spy.restore()
    })
    it('the returned stream emits the events coming from `busNode` ensuring the right order within a certain debounce time (default 50 ms)', function (done) {
      let sourceEventsLists = {
        0: [1], // Buffer 1
        80: [2, 3], // Buffer 2
        150: [6, 7],
        170: [4, 5],
        190: [8, 9], // Buffer 3
        260: [10] // Buffer 4
      }

      let testBusNode = FixtureBusNode()
      let testStream = getEventsStreamFromBusNode(testBusNode)

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
    it('the debounce time should be configurable through the second parameter', function (done) {
      let testDebounceTime = 30
      let sourceEventsLists = {
        0: [1], // Buffer 1
        80: [2, 3], //  Buffer 2
        130: [8, 9],
        150: [6, 7], // Buffer 3
        200: [4, 5], // Buffer 4
        260: [10] // Buffer 5
      }

      let testBusNode = FixtureBusNode()
      let testStream = getEventsStreamFromBusNode(testBusNode, testDebounceTime)

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
