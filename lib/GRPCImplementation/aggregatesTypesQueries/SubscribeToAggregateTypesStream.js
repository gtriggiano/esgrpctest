'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _utils = require('../../utils');

function SubscribeToAggregateTypesStream(_ref) {
  var store = _ref.store;

  return function (call) {
    var aggregateTypes = call.request.aggregateTypes;

    // Validate request

    if (!aggregateTypes.length) return call.emit('error', new TypeError('aggregateTypes should contain one or more non empty strings'));
    if (!(0, _lodash.every)(aggregateTypes, _utils.isValidString)) return call.emit('error', new TypeError('every item of aggregateTypes should be a non empty string'));

    var subscription = store.eventsStream.filter(function (_ref2) {
      var aggregateIdentity = _ref2.aggregateIdentity;
      return !!~aggregateTypes.indexOf(aggregateIdentity.type);
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

exports.default = SubscribeToAggregateTypesStream;