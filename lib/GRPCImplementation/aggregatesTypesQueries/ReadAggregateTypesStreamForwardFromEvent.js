'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _utils = require('../../utils');

function ReadAggregateTypesStreamForwardFromEvent(_ref) {
  var backend = _ref.backend;

  return function (call) {
    var _call$request = call.request,
        aggregateTypes = _call$request.aggregateTypes,
        fromEventId = _call$request.fromEventId,
        limit = _call$request.limit;

    // Validate request

    if (!aggregateTypes.length) return call.emit('error', new TypeError('aggregateTypes should contain one or more non empty strings'));
    if (!(0, _lodash.every)(aggregateTypes, _utils.isValidString)) return call.emit('error', new TypeError('every item of aggregateTypes should be a non empty string'));

    fromEventId = (0, _lodash.max)([0, fromEventId]);

    var params = { aggregateTypes: aggregateTypes, fromEventId: fromEventId };
    if (limit > 0) params.limit = limit;

    var backendResults = backend.getEventsByAggregateTypes(params);
    var eventsStream = (0, _utils.eventsStreamFromBackendEmitter)(backendResults);
    var subscription = eventsStream.subscribe(function (evt) {
      return call.write(evt);
    }, function (err) {
      return call.emit('error', err);
    }, function () {
      return call.end();
    });

    call.on('end', function () {
      subscription.unsubscribe();
      call.end();
    });
  };
}

exports.default = ReadAggregateTypesStreamForwardFromEvent;