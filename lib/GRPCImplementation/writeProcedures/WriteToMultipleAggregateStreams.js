'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _lodash = require('lodash');

var _WriteToAggregateStream = require('./WriteToAggregateStream');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function WriteToMultipleAggregateStream(_ref) {
  var backend = _ref.backend,
      store = _ref.store;

  return function (call, callback) {
    var writeRequests = call.request.writeRequests;


    if (!writeRequests.length) return callback(new Error('writingRequests should be a list of event storage requests'));

    try {
      writeRequests = writeRequests.map(_WriteToAggregateStream.validateAndGetBackendWriteRequest);
    } catch (e) {
      return callback(e);
    }

    // Check that there is just one request for every aggregate
    var involvedAggregates = (0, _lodash.uniq)(writeRequests.map(function (_ref2) {
      var aggregateIdentity = _ref2.aggregateIdentity;
      return '' + aggregateIdentity.type + aggregateIdentity.uuid;
    }));
    if (involvedAggregates.length < writeRequests.length) return callback(new Error('each writeRequest should concern a different aggregate'));

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

exports.default = WriteToMultipleAggregateStream;