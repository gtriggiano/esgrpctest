'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _utils = require('../../utils');

function SubscribeToEventTypesStream(_ref) {
  var store = _ref.store;

  return function (call) {
    var eventTypes = call.request.eventTypes;

    // Validate request

    if (!eventTypes.length) return call.emit('error', new TypeError('eventTypes should contain one or more non empty strings'));
    if (!(0, _lodash.every)(eventTypes, _utils.isValidString)) return call.emit('error', new TypeError('every item of eventTypes should be a non empty string'));

    var subscription = store.eventsStream.filter(function (_ref2) {
      var type = _ref2.type;
      return !!~eventTypes.indexOf(type);
    }).subscribe(function (evt) {
      return call.write(evt);
    }, function (err) {
      return call.emit('error', err);
    });

    call.on('end', function () {
      subscription.unsubscribe();
      call.end();
    });
  };
}

exports.default = SubscribeToEventTypesStream;