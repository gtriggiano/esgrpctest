'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.subscribeToAggregateStream(call)', function () {
  it('emits `error` on call if call.request is not a valid aggregateIdentity', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // Bad aggregateIdentity.id
    simulation.call.request = { id: '', type: 'test' };
    implementation.subscribeToAggregateStream(simulation.call);
    var emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);

    // Bad aggregateIdentity.type
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = { id: 'test', type: '' };
    implementation.subscribeToAggregateStream(simulation.call);
    emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);
  });
  it('invokes call.write() with every live event about aggregate', function (done) {
    var aggregateIdentity = { id: 'uid', type: 'Test' };
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = aggregateIdentity;
    implementation.subscribeToAggregateStream(simulation.call);
    simulation.store.publishEvents([{ id: 100010, aggregateIdentity: aggregateIdentity }, { id: 100011, aggregateIdentity: { id: 'other', type: 'other' } }, { id: 100012, aggregateIdentity: aggregateIdentity }]);
    setTimeout(function () {
      var writeCalls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(writeCalls.length).equal(2);
      (0, _asFunction2.default)(writeCalls.map(function (_ref) {
        var args = _ref.args;
        return args[0] && args[0].id;
      })).containDeepOrdered([100010, 100012]);
      simulation.call.emit('end');
      done();
    }, 200);
  });
  it('stops invoking call.write() if client ends subscription', function (done) {
    var aggregateIdentity = { id: 'uid', type: 'Test' };
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = aggregateIdentity;
    implementation.subscribeToAggregateStream(simulation.call);

    simulation.store.publishEvents([{ id: 100010, aggregateIdentity: aggregateIdentity, data: '' }, { id: 100011, aggregateIdentity: aggregateIdentity, data: '' }]);

    setTimeout(function () {
      simulation.call.emit('end');
      simulation.store.publishEvents([{ id: 100012, aggregateIdentity: aggregateIdentity, data: '' }, { id: 100013, aggregateIdentity: aggregateIdentity, data: '' }]);
    }, 200);
    setTimeout(function () {
      var calls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(calls.length).equal(2);
      (0, _asFunction2.default)(calls.map(function (_ref2) {
        var args = _ref2.args;
        return args[0] && args[0].id;
      })).containDeepOrdered([100010, 100011]);
      done();
    }, 400);
  });
});