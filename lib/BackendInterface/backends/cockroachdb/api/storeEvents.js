'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _createAggregate = require('../operations/createAggregate');

var _createAggregate2 = _interopRequireDefault(_createAggregate);

var _createAggregateSnapshot = require('../operations/createAggregateSnapshot');

var _createAggregateSnapshot2 = _interopRequireDefault(_createAggregateSnapshot);

var _getAggregate = require('../operations/getAggregate');

var _getAggregate2 = _interopRequireDefault(_getAggregate);

var _storeAggregateEvents = require('../operations/storeAggregateEvents');

var _storeAggregateEvents2 = _interopRequireDefault(_storeAggregateEvents);

var _updateAggregateVersion = require('../operations/updateAggregateVersion');

var _updateAggregateVersion2 = _interopRequireDefault(_updateAggregateVersion);

var _transactionWrapper = require('../helpers/transactionWrapper');

var _transactionWrapper2 = _interopRequireDefault(_transactionWrapper);

var _utils = require('../../../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function storeEventsFactory(getConnection) {
  return function (_ref) {
    var writeRequests = _ref.writeRequests,
        transactionId = _ref.transactionId;

    var results = new _eventemitter2.default();

    getConnection(function (err, _ref2) {
      var client = _ref2.client,
          release = _ref2.release;

      if (err) return results.emit('error', err);
      (0, _transactionWrapper2.default)(client, function (client, done) {
        Promise.all(writeRequests.map(function (request) {
          return writeToAggregateStream(client, request, transactionId);
        })).then(function (responses) {
          var errors = responses.filter(function (response) {
            return response instanceof Error;
          });
          if (errors.length) {
            var errorsMessages = errors.map(function (_ref3) {
              var message = _ref3.message;
              return message;
            }).join(', ');
            throw new Error('Events writing failed because of the following errors: ' + errorsMessages);
          }
          return (0, _lodash.flatten)(responses);
        }).then(function (storedEvents) {
          return done(null, storedEvents);
        }).catch(done);
      }, function (err, storedEvents) {
        release();
        if (err) return results.emit('error', err);
        results.emit('storedEvents', storedEvents);
      });
    });

    return results;
  };
}

function writeToAggregateStream(client, request, transactionId) {
  var aggregateIdentity = request.aggregateIdentity,
      events = request.events,
      expectedAggregateVersion = request.expectedAggregateVersion,
      snapshot = request.snapshot;


  var eMsg = (0, _utils.prefixString)('Aggregate [' + aggregateIdentity.type + '@' + aggregateIdentity.id + '] ');

  var consistentVersioningRequired = expectedAggregateVersion > -1;
  var clientWantsToCreateAggregate = expectedAggregateVersion === 0;

  return (0, _getAggregate2.default)(client, aggregateIdentity).then(function (aggregate) {
    var aggregateExists = !!aggregate;
    if (!consistentVersioningRequired && aggregateExists) return aggregate;
    if (!consistentVersioningRequired && !aggregateExists) return (0, _createAggregate2.default)(client, aggregateIdentity);
    if (clientWantsToCreateAggregate && aggregateExists) throw new Error(eMsg('already exists'));
    if (clientWantsToCreateAggregate && !aggregateExists) return (0, _createAggregate2.default)(client, aggregateIdentity);

    if (!aggregate) throw new Error(eMsg('does not exists'));
    if (aggregate.version !== expectedAggregateVersion) throw new Error(eMsg('version mismatch'));

    return aggregate;
  }).then(function (aggregate) {
    return (0, _storeAggregateEvents2.default)(client, aggregate, events, transactionId);
  }).then(function (storedEvents) {
    return (0, _updateAggregateVersion2.default)(client, aggregateIdentity, (0, _lodash.last)(storedEvents).sequenceNumber).then(function () {
      return storedEvents;
    });
  }).then(function (storedEvents) {
    return snapshot ? (0, _createAggregateSnapshot2.default)(client, aggregateIdentity, (0, _lodash.last)(storedEvents).sequenceNumber, snapshot).then(function () {
      return storedEvents;
    }) : storedEvents;
  }).catch(function (error) {
    return error;
  });
}

exports.default = storeEventsFactory;