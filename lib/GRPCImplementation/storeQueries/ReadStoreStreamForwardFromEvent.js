'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _utils = require('../../utils');

function ReadStoreStreamForwardFromEvent(_ref) {
  var backend = _ref.backend;

  return function (call) {
    var _call$request = call.request,
        fromEventId = _call$request.fromEventId,
        limit = _call$request.limit;


    fromEventId = (0, _lodash.max)([0, fromEventId]);

    var params = { fromEventId: fromEventId };
    if (limit > 0) params.limit = limit;

    var backendResults = backend.getEvents(params);
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

exports.default = ReadStoreStreamForwardFromEvent;