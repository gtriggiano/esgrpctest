'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Ping = require('./Ping');

var _Ping2 = _interopRequireDefault(_Ping);

var _GetUid = require('./GetUid');

var _GetUid2 = _interopRequireDefault(_GetUid);

var _GetLastAggregateSnapshot = require('./aggregatesQueries/GetLastAggregateSnapshot');

var _GetLastAggregateSnapshot2 = _interopRequireDefault(_GetLastAggregateSnapshot);

var _ReadAggregateStreamForwardFromVersion = require('./aggregatesQueries/ReadAggregateStreamForwardFromVersion');

var _ReadAggregateStreamForwardFromVersion2 = _interopRequireDefault(_ReadAggregateStreamForwardFromVersion);

var _SubscribeToAggregateStream = require('./aggregatesQueries/SubscribeToAggregateStream');

var _SubscribeToAggregateStream2 = _interopRequireDefault(_SubscribeToAggregateStream);

var _SubscribeToAggregateStreamFromVersion = require('./aggregatesQueries/SubscribeToAggregateStreamFromVersion');

var _SubscribeToAggregateStreamFromVersion2 = _interopRequireDefault(_SubscribeToAggregateStreamFromVersion);

var _ReadAggregateTypesStreamForwardFromEvent = require('./aggregatesTypesQueries/ReadAggregateTypesStreamForwardFromEvent');

var _ReadAggregateTypesStreamForwardFromEvent2 = _interopRequireDefault(_ReadAggregateTypesStreamForwardFromEvent);

var _SubscribeToAggregateTypesStream = require('./aggregatesTypesQueries/SubscribeToAggregateTypesStream');

var _SubscribeToAggregateTypesStream2 = _interopRequireDefault(_SubscribeToAggregateTypesStream);

var _SubscribeToAggregateTypesStreamFromEvent = require('./aggregatesTypesQueries/SubscribeToAggregateTypesStreamFromEvent');

var _SubscribeToAggregateTypesStreamFromEvent2 = _interopRequireDefault(_SubscribeToAggregateTypesStreamFromEvent);

var _ReadEventTypesStreamForwardFromEvent = require('./eventsTypesQueries/ReadEventTypesStreamForwardFromEvent');

var _ReadEventTypesStreamForwardFromEvent2 = _interopRequireDefault(_ReadEventTypesStreamForwardFromEvent);

var _SubscribeToEventTypesStream = require('./eventsTypesQueries/SubscribeToEventTypesStream');

var _SubscribeToEventTypesStream2 = _interopRequireDefault(_SubscribeToEventTypesStream);

var _SubscribeToEventTypesStreamFromEvent = require('./eventsTypesQueries/SubscribeToEventTypesStreamFromEvent');

var _SubscribeToEventTypesStreamFromEvent2 = _interopRequireDefault(_SubscribeToEventTypesStreamFromEvent);

var _ReadStoreStreamForwardFromEvent = require('./storeQueries/ReadStoreStreamForwardFromEvent');

var _ReadStoreStreamForwardFromEvent2 = _interopRequireDefault(_ReadStoreStreamForwardFromEvent);

var _SubscribeToStoreStream = require('./storeQueries/SubscribeToStoreStream');

var _SubscribeToStoreStream2 = _interopRequireDefault(_SubscribeToStoreStream);

var _SubscribeToStoreStreamFromEvent = require('./storeQueries/SubscribeToStoreStreamFromEvent');

var _SubscribeToStoreStreamFromEvent2 = _interopRequireDefault(_SubscribeToStoreStreamFromEvent);

var _WriteToAggregateStream = require('./writeProcedures/WriteToAggregateStream');

var _WriteToAggregateStream2 = _interopRequireDefault(_WriteToAggregateStream);

var _WriteToMultipleAggregateStreams = require('./writeProcedures/WriteToMultipleAggregateStreams');

var _WriteToMultipleAggregateStreams2 = _interopRequireDefault(_WriteToMultipleAggregateStreams);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Write Procedures


// Events Types Queries
function GRPCImplementationFactory(_ref) {
  var backend = _ref.backend,
      store = _ref.store;

  var interfaces = { backend: backend, store: store };
  return {
    ping: (0, _Ping2.default)(interfaces),
    getUid: (0, _GetUid2.default)(interfaces),

    // Aggregates Queries
    getLastAggregateSnapshot: (0, _GetLastAggregateSnapshot2.default)(interfaces),
    readAggregateStreamForwardFromVersion: (0, _ReadAggregateStreamForwardFromVersion2.default)(interfaces),
    subscribeToAggregateStream: (0, _SubscribeToAggregateStream2.default)(interfaces),
    subscribeToAggregateStreamFromVersion: (0, _SubscribeToAggregateStreamFromVersion2.default)(interfaces),

    // Aggregates Types Queries
    readAggregateTypesStreamForwardFromEvent: (0, _ReadAggregateTypesStreamForwardFromEvent2.default)(interfaces),
    subscribeToAggregateTypesStream: (0, _SubscribeToAggregateTypesStream2.default)(interfaces),
    subscribeToAggregateTypesStreamFromEvent: (0, _SubscribeToAggregateTypesStreamFromEvent2.default)(interfaces),

    // Events Types Queries
    readEventTypesStreamForwardFromEvent: (0, _ReadEventTypesStreamForwardFromEvent2.default)(interfaces),
    subscribeToEventTypesStream: (0, _SubscribeToEventTypesStream2.default)(interfaces),
    subscribeToEventTypesStreamFromEvent: (0, _SubscribeToEventTypesStreamFromEvent2.default)(interfaces),

    // Store Queries
    readStoreStreamForwardFromEvent: (0, _ReadStoreStreamForwardFromEvent2.default)(interfaces),
    subscribeToStoreStream: (0, _SubscribeToStoreStream2.default)(interfaces),
    subscribeToStoreStreamFromEvent: (0, _SubscribeToStoreStreamFromEvent2.default)(interfaces),

    // Write Procedures
    writeToAggregateStream: (0, _WriteToAggregateStream2.default)(interfaces),
    writeToMultipleAggregateStreams: (0, _WriteToMultipleAggregateStreams2.default)(interfaces)
  };
}

// Store Queries


// Aggregates Types Queries


// Aggregates Queries
exports.default = GRPCImplementationFactory;