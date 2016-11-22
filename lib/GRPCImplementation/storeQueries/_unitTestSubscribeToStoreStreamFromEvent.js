'use strict';

var _asFunction = require('should/as-function');

var _asFunction2 = _interopRequireDefault(_asFunction);

var _lodash = require('lodash');

var _InMemorySimulation = require('../../../tests/InMemorySimulation');

var _InMemorySimulation2 = _interopRequireDefault(_InMemorySimulation);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.subscribeToStoreStreamFromEvent(call)', function () {
  it('invokes backend.getEvents() with right parameters', function () {
    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = {
      fromEventId: (0, _lodash.random)(-10, 10),
      limit: (0, _lodash.random)(-10, 10)
    };

    implementation.subscribeToStoreStreamFromEvent(simulation.call);

    var calls = simulation.backend.getEvents.getCalls();
    (0, _asFunction2.default)(calls.length).equal(1);
    (0, _asFunction2.default)(calls[0].args[0].fromEventId).equal((0, _lodash.max)([0, simulation.call.request.fromEventId]));
    (0, _asFunction2.default)(calls[0].args[0].limit).equal(undefined);
  });
  it('invokes call.write() for every fetched and live event, in the right sequence', function (done) {
    var fromEventId = data.events.size - 3;
    var storedEvents = data.events.filter(function (evt) {
      return evt.get('id') > fromEventId;
    });

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = { fromEventId: fromEventId };

    implementation.subscribeToStoreStreamFromEvent(simulation.call);
    simulation.store.publishEvents([{ id: 100010 }, { id: 100011 }, { id: 100012 }]);

    setTimeout(function () {
      var writeCalls = simulation.call.write.getCalls();
      (0, _asFunction2.default)(writeCalls.length).equal(storedEvents.size + 3);
      (0, _asFunction2.default)(writeCalls.map(function (_ref) {
        var args = _ref.args;
        return args[0] && args[0].id;
      })).containDeepOrdered([100010, 100011, 100012]);
      simulation.call.emit('end');
      done();
    }, storedEvents.size + 150);
  });
  it('stops invoking call.write() if client ends subscription', function (done) {
    var fromEventId = (0, _lodash.random)(1, data.events.size);

    var simulation = (0, _InMemorySimulation2.default)(data);
    var implementation = (0, _2.default)(simulation);

    simulation.call.request = { fromEventId: fromEventId };

    implementation.subscribeToStoreStreamFromEvent(simulation.call);
    simulation.store.publishEvents([{ id: 100010 }, { id: 100011 }, { id: 100012 }]);

    setTimeout(function () {
      simulation.call.emit('end');
      simulation.store.publishEvents([{ id: 100013 }, { id: 100014 }]);
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