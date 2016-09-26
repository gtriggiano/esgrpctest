import { range, random } from 'lodash'
import should from 'should/as-function'
import sinon from 'sinon'
import Rx from 'rxjs'

import FixtureBusNode from '../tests/FixtureBusNode'

import {
  prefixString,
  timeoutCallback,
  isValidString,
  isPositiveInteger,
  zeropad,
  eventStreamFromBus
} from './utils'

describe('Utilities', () => {
  describe('prefixString(prefix, str)', () => {
    it('should be a function', () => should(prefixString).be.a.Function())
    it('should be curried', () => {
      should(prefixString('prefix')).be.a.Function()
    })
    it('should return `{prefix}{str}`', () => {
      should(prefixString('Hello', ' world!')).equal('Hello world!')
    })
  })
  describe('timeoutCallback(timeout, msg, cb)', () => {
    it('should be a function', () => should(timeoutCallback).be.a.Function())
    it('should be curried', () => {
      should(timeoutCallback(1000)).be.a.Function()
      should(timeoutCallback(1000, 'message')).be.a.Function()
    })
    it('should return a function', () => {
      let timingoutCallback = timeoutCallback(1000, 'timeout!', () => {})
      should(timingoutCallback).be.a.Function()
    })
    it('the returned function, if called within `timeout`, should invoke `cb` with the same arguments', () => {
      let cb = (one, two, three) => {
        should(one).equal(1)
        should(two).equal(2)
        should(three).equal(3)
      }

      let tcb = timeoutCallback(1000, 'Timeout!', cb)
      tcb(1, 2, 3)
    })
    it('if the returned function is not called within `timeout`, `cb` is called with `new Error(msg)` as first argument', function (done) {
      let cb = (err) => {
        should(err).be.an.Error()
        should(err.message).equal('Timeout error...')
        done()
      }
      timeoutCallback(300, 'Timeout error...', cb)
    })
    it('should `cb` be called only once in any case', function (done) {
      let cb = sinon.spy()
      let cb1 = sinon.spy()

      let tcb = timeoutCallback(50, 'timeout', cb)
      tcb()
      timeoutCallback(50, 'timeout', cb1)

      setTimeout(function () {
        should(cb.callCount).equal(1)
        should(cb1.callCount).equal(1)
        done()
      }, 100)
    })
  })
  describe('isValidString(str)', () => {
    it('should be a function', () => should(isValidString).be.a.Function())
    it('should return true if `str` is a string of length > 0, false otherwise', () => {
      should(isValidString('t')).be.True()
      should(isValidString('')).be.False()
      should(isValidString({})).be.False()
      should(isValidString([])).be.False()
      should(isValidString(1)).be.False()
      should(isValidString(() => {})).be.False()
    })
  })
  describe('isPositiveInteger(n)', () => {
    it('should be a function', () => should(isPositiveInteger).be.a.Function())
    it('should return true if `n` is a positive integer, false otherwise', () => {
      should(isPositiveInteger(1)).be.True()
      should(isPositiveInteger(-1)).be.False()
      should(isPositiveInteger(1.3)).be.False()
      should(isPositiveInteger('')).be.False()
      should(isPositiveInteger({})).be.False()
      should(isPositiveInteger([])).be.False()
      should(isPositiveInteger(() => {})).be.False()
    })
  })
  describe('zeropad(i, minLength)', () => {
    it('should be a function', () => should(zeropad).be.a.Function())
    it('should return a string', () => should(zeropad(12, 10)).be.a.String())
    it('the returned string should have a length >= minLength', () => {
      let i = range(random(8, 15)).join('')
      let minLength = random(5, 20)
      should(zeropad(i, minLength).length >= minLength).be.True()
    })
    it('should pad `i` with zeroes if Sring(i).length < minLength', () => {
      let str = zeropad('abc', 5)
      should(str).equal('00abc')
    })
  })
  describe('eventStreamFromBus(busNode[, delayTime = 100])', () => {
    function _fireEventsListsOnBusNode (busNode, eventsLists) {
      Object.keys(eventsLists).forEach(time => {
        setTimeout(function () {
          busNode.emit('StoredEvents', JSON.stringify(eventsLists[time].map(id => ({id}))))
        }, parseInt(time, 10))
      })
    }

    it('should be a function', () => should(eventStreamFromBus).be.a.Function())
    it('should return an instance of Rx.Observable', () => {
      let stream = eventStreamFromBus(FixtureBusNode())
      should(stream).be.an.instanceof(Rx.Observable)
    })
    it('should delay the output stream by (more or less) `delayTime` ms', function (done) {
      let delayTime = random(120, 160)
      let testBusNode = FixtureBusNode()
      let testStream = eventStreamFromBus(testBusNode, delayTime)

      let subscription = testStream.subscribe(() => {
        let outputTime = process.hrtime(inputTime)
        let msDiff = outputTime[0] * 1e3 + outputTime[1] / 1e6
        should(msDiff > delayTime).be.True()
        should(msDiff < delayTime + 5).be.True()
        subscription.unsubscribe()
        done()
      })
      let evt = {id: 1}
      let inputTime = process.hrtime()
      testBusNode.emit('StoredEvents', JSON.stringify([evt]))
    })
    it('should ensure the right order of events received within `delayTime`', function (done) {
      // timeOfBusEmission: [eventId, ...]
      let sourceEventsLists = {
        0: [1],
        80: [2, 3],
        200: [6, 7],
        210: [4, 5],
        220: [8, 9],
        330: [10]
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
  })
})
