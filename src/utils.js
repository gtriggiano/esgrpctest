import { isString, isInteger, range, curry } from 'lodash'
import Rx from 'rxjs'

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

const eventsStreamFromBus = (bus, delayTime) => {
  delayTime = delayTime || 100
  let receivedEvents = {
    ids: [],
    byId: {}
  }

  // We create an hot observable through the publish().connect() sequence
  let stream = Rx.Observable.fromEvent(bus, 'StoredEvents')
    .map(msg => JSON.parse(msg))
    .flatMap(events => Rx.Observable.from(events))
    .map(evt => {
      let evtId = zeropad(evt.id, 25)
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
    .publish()

  stream.connect() // TODO: should we take a reference to this subscription to end it later?

  return stream
}

const eventsStreamFromBackendEmitter = (e) => {
  let evt = Rx.Observable.fromEvent(e, 'event')
  let error = Rx.Observable.fromEvent(e, 'error').flatMap(err => Rx.Observable.throw(err))
  let end = Rx.Observable.fromEvent(e, 'end')

  return evt.merge(error).takeUntil(end)
}

export {
  prefixString,
  timeoutCallback,
  isValidString,
  isPositiveInteger,
  zeropad,
  eventsStreamFromBus,
  eventsStreamFromBackendEmitter
}

// var subject = new Rx.Subject()
// var rpSubject = new Rx.ReplaySubject()
// var evt = Rx.Observable.interval(1000).map(function (_, i) { return i })
// var live = Rx.Observable.interval(1000).map(function (_, i) { return (i + 1) * 100 }).multicast(subject)
// live.connect()
// var rpSubscripion = live.subscribe(rpSubject)
//
// var err = Rx.Observable.timer(15000).flatMap(function () { return Rx.Observable.throw(new Error()) })
// var end = Rx.Observable.timer(10000).map(function () { return 'end' })
//
// var back = evt.merge(err).takeUntil(end)
// var final = back.concat(rpSubject)
// // var final = back.forkJoin(live.map(function (x) { return x }))
//
// final.subscribe(
//   function (a) { console.log(a) },
//   function (e) { console.log('errore') },
//   function () { console.log('finito!!!') }
// )
