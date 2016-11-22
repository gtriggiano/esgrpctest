'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

var _lodash = require('lodash');

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SubscribeToStoreStreamFromEvent(_ref) {
  var backend = _ref.backend,
      store = _ref.store;

  return function (call) {
    var fromEventId = call.request.fromEventId;

    fromEventId = (0, _lodash.max)([0, fromEventId]);

    // Call backend
    var params = { fromEventId: fromEventId };
    var backendResults = backend.getEvents(params);
    var backendStream = (0, _utils.eventsStreamFromBackendEmitter)(backendResults);

    // Cache live events until backendStream ends
    var replay = new _rxjs2.default.ReplaySubject();
    var cachedLiveStream = store.eventsStream.multicast(replay);
    var cachedLiveStreamSubscription = cachedLiveStream.connect();
    function _endCachedLiveStream() {
      cachedLiveStreamSubscription.unsubscribe();
      replay.complete();
      // release memory
      process.nextTick(function () {
        return replay._events.splice(0);
      });
    }
    backendStream.toPromise().then(_endCachedLiveStream, _endCachedLiveStream);

    // Concat the streams and subscribe
    var eventsStream = backendStream.concat(cachedLiveStream, store.eventsStream);
    var eventsStreamSubscription = eventsStream.subscribe(function (evt) {
      return call.write(evt);
    }, function (err) {
      return call.emit('error', err);
    });

    call.on('end', function () {
      _endCachedLiveStream();
      eventsStreamSubscription.unsubscribe();
      call.end();
    });
  };
}

exports.default = SubscribeToStoreStreamFromEvent;