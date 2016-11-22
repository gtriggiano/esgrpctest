'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _lodash = require('lodash');

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.subscribeToAggregateStreamFromVersion(call)', function () {
  it('emits `error` on call if call.request.aggregateIdentity is not a valid aggregateIdentity', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // No aggregateIdentity
    simulation.call.request = {};
    implementation.subscribeToAggregateStream(simulation.call);
    var emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);

    // Bad aggregateIdentity.id
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = { aggregateIdentity: { id: '', type: 'test' } };
    implementation.subscribeToAggregateStream(simulation.call);
    emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);

    // Bad aggregateIdentity.type
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = { aggregateIdentity: { id: 'test', type: '' } };
    implementation.subscribeToAggregateStream(simulation.call);
    emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);
  });
  it('invokes backend.getEventsByAggregate() with right parameters', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      aggregateIdentity: { id: 'uid', type: 'test' },
      fromVersion: (0, _lodash.random)(-10, 10),
      limit: (0, _lodash.random)(-10, 10)
    };

    implementation.subscribeToAggregateStreamFromVersion(simulation.call);

    var calls = simulation.backend.getEventsByAggregate.getCalls();
    (0, _asFunction2.default)(calls.length === 1).be.True();
    (0, _asFunction2.default)(calls[0].args[0].aggregateIdentity).containEql(simulation.call.request.aggregateIdentity);
    (0, _asFunction2.default)(calls[0].args[0].fromVersion).equal((0, _lodash.max)([0, simulation.call.request.fromVersion]));
    (0, _asFunction2.default)(calls[0].args[0].limit).equal(undefined);
  });
  it('invokes call.write() for every fetched and live event of aggregate, in the right sequence', function (done) {
    var testAggregate = data.aggregates.get((0, _lodash.random)(data.aggregates.size - 1));
    var simulation = (0, _InMemorySimulation2.default)(data);
    var storedEvents = data.events.filter(function (evt) {
      return evt.get('aggregateId') === testAggregate.get('id') && evt.get('aggregateType') === testAggregate.get('type');
    });
    var minVersion = (0, _lodash.random)(1, storedEvents.size);
    storedEvents = storedEvents.filter(function (evt) {
      return evt.get('sequenceNumber') > minVersion;
    });

    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      aggregateIdentity: (0, _lodash.pick)(testAggregate.toJS(), ['id', 'type']),
      fromVersion: minVersion
    };

    implementation.subscribeToAggregateStreamFromVersion(simulation.call);

    var nextAggregateVersion = testAggregate.get('version') + 1;
    simulation.store.publishEvents([{ id: 100010, aggregateIdentity: simulation.call.request.aggregateIdentity, sequenceNumber: nextAggregateVersion++ }, { id: 100011, aggregateIdentity: { id: 'other', type: 'other' } }, { id: 100012, aggregateIdentity: simulation.call.request.aggregateIdentity, sequenceNumber: nextAggregateVersion++ }, { id: 100013, aggregateIdentity: simulation.call.request.aggregateIdentity, sequenceNumber: nextAggregateVersion++ }, { id: 100014, aggregateIdentity: { id: 'other', type: 'other' } }, { id: 100015, aggregateIdentity: simulation.call.request.aggregateIdentity, sequenceNumber: nextAggregateVersion++ }]);

    setTimeout(function () {
      var writeCalls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(writeCalls.length).equal(storedEvents.size + 4);
      (0, _asFunction2.default)(writeCalls.map(function (_ref) {
        var args = _ref.args;
        return args[0] && args[0].id;
      })).containDeepOrdered(storedEvents.toJS().map(function (_ref2) {
        var id = _ref2.id;
        return id;
      }).concat([100010, 100012, 100013, 100015]));
      simulation.call.emit('end');
      done();
    }, storedEvents.size + 200);
  });
  it('stops invoking call.write() if client ends subscription', function (done) {
    var testAggregate = data.aggregates.get((0, _lodash.random)(data.aggregates.size - 1));
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      aggregateIdentity: (0, _lodash.pick)(testAggregate.toJS(), ['id', 'type']),
      fromVersion: 1
    };

    implementation.subscribeToAggregateStreamFromVersion(simulation.call);

    simulation.store.publishEvents([{ id: 100010, aggregateIdentity: simulation.call.request.aggregateIdentity, data: '' }, { id: 100011, aggregateIdentity: simulation.call.request.aggregateIdentity, data: '' }]);

    setTimeout(function () {
      simulation.call.emit('end');
      simulation.store.publishEvents([{ id: 100012, aggregateIdentity: simulation.call.request.aggregateIdentity, data: '' }, { id: 100013, aggregateIdentity: simulation.call.request.aggregateIdentity, data: '' }]);
    }, 300);
    setTimeout(function () {
      var calls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(calls.map(function (_ref3) {
        var args = _ref3.args;
        return args[0] && args[0].id;
      })).not.containDeepOrdered([100012, 100013]);
      done();
    }, 500);
  });
});