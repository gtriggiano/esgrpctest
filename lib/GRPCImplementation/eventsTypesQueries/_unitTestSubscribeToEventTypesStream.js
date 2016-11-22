'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _lodash = require('lodash');

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.subscribeToEventTypesStream(call)', function () {
  it('emits `error` on call if call.request.eventTypes is not a valid list of strings', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // No eventTypes
    simulation.call.request = {
      eventTypes: [],
      fromEventId: 0
    };
    implementation.subscribeToEventTypesStream(simulation.call);
    var emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);

    // Bad eventTypes
    simulation = (0, _InMemorySimulation2.default)(data);
    simulation.call.request = {
      eventTypes: [''],
      fromEventId: 0
    };
    implementation.subscribeToEventTypesStream(simulation.call);
    emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);
  });
  it('invokes call.write() for every live event with type within the given types', function (done) {
    var testEventTypes = (0, _lodash.sampleSize)(_InMemorySimulation.EVENT_TYPES.toJS(), 2);

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      eventTypes: testEventTypes
    };
    implementation.subscribeToEventTypesStream(simulation.call);
    simulation.store.publishEvents([{ id: 100010, type: (0, _lodash.sample)(testEventTypes) }, { id: 100011, type: 'other' }, { id: 100012, type: (0, _lodash.sample)(testEventTypes) }]);

    setTimeout(function () {
      var writeCalls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(writeCalls.length).equal(2);
      (0, _asFunction2.default)(writeCalls.map(function (_ref) {
        var args = _ref.args;
        return args[0] && args[0].id;
      })).containDeepOrdered([100010, 100012]);
      simulation.call.emit('end');
      done();
    }, 150);
  });
  it('stops invoking call.write() if client ends subscription', function (done) {
    var testEventTypes = (0, _lodash.sampleSize)(_InMemorySimulation.EVENT_TYPES.toJS(), 2);

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      eventTypes: testEventTypes
    };
    implementation.subscribeToEventTypesStream(simulation.call);
    simulation.store.publishEvents([{ id: 100010, type: (0, _lodash.sample)(testEventTypes) }, { id: 100011, type: 'other' }, { id: 100012, type: (0, _lodash.sample)(testEventTypes) }]);

    setTimeout(function () {
      simulation.call.emit('end');
      simulation.store.publishEvents([{ id: 100013, type: (0, _lodash.sample)(testEventTypes) }, { id: 100014, type: (0, _lodash.sample)(testEventTypes) }]);
    }, 200);

    setTimeout(function () {
      var calls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(calls.length).equal(2);
      (0, _asFunction2.default)(calls.map(function (_ref2) {
        var args = _ref2.args;
        return args[0] && args[0].id;
      })).not.containDeepOrdered([100013, 100014]);
      done();
    }, 350);
  });
});