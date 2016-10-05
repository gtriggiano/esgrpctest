# Backend interface specification

This document describes the interface a backend instance should have to be succesfully used with this package.

All the following methods (`but .setup()`) will be called passing a *parameters* object as first argument and should return an [event emitter](https://nodejs.org/api/events.html#events_class_eventemitter).

The `.setup()` method instead will be called with a callback as first argument and its return value will be ignored.

## .setup(function([err])): void
This method is invoked at the beginning of a store's node connection routine to let the backend instance proceed with eventual DB setup.

It receives a `done([err])` callback as first parameter, which should be called when the setup is successful or failed.

The store's node gives this method the opportunity to call `done()` within a certain amount of time, after which a timeout error is raised, aborting the node's connection routine.

## .getEvents(parameters): eventEmitter
```javascript
let parameters = {
  fromEventId, // Integer >= 0
  [limit] // Integer >= 1
}
```
**Should fetch all the events** stored before the time of request and with `id > fromEventId`, from the oldest to the newest, taking into account the `limit` param, if passed.

For each event `eventEmitter.emit('event', event)`.

When all the fetched events have been emitted, `eventEmitter.emit('end')`.

If there is an error connecting to the DB, the retrieving process should be interrupted and `eventEmitter.emit('error', Error)`.

## .getEventsByAggregate(parameters): eventEmitter
```javascript
let parameters = {
  aggregateIdentity: {
    uuid, // String, not empty
    type // String, not empty
  },
  fromVersion, // Integer >= -1
  [limit] // Integer >= 1
}
```
**Should fetch the events pertaining to a given aggregate**, stored before the time of request and with `sequenceNumber > fromVersion`, from the oldest to the newest, taking into account the `limit` param, if passed.

For each event `eventEmitter.emit('event', event)`.

When all the fetched events have been emitted, `eventEmitter.emit('end')`.

If there is an error connecting to the DB, the retrieving process should be interrupted and `eventEmitter.emit('error', Error)`.

## .getEventsByAggregateTypes(parameters): eventEmitter
```javascript
let parameters = {
  aggregateTypes: [String],
  fromEventId, // Integer >= 0
  [limit] // Integer >= 1
}
```
**Should fetch the events pertaining to certain aggregate types**, stored before the time of request and with `id > fromEventId`, from the oldest to the newest, taking into account the `limit` param, if passed.

For each event `eventEmitter.emit('event', event)`.

When all the fetched events have been emitted, `eventEmitter.emit('end')`.

If there is an error connecting to the DB, the retrieving process should be interrupted and `eventEmitter.emit('error', Error)`.

## .getEventsByTypes(parameters): eventEmitter
```javascript
let parameters = {
  eventTypes: [String],
  fromEventId, // Integer >= 0
  [limit] // Integer >= 1
}
```
**Should fetch the events of certain types**, stored before the time of request and with `id > fromEventId`, from the oldest to the newest, taking into account the `limit` param, if passed.

For each event `eventEmitter.emit('event', event)`.

When all the fetched events have been emitted, `eventEmitter.emit('end')`.

If there is an error connecting to the DB, the retrieving process should be interrupted and `eventEmitter.emit('error', Error)`.

## .getLastSnapshotOfAggregate(parameters): eventEmitter
```javascript
let parameters = {
  aggregateIdentity: {
    uuid, // String, not empty
    type // String, not empty
  }
}
```
**Should fetch the last snapshot of an aggregate**.

If the snapshot exists `eventEmitter.emit('snapshot', snapshot)`.

In any case `eventEmitter.emit('end')`

If there is an error connecting to the DB, the retrieving process should be interrupted and `eventEmitter.emit('error', Error)`.


## .storeEvents(parameters): eventEmitter
```javascript
let parameters = {
  writeRequests: [
    {
      aggregateIdentity: {
        uuid, // String, not empty
        type // String, not empty
      },
      events: [
        {
          type, // String, not empty
          data, // String
          metadata // String
        },
        {...}
      ],
      [expectedAggregateVersion,] // Integer >= 0
      [snapshot] // String
    },
    {...}
  ],
  transactionId: // String
}
```
