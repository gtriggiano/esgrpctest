import { isString, isInteger } from 'lodash'
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

const isValidHost = (host) => host && isString(host)
const isValidPort = (port) => isInteger(port) && port > 0

export {
  prefixString,
  timeoutCallback,
  isValidHost,
  isValidPort
}
