import { isString, isInteger, range } from 'lodash'
import Rx from 'rxjs'
import R from 'ramda'
let { curry } = R

const prefixString = curry((prefix, str) => `${prefix}${str}`)

const timeoutCallback = curry((timeout, msg, cb) => {
  let _called = false
  let _invoke = (...args) => {
    if (_called) return
    _called = true
    cb(...args)
  }
  setTimeout(() => {
    _invoke(new Error(msg))
  }, timeout)
  return _invoke
})

const isValidString = (str) => isString(str) && !!str.length

const isPositiveInteger = (n) => isInteger(n) && n > 0

const zeropad = (i, minLength) => {
  let str = String(i)
  let diff = minLength - str.length
  if (diff > 0) {
    str = `${range(diff).map(() => 0).join('')}${str}`
  }
  return str
}

const eventStreamFromBus = (bus, delayTime) => {
  delayTime = delayTime || 100
  let receivedEvents = {
    ids: [],
    byId: {}
  }

  // We create a multicasted observable passing events through a Subject
  let subject = new Rx.Subject()
  let stream = Rx.Observable.fromEvent(bus, 'StoredEvents')
    .map(msg => JSON.parse(msg))
    .flatMap(events => Rx.Observable.from(events))
    .map(evt => {
      let evtId = zeropad(evt.id, 20)
      receivedEvents.ids.push(evtId)
      receivedEvents.ids.sort()
      receivedEvents.byId[evtId] = evt
      return receivedEvents
    })
    .delay(delayTime)
    .map(evt => {
      let oldestEventId = receivedEvents.ids.shift()
      let oldestEvent = receivedEvents.byId[oldestEventId]
      delete receivedEvents.byId[oldestEventId]
      return oldestEvent
    })
    .multicast(subject)

  // Stream is a Rx.ConnectableObservable
  stream.connect()

  return stream
}

export {
  prefixString,
  timeoutCallback,
  isValidString,
  isPositiveInteger,
  zeropad,
  eventStreamFromBus
}
