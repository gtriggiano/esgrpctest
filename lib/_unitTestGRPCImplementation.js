'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _InMemorySimulation = require('../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _GRPCImplementation = require('./GRPCImplementation');

var _GRPCImplementation2 = _interopRequireDefault(_GRPCImplementation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('GRPCImplementation({backend, store})', function () {
  it('is a function', function () {
    return (0, _asFunction2.default)(_GRPCImplementation2.default).be.a.Function();
  });
  it('returns a map of functions', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _GRPCImplementation2.default)(simulation);
    (0, _asFunction2.default)(implementation).be.an.Object();
    Object.keys(implementation).forEach(function (handler) {
      return (0, _asFunction2.default)(implementation[handler]).be.a.Function();
    });
  });
  require('./GRPCImplementation/_unitTestPing');
  require('./GRPCImplementation/_unitTestGetUid');

  describe('Aggregates Queries', function () {
    require('./GRPCImplementation/aggregatesQueries/_unitTestGetLastAggregateSnapshot');
    require('./GRPCImplementation/aggregatesQueries/_unitTestReadAggregateStreamForwardFromVersion');
    require('./GRPCImplementation/aggregatesQueries/_unitTestSubscribeToAggregateStream');
    require('./GRPCImplementation/aggregatesQueries/_unitTestSubscribeToAggregateStreamFromVersion');
  });

  describe('Aggregates Types Queries', function () {
    require('./GRPCImplementation/aggregatesTypesQueries/_unitTestReadAggregateTypesStreamForwardFromEvent');
    require('./GRPCImplementation/aggregatesTypesQueries/_unitTestSubscribeToAggregateTypesStream');
    require('./GRPCImplementation/aggregatesTypesQueries/_unitTestSubscribeToAggregateTypesStreamFromEvent');
  });

  describe('Events Types Queries', function () {
    require('./GRPCImplementation/eventsTypesQueries/_unitTestReadEventTypesStreamForwardFromEvent');
    require('./GRPCImplementation/eventsTypesQueries/_unitTestSubscribeToEventTypesStream');
    require('./GRPCImplementation/eventsTypesQueries/_unitTestSubscribeToEventTypesStreamFromEvent');
  });

  describe('Store Queries', function () {
    require('./GRPCImplementation/storeQueries/_unitTestReadStoreStreamForwardFromEvent');
    require('./GRPCImplementation/storeQueries/_unitTestSubscribeToStoreStream');
    require('./GRPCImplementation/storeQueries/_unitTestSubscribeToStoreStreamFromEvent');
  });

  describe('Write Procedures', function () {
    require('./GRPCImplementation/writeProcedures/_unitTestWriteToAggregateStream');
    require('./GRPCImplementation/writeProcedures/_unitTestWriteToMultipleAggregateStreams');
  });
});