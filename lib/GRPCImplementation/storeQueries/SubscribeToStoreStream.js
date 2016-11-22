'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function SubscribeToStoreStream(_ref) {
  var store = _ref.store;

  return function (call) {
    var subscription = store.eventsStream.subscribe(function (evt) {
      return call.write(evt);
    });
    call.on('end', function () {
      subscription.unsubscribe();
      call.end();
    });
  };
}

exports.default = SubscribeToStoreStream;