'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _lodash = require('lodash');

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.readAggregateStreamForwardFromVersion(call)', function () {
  it('emits `error` on call if call.request.aggregateIdentity is not a valid aggregateIdentity', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // No aggregateIdentity
    simulation.call.request = {
      fromVersion: 0
    };
    implementation.readAggregateStreamForwardFromVersion(simulation.call);
    var emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);

    // Bad aggregateIdentity.id
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      aggregateIdentity: { id: '', type: 'test' },
      fromVersion: 0
    };
    implementation.readAggregateStreamForwardFromVersion(simulation.call);
    emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);

    // Bad aggregateIdentity.type
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      aggregateIdentity: { id: 'test', type: '' },
      fromVersion: 0
    };
    implementation.readAggregateStreamForwardFromVersion(simulation.call);
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

    implementation.readAggregateStreamForwardFromVersion(simulation.call);

    var calls = simulation.backend.getEventsByAggregate.getCalls();
    (0, _asFunction2.default)(calls.length === 1).be.True();
    (0, _asFunction2.default)(calls[0].args[0].aggregateIdentity).containEql(simulation.call.request.aggregateIdentity);
    (0, _asFunction2.default)(calls[0].args[0].fromVersion).equal((0, _lodash.max)([0, simulation.call.request.fromVersion]));
    (0, _asFunction2.default)(calls[0].args[0].limit).equal(simulation.call.request.limit < 1 ? undefined : simulation.call.request.limit);
  });
  it('invokes call.write() for every fetched aggregate event, in the right sequence', function (done) {
    var testAggregate = data.aggregates.get((0, _lodash.random)(data.aggregates.size - 1));
    var storedEvents = data.events.filter(function (evt) {
      return evt.get('aggregateId') === testAggregate.get('id') && evt.get('aggregateType') === testAggregate.get('type');
    });
    var minVersion = (0, _lodash.random)(1, storedEvents.size);
    storedEvents = storedEvents.filter(function (evt) {
      return evt.get('sequenceNumber') > minVersion;
    });
    var limit = (0, _lodash.random)(storedEvents.size);
    if (limit) storedEvents = storedEvents.slice(0, limit);

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      aggregateIdentity: (0, _lodash.pick)(testAggregate.toJS(), ['id', 'type']),
      fromVersion: minVersion,
      limit: limit
    };

    implementation.readAggregateStreamForwardFromVersion(simulation.call);

    setTimeout(function () {
      var writeCalls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(writeCalls.length).equal(storedEvents.size);
      (0, _asFunction2.default)(writeCalls.map(function (_ref) {
        var args = _ref.args;
        return args[0] && args[0].id;
      })).containDeepOrdered(storedEvents.toJS().map(function (_ref2) {
        var id = _ref2.id;
        return id;
      }));
      done();
    }, storedEvents.size + 10);
  });
  it('invoks call.end() after all the stored events are written', function (done) {
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

    implementation.readAggregateStreamForwardFromVersion(simulation.call);

    setTimeout(function () {
      var writeCalls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(writeCalls.length).equal(storedEvents.size);
      (0, _asFunction2.default)(simulation.call.end.calledOnce).be.True();
      done();
    }, storedEvents.size + 10);
  });
  it('stops invoking call.write() if client ends subscription', function (done) {
    var testAggregate = data.aggregates.get((0, _lodash.random)(data.aggregates.size - 1));
    var simulation = (0, _InMemorySimulation2.default)(data);
    var storedEvents = data.events.filter(function (evt) {
      return evt.get('aggregateId') === testAggregate.get('id') && evt.get('aggregateType') === testAggregate.get('type');
    });

    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      aggregateIdentity: (0, _lodash.pick)(testAggregate.toJS(), ['id', 'type']),
      fromVersion: 0
    };

    implementation.readAggregateStreamForwardFromVersion(simulation.call);
    simulation.call.emit('end');

    setTimeout(function () {
      (0, _asFunction2.default)(simulation.call.end.calledOnce).be.True();
      (0, _asFunction2.default)(simulation.call.write.getCalls().length).equal(0);
      done();
    }, storedEvents.size + 10);
  });
});