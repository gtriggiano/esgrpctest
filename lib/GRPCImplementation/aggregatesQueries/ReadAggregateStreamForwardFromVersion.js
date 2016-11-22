'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _utils = require('../../utils');

function ReadAggregateStreamForwardFromVersion(_ref) {
  var backend = _ref.backend;

  return function (call) {
    var _call$request = call.request,
        aggregateIdentity = _call$request.aggregateIdentity,
        fromVersion = _call$request.fromVersion,
        limit = _call$request.limit;

    // Validate request

    if (!aggregateIdentity) return call.emit('error', new TypeError('aggregateIdentity cannot be undefined'));
    if (!(0, _utils.isValidString)(aggregateIdentity.id)) return call.emit('error', new TypeError('aggregateIdentity.id should be a non empty string'));
    if (!(0, _utils.isValidString)(aggregateIdentity.type)) return call.emit('error', new TypeError('aggregateIdentity.type should be a non empty string'));

    fromVersion = (0, _lodash.max)([0, fromVersion]);

    var params = { aggregateIdentity: aggregateIdentity, fromVersion: fromVersion };
    if (limit > 0) params.limit = limit;

    var backendResults = backend.getEventsByAggregate(params);
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

exports.default = ReadAggregateStreamForwardFromVersion;