import { isString, isInteger } from 'lodash'
import Rx from 'rxjs'
import R from 'ramda'
let { curry } = R

const prefixString = curry((prefix, str) => `${prefix}${str}`)

const timeoutCallback = curry((msec, msg, cb) => {
  let _called = false
  let _invoke = (...args) => {
    if (_called) return
    _called = true
    cb(...args)
  }
  setTimeout(() => {
    _invoke(new Error(msg))
  }, msec)
  return _invoke
})

const isValidString = (str) => str && isString(str)
const isPositiveInteger = (n) => isInteger(n) && n > 0

const zeropad = (s, len) => {
  let str = String(s)
  while (str.length < len) {
    str = `0${str}`
  }
  return str
}

let _idOfEventSerie = ([evt]) => zeropad(evt.id, 20)
const eventStreamFromBus = (bus, delayTime) => {
  delayTime = delayTime || 50
  let receivedSeries = {}

  let stream = Rx.Observable.fromEvent(bus, 'StoredEvents')
    .map(msg => JSON.parse(msg))
    .map(serie => {
      receivedSeries[_idOfEventSerie(serie)] = serie
      return receivedSeries
    })
    .delay(delayTime)
    .map(receivedSeries => {
      let oldestSerieId = Object.keys(receivedSeries).sort()[0]
      let oldestSerie = receivedSeries[oldestSerieId]
      delete receivedSeries[oldestSerieId]
      return oldestSerie
    })
    .flatMap(events => Rx.Observable.from(events))

  return stream
}

export {
  prefixString,
  timeoutCallback,
  isValidString,
  isPositiveInteger,
  eventStreamFromBus
}
