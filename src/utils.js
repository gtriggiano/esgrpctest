import R from 'ramda'
let { curry } = R

const prefix = curry((prefix, str) => `${prefix}${str}`)

export {
  prefix
}
