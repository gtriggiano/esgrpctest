'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../../utils');

function SubscribeToAggregateStream(_ref) {
  var store = _ref.store;

  return function (call) {
    var _call$request = call.request,
        id = _call$request.id,
        type = _call$request.type;

    // Validate request

    if (!(0, _utils.isValidString)(id)) return call.emit('error', new TypeError('id should be a non empty string'));
    if (!(0, _utils.isValidString)(type)) return call.emit('error', new TypeError('type should be a non empty string'));

    var subscription = store.eventsStream.filter(function (_ref2) {
      var aggregateIdentity = _ref2.aggregateIdentity;
      return aggregateIdentity.id === id && aggregateIdentity.type === type;
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

exports.default = SubscribeToAggregateStream;