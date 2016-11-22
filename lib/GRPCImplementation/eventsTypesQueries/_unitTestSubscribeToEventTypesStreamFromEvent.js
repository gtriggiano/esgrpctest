'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _lodash = require('lodash');

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.subscribeToEventTypesStreamFromEvent(call)', function () {
  it('emits `error` on call if call.request.eventTypes is not a valid list of strings', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    // No eventTypes
    simulation.call.request = {
      eventTypes: [],
      fromEventId: 0
    };
    implementation.subscribeToEventTypesStreamFromEvent(simulation.call);
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
    implementation.subscribeToEventTypesStreamFromEvent(simulation.call);
    emitArgs = simulation.call.emit.firstCall.args;

    (0, _asFunction2.default)(simulation.call.emit.calledOnce).be.True();
    (0, _asFunction2.default)(emitArgs[0]).equal('error');
    (0, _asFunction2.default)(emitArgs[1]).be.an.instanceof(Error);
  });
  it('invokes backend.getEventsByTypes() with right parameters', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      eventTypes: ['typeOne', 'typeTwo'],
      fromEventId: (0, _lodash.random)(-10, 10),
      limit: (0, _lodash.random)(-10, 10)
    };

    implementation.subscribeToEventTypesStreamFromEvent(simulation.call);

    var calls = simulation.backend.getEventsByTypes.getCalls();
    (0, _asFunction2.default)(calls.length === 1).be.True();
    (0, _asFunction2.default)(calls[0].args[0].eventTypes).containDeepOrdered(simulation.call.request.eventTypes);
    (0, _asFunction2.default)(calls[0].args[0].fromEventId).equal((0, _lodash.max)([0, simulation.call.request.fromEventId]));
    (0, _asFunction2.default)(calls[0].args[0].limit).equal(undefined);
  });
  it('invokes call.write() for every fetched and live event with type within the given types, in the right sequence', function (done) {
    var testTypes = (0, _lodash.sampleSize)(_InMemorySimulation.EVENT_TYPES.toJS(), 2);
    var storedEvents = data.events.filter(function (evt) {
      return !!~testTypes.indexOf(evt.get('type'));
    });
    var fromEventId = (0, _lodash.random)(1, storedEvents.size);
    storedEvents = storedEvents.filter(function (evt) {
      return evt.get('id') > fromEventId;
    });

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      eventTypes: testTypes,
      fromEventId: fromEventId
    };

    implementation.subscribeToEventTypesStreamFromEvent(simulation.call);
    simulation.store.publishEvents([{ id: 100010, type: (0, _lodash.sample)(testTypes) }, { id: 100011, type: 'other' }, { id: 100012, type: (0, _lodash.sample)(testTypes) }]);

    setTimeout(function () {
      var writeCalls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(writeCalls.length).equal(storedEvents.size + 2);
      (0, _asFunction2.default)(writeCalls.map(function (_ref) {
        var args = _ref.args;
        return args[0] && args[0].id;
      })).containDeepOrdered([100010, 100012]);
      simulation.call.emit('end');
      done();
    }, storedEvents.size + 150);
  });
  it('stops invoking call.write() if client ends subscription', function (done) {
    var testTypes = (0, _lodash.sampleSize)(_InMemorySimulation.EVENT_TYPES.toJS(), 2);
    var storedEvents = data.events.filter(function (evt) {
      return !!~testTypes.indexOf(evt.get('type'));
    });
    var fromEventId = (0, _lodash.random)(1, storedEvents.size);
    storedEvents = storedEvents.filter(function (evt) {
      return evt.get('id') > fromEventId;
    });

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      eventTypes: testTypes,
      fromEventId: fromEventId
    };

    implementation.subscribeToEventTypesStreamFromEvent(simulation.call);

    simulation.store.publishEvents([{ id: 100010, type: (0, _lodash.sample)(testTypes) }, { id: 100011, type: 'other' }, { id: 100012, type: (0, _lodash.sample)(testTypes) }]);

    setTimeout(function () {
      simulation.call.emit('end');
      simulation.store.publishEvents([{ id: 100013, type: (0, _lodash.sample)(testTypes) }, { id: 100014, type: (0, _lodash.sample)(testTypes) }]);
    }, 200);
    setTimeout(function () {
      var calls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(calls.map(function (_ref2) {
        var args = _ref2.args;
        return args[0] && args[0].id;
      })).not.containDeepOrdered([100013, 100014]);
      done();
    }, 350);
  });
});