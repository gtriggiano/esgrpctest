'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

var _lodash = require('lodash');

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SubscribeToAggregateTypesStreamFromEvent(_ref) {
  var backend = _ref.backend,
      store = _ref.store;

  return function (call) {
    var _call$request = call.request,
        aggregateTypes = _call$request.aggregateTypes,
        fromEventId = _call$request.fromEventId;

    // Validate request

    if (!aggregateTypes.length) return call.emit('error', new TypeError('aggregateTypes should contain one or more non empty strings'));
    if (!(0, _lodash.every)(aggregateTypes, _utils.isValidString)) return call.emit('error', new TypeError('aggregateTypes should be a list of non empty strings'));
    fromEventId = (0, _lodash.max)([0, fromEventId]);

    // Call backend
    var params = { aggregateTypes: aggregateTypes, fromEventId: fromEventId };
    var backendResults = backend.getEventsByAggregateTypes(params);
    var backendStream = (0, _utils.eventsStreamFromBackendEmitter)(backendResults);

    // Filter on store.eventsStream
    var liveStream = store.eventsStream.filter(function (_ref2) {
      var id = _ref2.id,
          aggregateIdentity = _ref2.aggregateIdentity;
      return !!~aggregateTypes.indexOf(aggregateIdentity.type) && id > fromEventId;
    });

    // Cache live events until backendStream ends
    var replay = new _rxjs2.default.ReplaySubject();
    var cachedLiveStream = liveStream.multicast(replay);
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
    var eventsStream = backendStream.concat(cachedLiveStream, liveStream);
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

exports.default = SubscribeToAggregateTypesStreamFromEvent;