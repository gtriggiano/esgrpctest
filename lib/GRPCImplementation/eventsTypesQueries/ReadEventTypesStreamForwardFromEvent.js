'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _utils = require('../../utils');

function ReadEventTypesStreamForwardFromEvent(_ref) {
  var backend = _ref.backend;

  return function (call) {
    var _call$request = call.request,
        eventTypes = _call$request.eventTypes,
        fromEventId = _call$request.fromEventId,
        limit = _call$request.limit;

    // Validate request

    if (!eventTypes.length) return call.emit('error', new TypeError('eventTypes should contain one or more non empty strings'));
    if (!(0, _lodash.every)(eventTypes, _utils.isValidString)) return call.emit('error', new TypeError('every item of eventTypes should be a non empty string'));

    fromEventId = (0, _lodash.max)([0, fromEventId]);

    var params = { eventTypes: eventTypes, fromEventId: fromEventId };
    if (limit > 0) params.limit = limit;

    var backendResults = backend.getEventsByTypes(params);
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

exports.default = ReadEventTypesStreamForwardFromEvent;