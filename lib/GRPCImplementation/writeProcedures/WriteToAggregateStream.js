'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateAndGetBackendWriteRequest = undefined;

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _lodash = require('lodash');

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function WriteToAggregateStream(_ref) {
  var backend = _ref.backend,
      store = _ref.store;

  return function (call, callback) {
    var writeRequests = void 0;
    try {
      writeRequests = [validateAndGetBackendWriteRequest(call.request)];
    } catch (e) {
      return callback(e);
    }

    var transactionId = (0, _shortid2.default)();

    var backendResults = backend.storeEvents({ writeRequests: writeRequests, transactionId: transactionId });

    backendResults.on('error', function (err) {
      backendResults.removeAllListeners();
      callback(err);
    });
    backendResults.on('storedEvents', function (storedEvents) {
      backendResults.removeAllListeners();
      store.publishEvents(storedEvents);
      callback(null, { events: storedEvents });
    });
  };
}

function validateAndGetBackendWriteRequest(request, requestIndex) {
  var eMgs = (0, _utils.prefixString)(requestIndex !== undefined ? '[writing request ' + requestIndex + ']' : '');

  var aggregateIdentity = request.aggregateIdentity,
      expectedAggregateVersion = request.expectedAggregateVersion,
      events = request.events,
      snapshot = request.snapshot;

  // Validate request

  if (!aggregateIdentity) throw new TypeError(eMgs('aggregateIdentity cannot be undefined'));
  if (!(0, _utils.isValidString)(aggregateIdentity.id)) throw new TypeError(eMgs('aggregateIdentity.id should be a nonempty string'));
  if (!(0, _utils.isValidString)(aggregateIdentity.type)) throw new TypeError(eMgs('aggregateIdentity.type should be a nonempty string'));
  if (!events || !events.length) throw new Error(eMgs('events should be a nonempty list of events to store'));
  if (!(0, _lodash.every)(events, function (_ref2) {
    var type = _ref2.type;
    return (0, _utils.isValidString)(type);
  })) throw new TypeError(eMgs('all events should have a valid type'));

  expectedAggregateVersion = (0, _lodash.max)([-1, expectedAggregateVersion]);

  var params = {
    aggregateIdentity: aggregateIdentity,
    events: events.map(function (e) {
      return {
        type: e.type,
        data: e.data || '',
        metadata: e.metadata || ''
      };
    }),
    expectedAggregateVersion: expectedAggregateVersion
  };
  if (snapshot) params.snapshot = snapshot;
  return params;
}

exports.default = WriteToAggregateStream;
exports.validateAndGetBackendWriteRequest = validateAndGetBackendWriteRequest;