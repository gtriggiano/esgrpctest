'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

var _lodash = require('lodash');

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SubscribeToAggregateStreamFromVersion(_ref) {
  var backend = _ref.backend,
      store = _ref.store;

  return function (call) {
    var _call$request = call.request,
        aggregateIdentity = _call$request.aggregateIdentity,
        fromVersion = _call$request.fromVersion;

    // Validate request

    if (!aggregateIdentity) return call.emit('error', new TypeError('aggregateIdentity cannot be undefined'));
    if (!(0, _utils.isValidString)(aggregateIdentity.id)) return call.emit('error', new TypeError('aggregateIdentity.id should be a non empty string'));
    if (!(0, _utils.isValidString)(aggregateIdentity.type)) return call.emit('error', new TypeError('aggregateIdentity.type should be a non empty string'));

    var id = aggregateIdentity.id,
        type = aggregateIdentity.type;

    fromVersion = (0, _lodash.max)([0, fromVersion]);

    // Call backend
    var params = { aggregateIdentity: aggregateIdentity, fromVersion: fromVersion };
    var backendResults = backend.getEventsByAggregate(params);
    var backendStream = (0, _utils.eventsStreamFromBackendEmitter)(backendResults);

    // Filter on store.eventsStream
    var liveStream = store.eventsStream.filter(function (_ref2) {
      var aggregateIdentity = _ref2.aggregateIdentity,
          sequenceNumber = _ref2.sequenceNumber;
      return aggregateIdentity.id === id && aggregateIdentity.type === type && sequenceNumber > fromVersion;
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

exports.default = SubscribeToAggregateStreamFromVersion;